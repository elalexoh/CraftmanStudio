import { writePsd, readPsd, type Psd, type Layer as PsdLayer } from 'ag-psd';
import type { ProjectData, CanvasResolution, SerializedLayer } from '../types/painting';
import { useLayers } from './useLayers';
import { useAppState } from './useAppState';
import { usePainting } from './usePainting';
import { getActivePanoramicEngine } from '../three/PanoramicEngine';

const DB_NAME = 'gururi_paint_db';
const STORE_NAME = 'projects';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function useProjectStorage() {
  const {
    layers,
    serializeLayers,
    loadLayersFromData,
    canvasWidth,
    canvasHeight,
    activeLayerId,
    activeLayer,
    masterCanvas,
    recomposeMaster,
    recomposeMasterImmediate
  } = useLayers();
  const {
    eyeHeight,
    showGroundGrid,
    setEyeHeight,
    toggleGroundGrid,
    canvasResolution,
    setResolution,
    autoSaveEnabled,
    seamOffset
  } = useAppState();
  const { recentColors } = usePainting();

  function createProjectPayload(): ProjectData {
    return {
      version: 1,
      width: canvasWidth.value,
      height: canvasHeight.value,
      eyeHeight: eyeHeight.value,
      groundGrid: showGroundGrid.value,
      activeLayerId: activeLayerId.value,
      layers: serializeLayers(),
      recentColors: recentColors.value
    };
  }

  // Helper to apply seamOffset wrapping to any 2D canvas
  function shiftCanvas(srcCanvas: HTMLCanvasElement, width: number, height: number, offsetRatio: number): HTMLCanvasElement {
    const splitX = Math.round(width * offsetRatio);
    if (splitX === 0) return srcCanvas;

    const out = document.createElement('canvas');
    out.width = width;
    out.height = height;
    const ctx = out.getContext('2d')!;

    const part1Width = width - splitX;
    // Right part moves to left
    ctx.drawImage(srcCanvas, splitX, 0, part1Width, height, 0, 0, part1Width, height);
    // Left part moves to right
    ctx.drawImage(srcCanvas, 0, 0, splitX, height, part1Width, 0, splitX, height);
    return out;
  }

  /**
   * Export fully layered Photoshop Document (.psd) with transparent alpha channels
   * If showGroundGrid is true, exports the perspective grid as a guide layer at the bottom.
   */
  function exportPsd(customFilename?: string) {
    if (!masterCanvas) return;
    recomposeMasterImmediate();

    const width = canvasWidth.value;
    const height = canvasHeight.value;
    if (width === 0 || height === 0) return;

    const offsetRatio = seamOffset.value || 0;

    // Check if ground grid / malla should be included
    const engine = getActivePanoramicEngine();
    let gridCanvas: HTMLCanvasElement | null = null;
    if (showGroundGrid.value && engine) {
      gridCanvas = engine.renderEquirectangularGridToCanvas(width, height);
    }

    const psdChildren: PsdLayer[] = [];

    // Add Malla / Grid as bottom guide layer if active
    if (gridCanvas) {
      const gridShifted = shiftCanvas(gridCanvas, width, height, offsetRatio);
      psdChildren.push({
        name: 'Malla Guía de Perspectiva 360°',
        canvas: gridShifted,
        opacity: 1,
        hidden: false,
        left: 0,
        top: 0,
        right: width,
        bottom: height,
      });
    }

    // Add user drawing layers from bottom to top
    layers.value.forEach((layer) => {
      const layerCanvas = shiftCanvas(layer.canvas, width, height, offsetRatio);
      psdChildren.push({
        name: layer.name,
        canvas: layerCanvas,
        opacity: layer.opacity,
        hidden: !layer.visible,
        left: 0,
        top: 0,
        right: width,
        bottom: height,
      });
    });

    let compositeCanvas: HTMLCanvasElement;
    if (gridCanvas) {
      const comp = document.createElement('canvas');
      comp.width = width;
      comp.height = height;
      const cCtx = comp.getContext('2d')!;
      const gridShifted = shiftCanvas(gridCanvas, width, height, offsetRatio);
      cCtx.drawImage(gridShifted, 0, 0, width, height);
      const masterShifted = shiftCanvas(masterCanvas, width, height, offsetRatio);
      cCtx.drawImage(masterShifted, 0, 0, width, height);
      compositeCanvas = comp;
    } else {
      compositeCanvas = shiftCanvas(masterCanvas, width, height, offsetRatio);
    }

    const psd: Psd = {
      width,
      height,
      channels: 4, // RGBA
      bitsPerChannel: 8,
      colorMode: 3, // RGB
      children: psdChildren,
      canvas: compositeCanvas,
    };

    const buffer = writePsd(psd, { generateThumbnail: true });
    const blob = new Blob([buffer], { type: 'image/vnd.adobe.photoshop' });

    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const filename = customFilename || `craftsman_360_${dateStr}.psd`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.psd') ? filename : `${filename}.psd`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export flattened PNG (with white background or pure transparency)
   * If showGroundGrid is true, draws the perspective grid beneath the painting strokes.
   */
  function exportPng(customFilename?: string, includeWhiteBg: boolean = true) {
    if (!masterCanvas) return;
    recomposeMasterImmediate();

    const width = masterCanvas.width;
    const height = masterCanvas.height;
    if (width === 0 || height === 0) return;

    const offsetRatio = seamOffset.value || 0;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext('2d')!;

    if (includeWhiteBg) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }

    // Draw Malla / Grid if active
    const engine = getActivePanoramicEngine();
    if (showGroundGrid.value && engine) {
      const gridCanvas = engine.renderEquirectangularGridToCanvas(width, height);
      const gridShifted = shiftCanvas(gridCanvas, width, height, offsetRatio);
      ctx.drawImage(gridShifted, 0, 0, width, height);
    }

    const shifted = shiftCanvas(masterCanvas, width, height, offsetRatio);
    ctx.drawImage(shifted, 0, 0, width, height);

    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const filename = customFilename || `craftsman_360_${dateStr}.png`;

    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  function exportPngTransparent(customFilename?: string) {
    exportPng(customFilename, false);
  }

  function saveProjectToFile(filename?: string) {
    // Default quick export: Layered PSD
    exportPsd(filename);
  }

  /**
   * Load any supported project or illustration file:
   * - Layered PSD (.psd)
   * - Flat images (.png, .jpg, .webp, .bmp)
   * - JSON / .gururi project data
   */
  async function loadProjectFromFile(file: File): Promise<boolean> {
    try {
      const fileNameLower = file.name.toLowerCase();

      // 1. Layered Photoshop Document (.psd)
      if (fileNameLower.endsWith('.psd') || file.type === 'image/vnd.adobe.photoshop') {
        const buffer = await file.arrayBuffer();
        const psd = readPsd(buffer, { skipThumbnail: true });

        if (psd.width && psd.height) {
          const res = psd.width >= 6000 ? 8192 : psd.width >= 3000 ? 4096 : 2048;
          setResolution(res as CanvasResolution);
        }

        const width = canvasWidth.value;
        const height = canvasHeight.value;

        // If children layers exist
        if (psd.children && psd.children.length > 0) {
          const loadedLayers: SerializedLayer[] = [];
          for (let i = 0; i < psd.children.length; i++) {
            const child = psd.children[i];
            if (child.canvas) {
              const c = document.createElement('canvas');
              c.width = width;
              c.height = height;
              const ctx = c.getContext('2d')!;

              const left = child.left || 0;
              const top = child.top || 0;
              ctx.drawImage(child.canvas, left, top);

              loadedLayers.push({
                id: 'layer_' + Date.now() + '_' + i,
                name: child.name || `Capa ${i + 1}`,
                visible: !child.hidden,
                opacity: typeof child.opacity === 'number' ? child.opacity : 1,
                imageDataUrl: c.toDataURL('image/png'),
              });
            }
          }

          if (loadedLayers.length > 0) {
            await loadLayersFromData(loadedLayers, width, height);
            await saveToIndexedDB();
            return true;
          }
        }

        // If flattened composite canvas
        if (psd.canvas) {
          const c = document.createElement('canvas');
          c.width = width;
          c.height = height;
          const ctx = c.getContext('2d')!;
          ctx.drawImage(psd.canvas, 0, 0, width, height);

          await loadLayersFromData([{
            id: 'layer_' + Date.now(),
            name: file.name.replace(/\.psd$/i, '') || 'Capa 1',
            visible: true,
            opacity: 1,
            imageDataUrl: c.toDataURL('image/png'),
          }], width, height);
          await saveToIndexedDB();
          return true;
        }

        throw new Error('No readable layers in PSD file');
      }

      // 2. Standard Flat Image (PNG, JPG, WebP)
      if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/i.test(fileNameLower)) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              if (img.width > 0 && img.height > 0) {
                const res = img.width >= 6000 ? 8192 : img.width >= 3000 ? 4096 : 2048;
                setResolution(res as CanvasResolution);
              }
              const layer = activeLayer.value;
              if (layer) {
                layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
                layer.ctx.drawImage(img, 0, 0, layer.canvas.width, layer.canvas.height);
                recomposeMasterImmediate();
                saveToIndexedDB();
                resolve(true);
              } else {
                resolve(false);
              }
            };
            img.onerror = () => reject(new Error('Failed to load image element'));
            img.src = reader.result as string;
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
      }

      // 3. JSON / .gururi project file
      const text = await file.text();
      const data: ProjectData = JSON.parse(text);

      if (!data.layers || !Array.isArray(data.layers)) {
        throw new Error('Invalid project structure');
      }

      const width = data.width || 4096;
      const height = data.height || 2048;

      setResolution(width as CanvasResolution);
      if (typeof data.eyeHeight === 'number') setEyeHeight(data.eyeHeight);
      if (typeof data.groundGrid === 'boolean') toggleGroundGrid(data.groundGrid);

      await loadLayersFromData(data.layers, width, height);
      await saveToIndexedDB();
      return true;
    } catch (err) {
      console.error('Failed to load file:', err);
      return false;
    }
  }

  async function saveToIndexedDB(): Promise<void> {
    if (!autoSaveEnabled.value) return;

    try {
      const db = await openDB();
      const project = JSON.parse(JSON.stringify(createProjectPayload()));
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(project, 'current_session');
    } catch (e) {
      console.warn('Could not auto-save to IndexedDB:', e);
    }
  }

  async function loadFromIndexedDB(): Promise<boolean> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('current_session');

      return new Promise((resolve) => {
        req.onsuccess = async () => {
          const data: ProjectData = req.result;
          if (data && data.layers && data.layers.length > 0) {
            const width = data.width || 4096;
            const height = data.height || 2048;
            setResolution(width as CanvasResolution);
            if (typeof data.eyeHeight === 'number') setEyeHeight(data.eyeHeight);
            if (typeof data.groundGrid === 'boolean') toggleGroundGrid(data.groundGrid);
            await loadLayersFromData(data.layers, width, height);
            resolve(true);
          } else {
            resolve(false);
          }
        };
        req.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }

  return {
    exportPsd,
    exportPng,
    exportPngTransparent,
    saveProjectToFile,
    loadProjectFromFile,
    saveToIndexedDB,
    loadFromIndexedDB
  };
}
