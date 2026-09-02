import { ref, watch } from 'vue';
import type { ToolType } from '../types/painting';
import type { HotkeyActionId, HotkeyBinding } from '../types/hotkeys';
import { usePainting } from './usePainting';
import { useLayers } from './useLayers';
import { useAppState } from './useAppState';
import { useProjectStorage } from './useProjectStorage';
import { useI18n } from './useI18n';

import { useSelection } from './useSelection';
import { useRulers } from './useRulers';

const STORAGE_KEY = 'gururi_custom_hotkeys_v1';

export const isSpaceActive = ref(false);
export const isZActive = ref(false);
export const isAltEyedropperActive = ref(false);
export const isHotkeysModalOpen = ref(false);

let previousToolBeforeAlt: ToolType | null = null;

export const defaultHotkeys: HotkeyBinding[] = [
  // Tools
  { id: 'toolPen', category: 'tools', labelKey: 'helpPen', defaultKeys: ['b', 'p', '1'], currentKeys: ['b', 'p', '1'] },
  { id: 'toolEraser', category: 'tools', labelKey: 'helpEraser', defaultKeys: ['e', '2'], currentKeys: ['e', '2'] },
  { id: 'toolBucket', category: 'tools', labelKey: 'helpBucket', defaultKeys: ['g', '3'], currentKeys: ['g', '3'] },
  { id: 'toolEyedropper', category: 'tools', labelKey: 'helpEyedropper', defaultKeys: ['i', '4'], currentKeys: ['i', '4'] },
  { id: 'toolLasso', category: 'tools', labelKey: 'lasso', defaultKeys: ['l', '5'], currentKeys: ['l', '5'] },
  { id: 'toolRuler', category: 'tools', labelKey: 'ruler', defaultKeys: ['r'], currentKeys: ['r'] },
  { id: 'eyedropperHold', category: 'tools', labelKey: 'eyedropperHold', defaultKeys: ['Alt'], currentKeys: ['Alt'] },

  // Selection & Layers
  { id: 'deselect', category: 'layers', labelKey: 'deselect', defaultKeys: ['Ctrl+d'], currentKeys: ['Ctrl+d'] },
  { id: 'invertSelection', category: 'layers', labelKey: 'invertSelection', defaultKeys: ['Ctrl+Shift+i'], currentKeys: ['Ctrl+Shift+i'] },
  { id: 'clearLayer', category: 'layers', labelKey: 'clearLayer', defaultKeys: ['Delete', 'Backspace'], currentKeys: ['Delete', 'Backspace'] },
  { id: 'newLayer', category: 'layers', labelKey: 'addLayer', defaultKeys: ['Ctrl+Shift+n'], currentKeys: ['Ctrl+Shift+n'] },
  { id: 'deleteLayer', category: 'layers', labelKey: 'deleteLayer', defaultKeys: ['Ctrl+Delete'], currentKeys: ['Ctrl+Delete'] },

  // Brush
  { id: 'brushSizeDec', category: 'brush', labelKey: 'thinner', defaultKeys: ['['], currentKeys: ['['] },
  { id: 'brushSizeInc', category: 'brush', labelKey: 'thicker', defaultKeys: [']'], currentKeys: [']'] },

  // History
  { id: 'undo', category: 'history', labelKey: 'undo', defaultKeys: ['Ctrl+z'], currentKeys: ['Ctrl+z'] },
  { id: 'redo', category: 'history', labelKey: 'redo', defaultKeys: ['Ctrl+y', 'Ctrl+Shift+z'], currentKeys: ['Ctrl+y', 'Ctrl+Shift+z'] },

  // File & View
  { id: 'saveProject', category: 'file', labelKey: 'saveProject', defaultKeys: ['Ctrl+s'], currentKeys: ['Ctrl+s'] },
  { id: 'toggleGrid', category: 'view', labelKey: 'groundGrid', defaultKeys: ['h'], currentKeys: ['h'] },

  // Navigation
  { id: 'orbitView', category: 'view', labelKey: 'helpSpaceDrag', defaultKeys: ['Space'], currentKeys: ['Space'] },
  { id: 'zoomView', category: 'view', labelKey: 'helpZDrag', defaultKeys: ['z'], currentKeys: ['z'] },
  { id: 'openHelp', category: 'view', labelKey: 'helpTitle', defaultKeys: ['F1', '?'], currentKeys: ['F1', '?'] }
];

export const userHotkeys = ref<HotkeyBinding[]>(loadHotkeysFromStorage());

function loadHotkeysFromStorage(): HotkeyBinding[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return JSON.parse(JSON.stringify(defaultHotkeys));
    }
    const saved: Record<string, string[]> = JSON.parse(raw);
    return defaultHotkeys.map(item => ({
      ...item,
      currentKeys: saved[item.id] || [...item.defaultKeys]
    }));
  } catch (e) {
    return JSON.parse(JSON.stringify(defaultHotkeys));
  }
}

function saveHotkeysToStorage() {
  try {
    const data: Record<string, string[]> = {};
    for (const item of userHotkeys.value) {
      data[item.id] = item.currentKeys;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save hotkeys to storage:', e);
  }
}

export function formatEventKey(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
  if (e.altKey && e.key !== 'Alt') parts.push('Alt');
  if (e.shiftKey && e.key !== 'Shift') parts.push('Shift');

  let keyName = e.key;
  if (e.code === 'Space') keyName = 'Space';
  else if (keyName === 'Control' || keyName === 'Shift' || keyName === 'Alt') {
    keyName = keyName === 'Control' ? 'Ctrl' : keyName;
    return keyName;
  } else if (keyName.length === 1) {
    keyName = keyName.toLowerCase();
  }

  if (!parts.includes(keyName)) {
    parts.push(keyName);
  }
  return parts.join('+');
}

export function matchesBinding(actionId: HotkeyActionId, eventStr: string, rawKey: string): boolean {
  const binding = userHotkeys.value.find(b => b.id === actionId);
  if (!binding || !binding.currentKeys) return false;

  const evLower = eventStr.trim().toLowerCase();
  const rawLower = rawKey.trim().toLowerCase();
  if (!evLower && !rawLower) return false;

  return binding.currentKeys.some(k => {
    const kLower = k.trim().toLowerCase();
    if (!kLower) return false;
    return kLower === evLower || kLower === rawLower;
  });
}

export function useHotkeys() {
  const { currentTool, setTool, setPenSize, penSize, undo, redo, clearActiveLayer } = usePainting();
  const { addLayer, deleteLayer, activeLayerId, layers } = useLayers();
  const { deselect, invertSelection } = useSelection();
  const { activeRuler, setRuler } = useRulers();
  const { toggleGroundGrid, isHelpOpen, appMode } = useAppState();
  const { saveProjectToFile } = useProjectStorage();
  const { t } = useI18n();

  function onKeyDown(e: KeyboardEvent) {
    // If configuring hotkey in modal or typing in input, ignore global triggers
    if (isHotkeysModalOpen.value || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (appMode.value !== '360') {
      return;
    }

    const eventKeyStr = formatEventKey(e);
    const rawKey = e.key;

    // Ctrl + Alt : Brush size resizing modifier
    if ((e.ctrlKey || e.metaKey) && e.altKey) {
      e.preventDefault();
      return;
    }

    // Eyedropper Hold (Alt alone) - prevent default browser menu focus and selection
    if (!e.ctrlKey && !e.metaKey && (matchesBinding('eyedropperHold', eventKeyStr, rawKey) || e.key === 'Alt' || e.code === 'AltLeft' || e.code === 'AltRight')) {
      e.preventDefault();
      if (!isAltEyedropperActive.value) {
        isAltEyedropperActive.value = true;
        previousToolBeforeAlt = currentTool.value;
        setTool('eyedropper');
      }
      return;
    }

    // View navigation: Space / Orbit
    if (matchesBinding('orbitView', eventKeyStr, rawKey) || e.code === 'Space') {
      isSpaceActive.value = true;
      e.preventDefault();
      return;
    }

    // View navigation: Z / Zoom
    if (matchesBinding('zoomView', eventKeyStr, rawKey) && !e.ctrlKey && !e.metaKey) {
      isZActive.value = true;
      return;
    }

    // Save Project: Ctrl+S
    if (matchesBinding('saveProject', eventKeyStr, rawKey)) {
      e.preventDefault();
      saveProjectToFile();
      return;
    }

    // Deselect: Ctrl+D
    if (matchesBinding('deselect', eventKeyStr, rawKey)) {
      e.preventDefault();
      deselect();
      return;
    }

    // Invert Selection: Ctrl+Shift+I
    if (matchesBinding('invertSelection', eventKeyStr, rawKey)) {
      e.preventDefault();
      invertSelection();
      return;
    }

    // New Layer: Ctrl+Shift+N
    if (matchesBinding('newLayer', eventKeyStr, rawKey)) {
      e.preventDefault();
      addLayer(t('layerName'));
      return;
    }

    // Delete Layer (Ctrl+Delete)
    if (matchesBinding('deleteLayer', eventKeyStr, rawKey) || (e.ctrlKey && e.key === 'Delete')) {
      e.preventDefault();
      if (layers.value.length > 1 && activeLayerId.value) {
        deleteLayer(activeLayerId.value);
      }
      return;
    }

    // Clear Active Layer Canvas: Delete (Supr) / Backspace
    if (matchesBinding('clearLayer', eventKeyStr, rawKey) || e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      clearActiveLayer();
      return;
    }

    // Undo: Ctrl+Z
    if (matchesBinding('undo', eventKeyStr, rawKey)) {
      e.preventDefault();
      undo();
      return;
    }

    // Redo: Ctrl+Y / Ctrl+Shift+Z
    if (matchesBinding('redo', eventKeyStr, rawKey)) {
      e.preventDefault();
      redo();
      return;
    }

    // Tools
    if (matchesBinding('toolPen', eventKeyStr, rawKey)) {
      setTool('pen');
      return;
    }

    if (matchesBinding('toolEraser', eventKeyStr, rawKey)) {
      setTool('eraser');
      return;
    }

    if (matchesBinding('toolBucket', eventKeyStr, rawKey)) {
      setTool('bucket');
      return;
    }

    if (matchesBinding('toolEyedropper', eventKeyStr, rawKey)) {
      setTool('eyedropper');
      return;
    }

    if (matchesBinding('toolLasso', eventKeyStr, rawKey)) {
      setTool('lasso');
      return;
    }

    if (matchesBinding('toolRuler', eventKeyStr, rawKey)) {
      const nextRuler = activeRuler.value === 'none'
        ? 'two-point'
        : activeRuler.value === 'two-point'
        ? 'vertical'
        : activeRuler.value === 'vertical'
        ? 'horizontal'
        : activeRuler.value === 'horizontal'
        ? 'radial'
        : 'none';
      setRuler(nextRuler);
      return;
    }

    // Brush Size Dec / Inc
    if (matchesBinding('brushSizeDec', eventKeyStr, rawKey)) {
      setPenSize(penSize.value - 1);
      return;
    }

    if (matchesBinding('brushSizeInc', eventKeyStr, rawKey)) {
      setPenSize(penSize.value + 1);
      return;
    }

    // Grid Toggle: H
    if (matchesBinding('toggleGrid', eventKeyStr, rawKey)) {
      toggleGroundGrid();
      return;
    }

    // Open Help / Shortcuts Modal: F1 / ?
    if (matchesBinding('openHelp', eventKeyStr, rawKey)) {
      e.preventDefault();
      isHelpOpen.value = !isHelpOpen.value;
      return;
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    if (isHotkeysModalOpen.value) return;

    const eventKeyStr = formatEventKey(e);
    const rawKey = e.key;

    // Release Alt -> restore previous tool before Alt
    if (matchesBinding('eyedropperHold', eventKeyStr, rawKey) || e.key === 'Alt' || e.code === 'AltLeft' || e.code === 'AltRight') {
      e.preventDefault();
      if (isAltEyedropperActive.value) {
        isAltEyedropperActive.value = false;
        if (previousToolBeforeAlt) {
          setTool(previousToolBeforeAlt);
          previousToolBeforeAlt = null;
        }
      }
    }

    if (matchesBinding('orbitView', eventKeyStr, rawKey) || e.code === 'Space') {
      isSpaceActive.value = false;
    }

    if (matchesBinding('zoomView', eventKeyStr, rawKey) || e.code === 'KeyZ') {
      isZActive.value = false;
    }
  }

  function updateBinding(actionId: HotkeyActionId, newKeys: string[]) {
    const item = userHotkeys.value.find(b => b.id === actionId);
    if (item) {
      item.currentKeys = newKeys;
      saveHotkeysToStorage();
    }
  }

  function resetAllToDefault() {
    userHotkeys.value = JSON.parse(JSON.stringify(defaultHotkeys));
    saveHotkeysToStorage();
  }

  function onContextMenu(e: MouseEvent) {
    if (e.altKey || isAltEyedropperActive.value) {
      e.preventDefault();
    }
  }

  function onWindowBlur() {
    if (isAltEyedropperActive.value) {
      isAltEyedropperActive.value = false;
      if (previousToolBeforeAlt) {
        setTool(previousToolBeforeAlt);
        previousToolBeforeAlt = null;
      } else {
        setTool('pen');
      }
    }
    isSpaceActive.value = false;
    isZActive.value = false;
  }

  function setupHotkeysListener() {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('blur', onWindowBlur);
  }

  function cleanupHotkeysListener() {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('contextmenu', onContextMenu);
    window.removeEventListener('blur', onWindowBlur);
  }

  return {
    isSpaceActive,
    isZActive,
    isAltEyedropperActive,
    isHotkeysModalOpen,
    userHotkeys,
    updateBinding,
    resetAllToDefault,
    setupHotkeysListener,
    cleanupHotkeysListener
  };
}
