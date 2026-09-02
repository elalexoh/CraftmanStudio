import { ref, readonly } from 'vue';
import type { SelectableTarget } from '../three/types/scene';

const selectedTarget = ref<SelectableTarget>('shape'); // Por defecto el objeto seleccionado

export function useSelectionState() {
  const setSelection = (target: SelectableTarget) => {
    selectedTarget.value = target;
  };

  const toggleSelection = (target: SelectableTarget) => {
    if (selectedTarget.value === target) {
      selectedTarget.value = null;
    } else {
      selectedTarget.value = target;
    }
  };

  return {
    selectedTarget: readonly(selectedTarget),
    setSelection,
    toggleSelection,
  };
}
