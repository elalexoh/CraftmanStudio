import { ref, computed } from 'vue';
import type { RulerType, StrokePoint } from '../types/painting';

const activeRuler = ref<RulerType>('none');
const strokeAnchor = ref<StrokePoint | null>(null);
const linePreviewEnd = ref<StrokePoint | null>(null);
const isSphericalCurvatureEnabled = ref<boolean>(true);
let lockedOrthogonalAxis: 'x' | 'y' | null = null;

// Radial (Vanishing Point) Center
const radialCenter = ref<StrokePoint>({ x: 2048, y: 1024 });

export function useRulers() {
  function setRuler(ruler: RulerType) {
    activeRuler.value = ruler;
    strokeAnchor.value = null;
    linePreviewEnd.value = null;
    lockedOrthogonalAxis = null;
  }

  function toggleSphericalCurvature(val?: boolean) {
    isSphericalCurvatureEnabled.value = typeof val === 'boolean' ? val : !isSphericalCurvatureEnabled.value;
  }

  function setStrokeAnchor(x: number, y: number) {
    strokeAnchor.value = { x, y };
  }

  function resetStrokeAnchor() {
    strokeAnchor.value = null;
    linePreviewEnd.value = null;
    lockedOrthogonalAxis = null;
  }

  function setLinePreviewEnd(pt: StrokePoint | null) {
    linePreviewEnd.value = pt;
  }

  function setRadialCenter(center: StrokePoint) {
    radialCenter.value = center;
    activeRuler.value = 'radial';
  }

  /**
   * Snaps a raw input point to the active ruler guide in 360 space.
   */
  function snapPoint(rawX: number, rawY: number, _canvasWidth: number, _canvasHeight: number): StrokePoint {
    if (activeRuler.value === 'none') {
      return { x: rawX, y: rawY };
    }

    // 1. Vertical Ruler: Locks azimuth/X to the initial anchor point while drawing vertically
    if (activeRuler.value === 'vertical') {
      const anchor = strokeAnchor.value || { x: rawX, y: rawY };
      return {
        x: Math.round(anchor.x),
        y: Math.round(rawY)
      };
    }

    // 2. Horizontal Ruler: Locks elevation/latitude/Y to the initial anchor point while drawing horizontally
    if (activeRuler.value === 'horizontal') {
      const anchor = strokeAnchor.value || { x: rawX, y: rawY };
      return {
        x: Math.round(rawX),
        y: Math.round(anchor.y)
      };
    }

    // 3. Radial (Vanishing point perspective) Ruler
    if (activeRuler.value === 'radial') {
      const cx = radialCenter.value.x;
      const cy = radialCenter.value.y;

      const dx = rawX - cx;
      const dy = rawY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist === 0) return { x: rawX, y: rawY };

      const angle = Math.atan2(dy, dx);
      return {
        x: Math.round(cx + Math.cos(angle) * dist),
        y: Math.round(cy + Math.sin(angle) * dist)
      };
    }

    // 4. Two-Point Straight Line Ruler
    if (activeRuler.value === 'two-point') {
      return { x: rawX, y: rawY };
    }

    // 5. Orthogonal Ruler (Auto H/V MediBang style):
    if (activeRuler.value === 'orthogonal') {
      const anchor = strokeAnchor.value || { x: rawX, y: rawY };
      const dx = rawX - anchor.x;
      const dy = rawY - anchor.y;

      if (!lockedOrthogonalAxis) {
        if (Math.hypot(dx, dy) >= 2) {
          lockedOrthogonalAxis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
        } else {
          return { x: Math.round(anchor.x), y: Math.round(anchor.y) };
        }
      }

      if (lockedOrthogonalAxis === 'x') {
        // Pure Horizontal movement (lock Y to anchor.y)
        return {
          x: Math.round(rawX),
          y: Math.round(anchor.y)
        };
      } else {
        // Pure Vertical movement (lock X to anchor.x)
        return {
          x: Math.round(anchor.x),
          y: Math.round(rawY)
        };
      }
    }

    return { x: rawX, y: rawY };
  }

  return {
    activeRuler: computed(() => activeRuler.value),
    strokeAnchor: computed(() => strokeAnchor.value),
    linePreviewEnd: computed(() => linePreviewEnd.value),
    radialCenter: computed(() => radialCenter.value),
    isSphericalCurvatureEnabled: computed(() => isSphericalCurvatureEnabled.value),
    setRuler,
    toggleSphericalCurvature,
    setStrokeAnchor,
    resetStrokeAnchor,
    setLinePreviewEnd,
    setRadialCenter,
    snapPoint
  };
}
