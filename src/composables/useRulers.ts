import { ref, computed } from 'vue';
import type { RulerType, StrokePoint } from '../types/painting';

const activeRuler = ref<RulerType>('none');
const strokeAnchor = ref<StrokePoint | null>(null);

export function useRulers() {
  function setRuler(ruler: RulerType) {
    activeRuler.value = ruler;
    strokeAnchor.value = null;
  }

  function cycleRuler(): RulerType {
    const next: Record<RulerType, RulerType> = {
      none: 'orthogonal',
      orthogonal: 'horizontal',
      horizontal: 'vertical',
      vertical: 'none',
    };
    const nextMode = next[activeRuler.value] || 'none';
    setRuler(nextMode);
    return nextMode;
  }

  function toggleRulerMode(mode: 'orthogonal' | 'horizontal' | 'vertical'): RulerType {
    const nextMode = activeRuler.value === mode ? 'none' : mode;
    setRuler(nextMode);
    return nextMode;
  }

  function setStrokeAnchor(x: number, y: number) {
    strokeAnchor.value = { x, y };
  }

  function resetStrokeAnchor() {
    strokeAnchor.value = null;
  }

  function snapPoint(rawX: number, rawY: number, _canvasWidth: number, _canvasHeight: number): StrokePoint {
    return { x: Math.round(rawX), y: Math.round(rawY) };
  }

  return {
    activeRuler: computed(() => activeRuler.value),
    strokeAnchor: computed(() => strokeAnchor.value),
    setRuler,
    cycleRuler,
    toggleRulerMode,
    setStrokeAnchor,
    resetStrokeAnchor,
    snapPoint
  };
}
