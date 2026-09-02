import { ref, readonly } from 'vue';

export interface RotationEuler {
  x: number;
  y: number;
  z: number;
}

export type CanonicalView = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';

const currentRotation = ref<RotationEuler>({ x: 0, y: 0, z: 0 });
const deltaRotationTrigger = ref<{ dx: number; dy: number; dz: number } | null>(null);
const snapViewTrigger = ref<CanonicalView | null>(null);
const resetRotationTrigger = ref(0);

export function useRotationState() {
  const setRotation = (x: number, y: number, z: number) => {
    currentRotation.value = { x, y, z };
  };

  const applyDelta = (dx: number, dy: number, dz: number) => {
    deltaRotationTrigger.value = { dx, dy, dz };
  };

  const snapTo = (view: CanonicalView) => {
    snapViewTrigger.value = view;
  };

  const resetRotation = () => {
    resetRotationTrigger.value++;
    currentRotation.value = { x: 0, y: 0, z: 0 };
  };

  return {
    currentRotation: readonly(currentRotation),
    deltaRotationTrigger: readonly(deltaRotationTrigger),
    snapViewTrigger: readonly(snapViewTrigger),
    resetRotationTrigger: readonly(resetRotationTrigger),
    setRotation,
    applyDelta,
    snapTo,
    resetRotation,
  };
}
