import { ref, computed } from 'vue';
import type { RulerType, StrokePoint } from '../types/painting';

const activeRuler = ref<RulerType>('none');
const strokeAnchor = ref<StrokePoint | null>(null);

export function useRulers() {
  function setRuler(ruler: RulerType) {
    activeRuler.value = ruler;
    strokeAnchor.value = null;
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
    setStrokeAnchor,
    resetStrokeAnchor,
    snapPoint
  };
}
