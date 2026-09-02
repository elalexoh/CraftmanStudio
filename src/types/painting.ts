export type ToolType = 'pen' | 'eraser' | 'bucket' | 'eyedropper' | 'lasso' | 'ruler_line' | 'ruler_radial';

export type RulerType = 'none' | 'vertical' | 'horizontal' | 'radial';

export type Language = 'es' | 'en' | 'ja';

export type CanvasResolution = 2048 | 4096 | 8192;

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export interface SerializedLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  imageDataUrl: string;
}

export interface StrokePoint {
  x: number;
  y: number;
}

export interface TileDiff {
  tileX: number;
  tileY: number;
  before: ImageData;
  after: ImageData;
}

export interface StrokeAction {
  historyType: 'stroke';
  layerId: string;
  tool: ToolType;
  color: string;
  size: number;
  points: StrokePoint[];
  tileDiffs?: Map<string, { before: ImageData; after: ImageData }>;
}

export interface LayerHistoryAction {
  historyType: 'layer_add' | 'layer_delete' | 'layer_reorder' | 'layer_visibility' | 'layer_opacity' | 'layer_rename';
  layerId: string;
  previousState?: any;
  newState?: any;
}

export type HistoryAction = StrokeAction | LayerHistoryAction;

export interface ProjectData {
  version: number;
  width: number;
  height: number;
  eyeHeight: number;
  groundGrid: boolean;
  activeLayerId: string;
  layers: SerializedLayer[];
  recentColors?: string[];
  camera?: {
    yaw: number;
    pitch: number;
    fov: number;
  };
}

export interface ColorHSV {
  h: number; // 0 - 360
  s: number; // 0 - 100
  v: number; // 0 - 100
}
