export type HotkeyActionId =
  | 'toolPen'
  | 'toolEraser'
  | 'toolBucket'
  | 'toolEyedropper'
  | 'toolLasso'
  | 'toolRuler'
  | 'toolRulerHorizontal'
  | 'toolRulerVertical'
  | 'deselect'
  | 'invertSelection'
  | 'eyedropperHold'
  | 'brushSizeDec'
  | 'brushSizeInc'
  | 'undo'
  | 'redo'
  | 'clearLayer'
  | 'newLayer'
  | 'deleteLayer'
  | 'saveProject'
  | 'toggleGrid'
  | 'orbitView'
  | 'zoomView'
  | 'openHelp';

export interface HotkeyBinding {
  id: HotkeyActionId;
  category: 'tools' | 'brush' | 'history' | 'layers' | 'view' | 'file';
  labelKey: string;
  defaultKeys: string[]; // e.g. ['b', 'p', '1']
  currentKeys: string[]; // user configured keys
}

export type HotkeysMap = Record<HotkeyActionId, string[]>;
