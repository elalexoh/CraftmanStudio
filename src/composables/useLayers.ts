import { ref, computed } from 'vue';
import type { Layer, SerializedLayer, CanvasResolution } from '../types/painting';

const canvasWidth = ref<number>(4096);
const canvasHeight = ref<number>(2048);

// Master composite canvas used as Three.js texture
const masterCanvas = document.createElement('canvas');
masterCanvas.width = canvasWidth.value;
masterCanvas.height = canvasHeight.value;
const masterCtx = masterCanvas.getContext('2d', { willReadFrequently: true })!;

const layers = ref<Layer[]>([]);
const activeLayerId = ref<string>('');

// Callbacks for texture updates
const updateListeners: Array<() => void> = [];

export function onCanvasUpdated(cb: () => void) {
  updateListeners.push(cb);
  return () => {
    const idx = updateListeners.indexOf(cb);
    if (idx !== -1) updateListeners.splice(idx, 1);
  };
}

function notifyCanvasUpdated() {
  updateListeners.forEach(cb => cb());
}

export function useLayers() {
  function createLayerCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    return { canvas, ctx };
  }

  function initDefaultLayers(defaultName: string = 'Layer') {
    if (layers.value.length > 0) return;
    const { canvas, ctx } = createLayerCanvas(canvasWidth.value, canvasHeight.value);
    const firstLayer: Layer = {
      id: 'layer_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: `${defaultName} 1`,
      visible: true,
      opacity: 1,
      canvas,
      ctx
    };
    layers.value = [firstLayer];
    activeLayerId.value = firstLayer.id;
    recomposeMaster();
  }

  let isRecomposePending = false;

  function recomposeMasterImmediate() {
    isRecomposePending = false;
    masterCtx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);
    // Draw from bottom (index 0) to top
    for (const layer of layers.value) {
      if (layer.visible && layer.opacity > 0) {
        masterCtx.save();
        masterCtx.globalAlpha = layer.opacity;
        masterCtx.drawImage(layer.canvas, 0, 0);
        masterCtx.restore();
      }
    }
    notifyCanvasUpdated();
  }

  function recomposeMaster() {
    if (isRecomposePending) return;
    isRecomposePending = true;
    requestAnimationFrame(recomposeMasterImmediate);
  }

  function addLayer(name?: string, index?: number): Layer {
    const { canvas, ctx } = createLayerCanvas(canvasWidth.value, canvasHeight.value);
    const newLayer: Layer = {
      id: 'layer_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name || `Layer ${layers.value.length + 1}`,
      visible: true,
      opacity: 1,
      canvas,
      ctx
    };

    if (typeof index === 'number' && index >= 0 && index <= layers.value.length) {
      layers.value.splice(index, 0, newLayer);
    } else {
      const activeIdx = layers.value.findIndex(l => l.id === activeLayerId.value);
      if (activeIdx !== -1) {
        layers.value.splice(activeIdx + 1, 0, newLayer);
      } else {
        layers.value.push(newLayer);
      }
    }

    activeLayerId.value = newLayer.id;
    recomposeMaster();
    return newLayer;
  }

  function deleteLayer(id: string): boolean {
    if (layers.value.length <= 1) return false;
    const idx = layers.value.findIndex(l => l.id === id);
    if (idx === -1) return false;

    layers.value.splice(idx, 1);
    if (activeLayerId.value === id) {
      const nextIdx = Math.max(0, idx - 1);
      activeLayerId.value = layers.value[nextIdx]?.id || '';
    }
    recomposeMaster();
    return true;
  }

  function moveLayer(fromIndex: number, toIndex: number) {
    if (fromIndex < 0 || fromIndex >= layers.value.length || toIndex < 0 || toIndex >= layers.value.length) return;
    const [moved] = layers.value.splice(fromIndex, 1);
    layers.value.splice(toIndex, 0, moved);
    recomposeMaster();
  }

  function setLayerOpacity(id: string, opacity: number) {
    const layer = layers.value.find(l => l.id === id);
    if (layer) {
      layer.opacity = Math.max(0, Math.min(1, opacity));
      recomposeMaster();
    }
  }

  function toggleLayerVisibility(id: string) {
    const layer = layers.value.find(l => l.id === id);
    if (layer) {
      layer.visible = !layer.visible;
      recomposeMaster();
    }
  }

  function renameLayer(id: string, newName: string) {
    const layer = layers.value.find(l => l.id === id);
    if (layer && newName.trim()) {
      layer.name = newName.trim();
    }
  }

  function setCanvasResolution(resolution: CanvasResolution) {
    const newWidth = resolution;
    const newHeight = resolution / 2;

    if (canvasWidth.value === newWidth && canvasHeight.value === newHeight) return;

    masterCanvas.width = newWidth;
    masterCanvas.height = newHeight;

    for (const layer of layers.value) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = layer.canvas.width;
      tempCanvas.height = layer.canvas.height;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.drawImage(layer.canvas, 0, 0);

      layer.canvas.width = newWidth;
      layer.canvas.height = newHeight;
      layer.ctx = layer.canvas.getContext('2d', { willReadFrequently: true })!;
      layer.ctx.imageSmoothingEnabled = true;
      layer.ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
    }

    canvasWidth.value = newWidth;
    canvasHeight.value = newHeight;
    recomposeMaster();
  }

  async function loadLayersFromData(serializedLayers: SerializedLayer[], width: number, height: number): Promise<void> {
    canvasWidth.value = width;
    canvasHeight.value = height;
    masterCanvas.width = width;
    masterCanvas.height = height;

    const newLayers: Layer[] = [];

    for (const sLayer of serializedLayers) {
      const { canvas, ctx } = createLayerCanvas(width, height);
      if (sLayer.imageDataUrl) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = sLayer.imageDataUrl;
        });
      }

      newLayers.push({
        id: sLayer.id || ('layer_' + Math.random().toString(36).substring(2, 6)),
        name: sLayer.name,
        visible: sLayer.visible !== false,
        opacity: typeof sLayer.opacity === 'number' ? sLayer.opacity : 1,
        canvas,
        ctx
      });
    }

    layers.value = newLayers.length > 0 ? newLayers : [];
    if (layers.value.length === 0) {
      initDefaultLayers();
    } else {
      activeLayerId.value = layers.value[layers.value.length - 1].id;
    }
    recomposeMaster();
  }

  function serializeLayers(): SerializedLayer[] {
    return layers.value.map(layer => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      opacity: layer.opacity,
      imageDataUrl: layer.canvas.toDataURL('image/png')
    }));
  }

  const activeLayer = computed(() => layers.value.find(l => l.id === activeLayerId.value) || layers.value[0]);

  return {
    masterCanvas,
    masterCtx,
    canvasWidth: computed(() => canvasWidth.value),
    canvasHeight: computed(() => canvasHeight.value),
    layers: computed(() => layers.value),
    activeLayerId,
    activeLayer,
    initDefaultLayers,
    addLayer,
    deleteLayer,
    moveLayer,
    setLayerOpacity,
    toggleLayerVisibility,
    renameLayer,
    recomposeMaster,
    recomposeMasterImmediate,
    setCanvasResolution,
    loadLayersFromData,
    serializeLayers
  };
}
