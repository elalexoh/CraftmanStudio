import { ref, reactive, readonly } from 'vue';

export type AxonometricPreset = 'free' | 'isometric' | 'dimetric' | 'cavalier' | 'military';

export interface CameraOrientation {
  yaw: number;       // Azimut en grados [0, 360)
  pitch: number;     // Elevación en grados [-89.9, +89.9]
  roll: number;      // Inclinación lateral en grados [-180, +180]
}

export interface CameraBookmark {
  id: number;
  label: string;
  preset: AxonometricPreset;
  orientation: CameraOrientation;
}

// Valores canónicos estándar en grados
export const PRESET_CONFIGS: Record<AxonometricPreset, CameraOrientation | null> = {
  free: null,
  isometric: { yaw: 45, pitch: 35.264, roll: 0 },
  dimetric: { yaw: 26.565, pitch: 20.0, roll: 0 },
  cavalier: { yaw: 45, pitch: 0.0, roll: 0 },
  military: { yaw: 45, pitch: 45.0, roll: 0 },
};

const currentPreset = ref<AxonometricPreset>('free');
const orientation = reactive<CameraOrientation>({
  yaw: 0,
  pitch: 0,
  roll: 0,
});
const isShiftSnapActive = ref<boolean>(false);
const isPresetsPanelOpen = ref<boolean>(false);

// 4 slots de bookmarks por defecto
const bookmarks = ref<CameraBookmark[]>([
  { id: 1, label: 'Vista 1', preset: 'isometric', orientation: { yaw: 45, pitch: 35.264, roll: 0 } },
  { id: 2, label: 'Vista 2', preset: 'military', orientation: { yaw: 45, pitch: 45, roll: 0 } },
  { id: 3, label: 'Vista 3', preset: 'cavalier', orientation: { yaw: 45, pitch: 0, roll: 0 } },
  { id: 4, label: 'Vista 4', preset: 'dimetric', orientation: { yaw: 26.565, pitch: 20, roll: 0 } },
]);

// Callbacks para sincronizar con el motor 3D sin acoplar
type OrientationChangeCallback = (orientation: CameraOrientation, preset: AxonometricPreset, smooth: boolean) => void;
const orientationChangeListeners = new Set<OrientationChangeCallback>();

export function onOrientationRequested(callback: OrientationChangeCallback) {
  orientationChangeListeners.add(callback);
  return () => {
    orientationChangeListeners.delete(callback);
  };
}

export function useCameraPresets() {
  const setPreset = (preset: AxonometricPreset, smooth: boolean = true) => {
    currentPreset.value = preset;
    const config = PRESET_CONFIGS[preset];
    if (config) {
      orientation.yaw = config.yaw;
      orientation.pitch = config.pitch;
      orientation.roll = config.roll;
      orientationChangeListeners.forEach(cb => cb({ ...config }, preset, smooth));
    }
  };

  const setOrientation = (yaw: number, pitch: number, roll: number = 0, smooth: boolean = false) => {
    orientation.yaw = ((yaw % 360) + 360) % 360;
    orientation.pitch = Math.max(-89.9, Math.min(89.9, pitch));
    orientation.roll = Math.max(-180, Math.min(180, roll));
    currentPreset.value = 'free';
    orientationChangeListeners.forEach(cb => cb({ ...orientation }, 'free', smooth));
  };

  // Llamado desde el motor 3D cuando el usuario orbita manualmente
  const syncFromEngine = (yawDeg: number, pitchDeg: number, rollDeg: number = 0) => {
    orientation.yaw = ((yawDeg % 360) + 360) % 360;
    orientation.pitch = Math.max(-89.9, Math.min(89.9, pitchDeg));
    orientation.roll = Math.max(-180, Math.min(180, rollDeg));
    // Comprobar si coincide exactamente con un preset
    let matched: AxonometricPreset = 'free';
    for (const [key, val] of Object.entries(PRESET_CONFIGS)) {
      if (val && Math.abs(val.yaw - orientation.yaw) < 0.5 && Math.abs(val.pitch - orientation.pitch) < 0.5) {
        matched = key as AxonometricPreset;
        break;
      }
    }
    currentPreset.value = matched;
  };

  const saveBookmark = (slotId: number) => {
    const idx = bookmarks.value.findIndex(b => b.id === slotId);
    if (idx !== -1) {
      bookmarks.value[idx] = {
        id: slotId,
        label: `Slot ${slotId}`,
        preset: currentPreset.value,
        orientation: { ...orientation },
      };
    }
  };

  const loadBookmark = (slotId: number) => {
    const bookmark = bookmarks.value.find(b => b.id === slotId);
    if (bookmark) {
      currentPreset.value = bookmark.preset;
      orientation.yaw = bookmark.orientation.yaw;
      orientation.pitch = bookmark.orientation.pitch;
      orientation.roll = bookmark.orientation.roll;
      orientationChangeListeners.forEach(cb => cb({ ...bookmark.orientation }, bookmark.preset, true));
    }
  };

  const togglePresetsPanel = () => {
    isPresetsPanelOpen.value = !isPresetsPanelOpen.value;
  };

  const setPresetsPanelOpen = (open: boolean) => {
    isPresetsPanelOpen.value = open;
  };

  const setShiftSnap = (active: boolean) => {
    isShiftSnapActive.value = active;
  };

  return {
    currentPreset: readonly(currentPreset),
    orientation: readonly(orientation),
    bookmarks: readonly(bookmarks),
    isShiftSnapActive: readonly(isShiftSnapActive),
    isPresetsPanelOpen: readonly(isPresetsPanelOpen),
    setPreset,
    setOrientation,
    syncFromEngine,
    saveBookmark,
    loadBookmark,
    togglePresetsPanel,
    setPresetsPanelOpen,
    setShiftSnap,
  };
}
