import type { ProjectData, CanvasResolution } from '../types/painting';
import { useLayers } from './useLayers';
import { useAppState } from './useAppState';
import { usePainting } from './usePainting';

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
  const { serializeLayers, loadLayersFromData, canvasWidth, canvasHeight, activeLayerId, activeLayer, masterCanvas, recomposeMaster } = useLayers();
  const { eyeHeight, showGroundGrid, setEyeHeight, toggleGroundGrid, canvasResolution, setResolution, autoSaveEnabled, seamOffset } = useAppState();
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

  function exportPng(customFilename?: string) {
    if (!masterCanvas) return;

    // 1. Recompose all active layers to ensure freshest state is exported
    recomposeMaster();

    const width = masterCanvas.width;
    const height = masterCanvas.height;
    if (width === 0 || height === 0) return;

    const offsetRatio = seamOffset.value || 0;

    // 2. Create export canvas with white background
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext('2d')!;

    // Solid white base (equirectangular 360 panorama standard)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 3. Draw shifted master canvas according to seam offset
    const splitX = Math.round(width * offsetRatio);
    if (splitX === 0) {
      ctx.drawImage(masterCanvas, 0, 0, width, height);
    } else {
      const part1Width = width - splitX;
      // Right part moves to left
      ctx.drawImage(masterCanvas, splitX, 0, part1Width, height, 0, 0, part1Width, height);
      // Left part moves to right
      ctx.drawImage(masterCanvas, 0, 0, splitX, height, part1Width, 0, splitX, height);
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const filename = customFilename || `gururi_360_${dateStr}.png`;

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

  function saveProjectToFile(filename?: string) {
    // Export directly as PNG for universal compatibility and instant re-use
    exportPng(filename);
  }

  async function loadProjectFromFile(file: File): Promise<boolean> {
    try {
      // 1. If image file (PNG, JPG, WebP), load directly onto active layer
      if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/i.test(file.name)) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              if (img.width > 0 && img.height > 0) {
                const res = img.width >= 3000 ? 4096 : img.width >= 1500 ? 2048 : 1024;
                setResolution(res as CanvasResolution);
              }
              const layer = activeLayer.value;
              if (layer) {
                layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
                layer.ctx.drawImage(img, 0, 0, layer.canvas.width, layer.canvas.height);
                recomposeMaster();
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

      // 2. If JSON / .gururi project file
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

      // Auto save after load
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
      // Ensure pure plain serializable object without Vue reactive Proxies
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
    saveProjectToFile,
    loadProjectFromFile,
    exportPng,
    saveToIndexedDB,
    loadFromIndexedDB
  };
}
