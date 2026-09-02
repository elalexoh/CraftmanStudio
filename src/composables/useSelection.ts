import { ref, computed } from 'vue';
import type { StrokePoint, Layer } from '../types/painting';
import { useLayers } from './useLayers';

const selectionPoints = ref<StrokePoint[]>([]);
const hasSelection = ref(false);
const isDrawingLasso = ref(false);
const marchingAntsOffset = ref(0);
const isInverted = ref(false);

// Animation ticker for marching ants
let animationFrameId: number | null = null;

function startMarchingAnts() {
  if (animationFrameId !== null) return;
  const tick = () => {
    marchingAntsOffset.value = (marchingAntsOffset.value + 0.5) % 12;
    if (hasSelection.value || isDrawingLasso.value) {
      animationFrameId = requestAnimationFrame(tick);
    } else {
      animationFrameId = null;
    }
  };
  animationFrameId = requestAnimationFrame(tick);
}

function stopMarchingAnts() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

export function useSelection() {
  const { canvasWidth, canvasHeight, activeLayer, recomposeMaster } = useLayers();

  function startLasso(x: number, y: number) {
    isDrawingLasso.value = true;
    hasSelection.value = false;
    isInverted.value = false;
    selectionPoints.value = [{ x, y }];
    startMarchingAnts();
  }

  function continueLasso(rawX: number, rawY: number) {
    if (!isDrawingLasso.value) return;
    const pts = selectionPoints.value;
    const last = pts[pts.length - 1];
    if (!last) {
      pts.push({ x: rawX, y: rawY });
      return;
    }

    const w = canvasWidth.value || 4096;
    let adjustedX = rawX;
    const deltaX = adjustedX - last.x;

    // 360 seam wrap adjustment so line doesn't streak across texture
    if (deltaX < -w / 2) {
      adjustedX += w;
    } else if (deltaX > w / 2) {
      adjustedX -= w;
    }

    const dist = Math.hypot(adjustedX - last.x, rawY - last.y);
    if (dist >= 3) {
      pts.push({ x: adjustedX, y: rawY });
    }
  }

  function endLasso(): { before: StrokePoint[]; after: StrokePoint[] } | null {
    if (!isDrawingLasso.value) return null;
    isDrawingLasso.value = false;
    const pts = selectionPoints.value;
    if (pts.length >= 3) {
      hasSelection.value = true;
      startMarchingAnts();
      return { before: [], after: [...pts] };
    } else {
      hasSelection.value = false;
      selectionPoints.value = [];
      stopMarchingAnts();
      return null;
    }
  }

  function deselect() {
    hasSelection.value = false;
    isDrawingLasso.value = false;
    isInverted.value = false;
    selectionPoints.value = [];
    stopMarchingAnts();
  }

  function invertSelection() {
    if (!hasSelection.value || selectionPoints.value.length < 3) return;
    isInverted.value = !isInverted.value;
  }

  function setSelectionState(pts: StrokePoint[], hasSel: boolean, inverted: boolean = false) {
    selectionPoints.value = [...pts];
    hasSelection.value = hasSel && pts.length >= 3;
    isInverted.value = inverted;
    isDrawingLasso.value = false;
    if (hasSelection.value) {
      startMarchingAnts();
    } else {
      stopMarchingAnts();
    }
  }

  function getSelectionPath(width: number, height: number): Path2D | null {
    const pts = selectionPoints.value;
    if (pts.length < 3) return null;

    const path = new Path2D();
    if (isInverted.value) {
      // Draw outer full canvas rectangle, then subtract the inner polygon
      path.rect(0, 0, width, height);
      path.moveTo(pts[0].x, pts[0].y);
      for (let i = pts.length - 1; i >= 0; i--) {
        path.lineTo(pts[i].x, pts[i].y);
      }
      path.closePath();
    } else {
      path.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        path.lineTo(pts[i].x, pts[i].y);
      }
      path.closePath();
    }
    return path;
  }

  function applySelectionClip(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!hasSelection.value) return;
    const path = getSelectionPath(width, height);
    if (path) {
      ctx.clip(path, isInverted.value ? 'evenodd' : 'nonzero');
    }
  }

  function clearInsideSelection(layer: Layer, onHistoryRecorded?: (before: ImageData, after: ImageData) => void) {
    if (!hasSelection.value || !layer) return;
    const w = layer.canvas.width;
    const h = layer.canvas.height;
    const before = layer.ctx.getImageData(0, 0, w, h);

    layer.ctx.save();
    applySelectionClip(layer.ctx, w, h);
    layer.ctx.clearRect(0, 0, w, h);
    layer.ctx.restore();

    const after = layer.ctx.getImageData(0, 0, w, h);
    if (onHistoryRecorded) {
      onHistoryRecorded(before, after);
    }
    recomposeMaster();
  }

  return {
    selectionPoints: computed(() => selectionPoints.value),
    hasSelection: computed(() => hasSelection.value),
    isDrawingLasso: computed(() => isDrawingLasso.value),
    isInverted: computed(() => isInverted.value),
    marchingAntsOffset: computed(() => marchingAntsOffset.value),
    startLasso,
    continueLasso,
    endLasso,
    deselect,
    invertSelection,
    setSelectionState,
    applySelectionClip,
    clearInsideSelection,
    getSelectionPath
  };
}
