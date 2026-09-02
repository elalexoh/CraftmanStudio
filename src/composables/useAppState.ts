import { ref } from 'vue';
import type { CanvasResolution } from '../types/painting';

export type AppMode = '360' | '3d-reference';

const appMode = ref<AppMode>('360');
const eyeHeight = ref<number>(1.5);
const showGroundGrid = ref<boolean>(true);
const canvasResolution = ref<CanvasResolution>(4096);
const isPreviewOpen = ref<boolean>(false);
const isHelpOpen = ref<boolean>(false);
const AUTOSAVE_STORAGE_KEY = 'gururi_autosave_v1';
const autoSaveEnabled = ref<boolean>(
  typeof localStorage !== 'undefined' ? localStorage.getItem(AUTOSAVE_STORAGE_KEY) !== 'false' : true
);
const seamOffset = ref<number>(0); // 0 to 1
const activeMobileTab = ref<'draw' | 'layer' | 'settings'>('draw');

export function useAppState() {
  function setAppMode(mode: AppMode) {
    appMode.value = mode;
  }

  function setAutoSave(enabled: boolean) {
    autoSaveEnabled.value = enabled;
    try {
      localStorage.setItem(AUTOSAVE_STORAGE_KEY, enabled ? 'true' : 'false');
    } catch (e) {}
  }

  function toggleAutoSave() {
    setAutoSave(!autoSaveEnabled.value);
  }

  function setEyeHeight(val: number) {
    eyeHeight.value = Math.max(0.5, Math.min(30, parseFloat(val.toFixed(1))));
  }

  function adjustEyeHeight(delta: number) {
    setEyeHeight(eyeHeight.value + delta);
  }

  function toggleGroundGrid(val?: boolean) {
    showGroundGrid.value = typeof val === 'boolean' ? val : !showGroundGrid.value;
  }

  function setResolution(res: CanvasResolution) {
    canvasResolution.value = res;
  }

  function setSeamOffset(offset: number) {
    seamOffset.value = Math.max(0, Math.min(1, offset));
  }

  return {
    appMode,
    eyeHeight,
    showGroundGrid,
    canvasResolution,
    isPreviewOpen,
    isHelpOpen,
    autoSaveEnabled,
    seamOffset,
    activeMobileTab,
    setAppMode,
    setEyeHeight,
    adjustEyeHeight,
    toggleGroundGrid,
    setResolution,
    setSeamOffset,
    setAutoSave,
    toggleAutoSave
  };
}

