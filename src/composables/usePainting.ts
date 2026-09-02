import { ref, computed } from 'vue';
import type { ToolType, StrokePoint, HistoryAction } from '../types/painting';
import { useLayers } from './useLayers';
import { useSelection } from './useSelection';
import { useRulers } from './useRulers';

const TOOL_SIZES_STORAGE_KEY = 'gururi_tool_sizes_v1';

function loadToolSizesFromStorage(): Record<ToolType, number> {
  const defaults: Record<ToolType, number> = {
    pen: 3,
    eraser: 15,
    bucket: 1,
    eyedropper: 1,
    lasso: 1,
    ruler_line: 3,
    ruler_radial: 3
  };
  try {
    const raw = localStorage.getItem(TOOL_SIZES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed };
    }
  } catch (e) {
    // fallback
  }
  return defaults;
}

function saveToolSizesToStorage(sizes: Record<ToolType, number>) {
  try {
    localStorage.setItem(TOOL_SIZES_STORAGE_KEY, JSON.stringify(sizes));
  } catch (e) {
    console.warn('Could not save tool sizes to localStorage:', e);
  }
}

const currentTool = ref<ToolType>('pen');
const toolSizes = ref<Record<ToolType, number>>(loadToolSizesFromStorage());
const penColor = ref<string>('#000000');
const recentColors = ref<string[]>(['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00']);

type HistoryStep =
  | { type: 'layer'; layerId: string; before: ImageData; after: ImageData }
  | { type: 'selection'; beforePoints: StrokePoint[]; afterPoints: StrokePoint[]; beforeHasSel: boolean; afterHasSel: boolean; beforeInverted: boolean; afterInverted: boolean };

const strokeHistory = ref<HistoryStep[]>([]);
const redoHistory = ref<HistoryStep[]>([]);

let currentStrokePoints: StrokePoint[] = [];
let isPainting = false;
let beforeImageData: ImageData | null = null;
let lastX = 0;
let lastY = 0;
let lastMidX = 0;
let lastMidY = 0;

export function usePainting() {
  const { layers, activeLayer, recomposeMaster, masterCtx, canvasWidth, canvasHeight } = useLayers();
  const { hasSelection, startLasso, continueLasso, endLasso, setSelectionState, applySelectionClip, clearInsideSelection } = useSelection();
  const { snapPoint, setStrokeAnchor, resetStrokeAnchor } = useRulers();

  const currentSize = computed(() => toolSizes.value[currentTool.value] || 3);

  function setTool(tool: ToolType) {
    currentTool.value = tool;
  }

  function setPenSize(size: number) {
    const val = Math.max(1, Math.min(50, Math.round(size)));
    toolSizes.value[currentTool.value] = val;
    saveToolSizesToStorage(toolSizes.value);
  }

  function setPenColor(color: string) {
    penColor.value = color;
    rememberColor(color);
  }

  function rememberColor(color: string) {
    if (!color) return;
    const lower = color.toLowerCase();
    const filtered = recentColors.value.filter(c => c.toLowerCase() !== lower);
    filtered.unshift(lower);
    if (filtered.length > 12) filtered.pop();
    recentColors.value = filtered;
  }

  function drawDotWithWrap(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, width: number) {
    const radius = size / 2;
    // Center dot
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Left wrap
    if (x - radius < 0) {
      ctx.beginPath();
      ctx.arc(x + width, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    // Right wrap
    if (x + radius > width) {
      ctx.beginPath();
      ctx.arc(x - width, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function startStroke(rawX: number, rawY: number) {
    // 1. Lasso Tool Handling
    if (currentTool.value === 'lasso') {
      startLasso(rawX, rawY);
      return;
    }

    const layer = activeLayer.value;
    if (!layer || !layer.visible) return;

    // Apply Ruler Snapping if active
    setStrokeAnchor(rawX, rawY);
    const snapped = snapPoint(rawX, rawY, layer.canvas.width, layer.canvas.height);
    const pixelX = snapped.x;
    const pixelY = snapped.y;

    // Save before-state snapshot for undo
    try {
      beforeImageData = layer.ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
    } catch (e) {
      beforeImageData = null;
    }

    if (currentTool.value === 'bucket') {
      floodFill(pixelX, pixelY, penColor.value);
      return;
    }

    if (currentTool.value === 'eyedropper') {
      pickColor(pixelX, pixelY);
      return;
    }

    isPainting = true;
    currentStrokePoints = [{ x: pixelX, y: pixelY }];
    lastX = pixelX;
    lastY = pixelY;
    lastMidX = pixelX;
    lastMidY = pixelY;

    const width = layer.canvas.width;
    const height = layer.canvas.height;
    const ctx = layer.ctx;
    ctx.save();

    // Clip to active selection
    if (hasSelection.value) {
      applySelectionClip(ctx, width, height);
    }

    if (currentTool.value === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = penColor.value;
    }

    drawDotWithWrap(ctx, pixelX, pixelY, currentSize.value, width);
    ctx.restore();

    recomposeMaster();
  }

  function continueStroke(rawX: number, rawY: number) {
    // 1. Lasso Tool Handling
    if (currentTool.value === 'lasso') {
      continueLasso(rawX, rawY);
      return;
    }

    if (!isPainting) return;
    const layer = activeLayer.value;
    if (!layer || !layer.visible) return;

    if (currentTool.value === 'bucket') return;

    // Apply Ruler Snapping if active
    const snapped = snapPoint(rawX, rawY, layer.canvas.width, layer.canvas.height);
    const pixelX = snapped.x;
    const pixelY = snapped.y;

    if (currentTool.value === 'eyedropper') {
      pickColor(pixelX, pixelY);
      return;
    }

    const width = layer.canvas.width;
    const height = layer.canvas.height;
    let adjustedX = pixelX;
    const deltaX = adjustedX - lastX;

    // 360 Seam wrap adjustment
    if (deltaX < -width / 2) {
      adjustedX += width;
    } else if (deltaX > width / 2) {
      adjustedX -= width;
    }

    const midX = (lastX + adjustedX) / 2;
    const midY = (lastY + pixelY) / 2;

    const ctx = layer.ctx;
    ctx.save();

    // Clip to active selection
    if (hasSelection.value) {
      applySelectionClip(ctx, width, height);
    }

    if (currentTool.value === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor.value;
    }

    ctx.lineWidth = currentSize.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Center curve
    ctx.beginPath();
    ctx.moveTo(lastMidX, lastMidY);
    ctx.quadraticCurveTo(lastX, lastY, midX, midY);
    ctx.stroke();

    // 2. Left copy (-width)
    ctx.beginPath();
    ctx.moveTo(lastMidX - width, lastMidY);
    ctx.quadraticCurveTo(lastX - width, lastY, midX - width, midY);
    ctx.stroke();

    // 3. Right copy (+width)
    ctx.beginPath();
    ctx.moveTo(lastMidX + width, lastMidY);
    ctx.quadraticCurveTo(lastX + width, lastY, midX + width, midY);
    ctx.stroke();

    ctx.restore();

    lastMidX = midX;
    lastMidY = midY;
    lastX = adjustedX;
    lastY = pixelY;

    // Normalize coordinates into canvas range [0, width)
    if (lastX < 0) {
      lastX += width;
      lastMidX += width;
    } else if (lastX >= width) {
      lastX -= width;
      lastMidX -= width;
    }

    currentStrokePoints.push({ x: pixelX, y: pixelY });
    recomposeMaster();
  }

  function endStroke() {
    if (currentTool.value === 'lasso') {
      const res = endLasso();
      if (res) {
        strokeHistory.value.push({
          type: 'selection',
          beforePoints: res.before,
          afterPoints: res.after,
          beforeHasSel: false,
          afterHasSel: true,
          beforeInverted: false,
          afterInverted: false
        });
        redoHistory.value = [];
      }
      return;
    }

    if (!isPainting) return;
    isPainting = false;

    const layer = activeLayer.value;
    if (layer && beforeImageData) {
      try {
        const afterImageData = layer.ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
        strokeHistory.value.push({
          type: 'layer',
          layerId: layer.id,
          before: beforeImageData,
          after: afterImageData
        });
        redoHistory.value = []; // Clear redo on new action
        // Limit history size to 30 steps to prevent memory bloat
        if (strokeHistory.value.length > 30) {
          strokeHistory.value.shift();
        }
      } catch (e) {
        console.warn('Could not record history step:', e);
      }
    }

    currentStrokePoints = [];
    beforeImageData = null;
    resetStrokeAnchor();
    recomposeMaster();
  }

  function pickColor(pixelX: number, pixelY: number) {
    if (!masterCanvas || !masterCtx) return;
    const clampedX = Math.max(0, Math.min(masterCanvas.width - 1, Math.floor(pixelX)));
    const clampedY = Math.max(0, Math.min(masterCanvas.height - 1, Math.floor(pixelY)));

    // Ensure freshest canvas composition before sampling
    recomposeMaster();

    const pixelData = masterCtx.getImageData(clampedX, clampedY, 1, 1).data;
    const [r, g, b, a] = pixelData;

    // Ignore transparent or unpainted clicks
    if (a === 0) return;

    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    setPenColor(hex);
  }

  function floodFill(startX: number, startY: number, fillColor: string) {
    const layer = activeLayer.value;
    if (!layer || !layer.visible) return;

    const width = layer.canvas.width;
    const height = layer.canvas.height;
    const ctx = layer.ctx;

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const clampedX = Math.max(0, Math.min(width - 1, Math.floor(startX)));
    const clampedY = Math.max(0, Math.min(height - 1, Math.floor(startY)));
    const startIndex = (clampedY * width + clampedX) * 4;

    const targetR = data[startIndex];
    const targetG = data[startIndex + 1];
    const targetB = data[startIndex + 2];
    const targetA = data[startIndex + 3];

    // Parse fill color hex
    const dummyCanvas = document.createElement('canvas');
    dummyCanvas.width = 1;
    dummyCanvas.height = 1;
    const dummyCtx = dummyCanvas.getContext('2d')!;
    dummyCtx.fillStyle = fillColor;
    dummyCtx.fillRect(0, 0, 1, 1);
    const fillData = dummyCtx.getImageData(0, 0, 1, 1).data;
    const [fillR, fillG, fillB, fillA] = fillData;

    if (targetR === fillR && targetG === fillG && targetB === fillB && targetA === fillA) {
      return;
    }

    const matchTarget = (idx: number) => {
      return (
        Math.abs(data[idx] - targetR) <= 15 &&
        Math.abs(data[idx + 1] - targetG) <= 15 &&
        Math.abs(data[idx + 2] - targetB) <= 15 &&
        Math.abs(data[idx + 3] - targetA) <= 15
      );
    };

    const queue: [number, number][] = [[clampedX, clampedY]];
    const visited = new Uint8Array(width * height);

    while (queue.length > 0) {
      const [x, y] = queue.pop()!;
      const idx = (y * width + x) * 4;
      const vIdx = y * width + x;

      if (visited[vIdx]) continue;
      visited[vIdx] = 1;

      if (!matchTarget(idx)) continue;

      data[idx] = fillR;
      data[idx + 1] = fillG;
      data[idx + 2] = fillB;
      data[idx + 3] = fillA;

      // 360 wrap on horizontal edges
      const leftX = (x - 1 + width) % width;
      const rightX = (x + 1) % width;

      if (!visited[y * width + leftX]) queue.push([leftX, y]);
      if (!visited[y * width + rightX]) queue.push([rightX, y]);
      if (y > 0 && !visited[(y - 1) * width + x]) queue.push([x, y - 1]);
      if (y < height - 1 && !visited[(y + 1) * width + x]) queue.push([x, y + 1]);
    }

    ctx.putImageData(imgData, 0, 0);

    if (beforeImageData) {
      const afterImageData = ctx.getImageData(0, 0, width, height);
      strokeHistory.value.push({
        type: 'layer',
        layerId: layer.id,
        before: beforeImageData,
        after: afterImageData
      });
      redoHistory.value = [];
      beforeImageData = null;
    }

    recomposeMaster();
  }

  function undo() {
    if (strokeHistory.value.length === 0) return;
    const step = strokeHistory.value.pop()!;
    redoHistory.value.push(step);

    if (step.type === 'selection') {
      setSelectionState(step.beforePoints, step.beforeHasSel, step.beforeInverted);
      return;
    }

    const layer = layers.value.find(l => l.id === step.layerId);
    if (layer) {
      layer.ctx.putImageData(step.before, 0, 0);
      recomposeMaster();
    }
  }

  function redo() {
    if (redoHistory.value.length === 0) return;
    const step = redoHistory.value.pop()!;
    strokeHistory.value.push(step);

    if (step.type === 'selection') {
      setSelectionState(step.afterPoints, step.afterHasSel, step.afterInverted);
      return;
    }

    const layer = layers.value.find(l => l.id === step.layerId);
    if (layer) {
      layer.ctx.putImageData(step.after, 0, 0);
      recomposeMaster();
    }
  }

  function clearActiveLayer() {
    const layer = activeLayer.value;
    if (!layer) return;

    if (hasSelection.value) {
      clearInsideSelection(layer, (before, after) => {
        strokeHistory.value.push({
          type: 'layer',
          layerId: layer.id,
          before,
          after
        });
        redoHistory.value = [];
      });
      return;
    }

    const width = layer.canvas.width;
    const height = layer.canvas.height;
    const before = layer.ctx.getImageData(0, 0, width, height);
    layer.ctx.clearRect(0, 0, width, height);
    const after = layer.ctx.getImageData(0, 0, width, height);
    strokeHistory.value.push({
      type: 'layer',
      layerId: layer.id,
      before,
      after
    });
    redoHistory.value = [];
    recomposeMaster();
  }

  return {
    currentTool: computed(() => currentTool.value),
    penSize: currentSize,
    penColor: computed(() => penColor.value),
    recentColors: computed(() => recentColors.value),
    canUndo: computed(() => strokeHistory.value.length > 0),
    canRedo: computed(() => redoHistory.value.length > 0),
    setTool,
    setPenSize,
    setPenColor,
    rememberColor,
    startStroke,
    continueStroke,
    endStroke,
    clearActiveLayer,
    undo,
    redo,
    floodFill,
    pickColor
  };
}
