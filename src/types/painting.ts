export type ToolType = 'pen' | 'eraser' | 'bucket' | 'eyedropper' | 'lasso';

export type RulerType = 'none' | 'orthogonal' | 'horizontal' | 'vertical';

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

export interface HistoryStep {
  type: 'layer' | 'selection';
  layerId?: string;
  before?: ImageData | null;
  after?: ImageData | null;
  beforePoints?: StrokePoint[];
  afterPoints?: StrokePoint[];
  beforeHasSel?: boolean;
  afterHasSel?: boolean;
  beforeInverted?: boolean;
  afterInverted?: boolean;
}

export interface ProjectData {
  version: string;
  resolution: CanvasResolution;
  eyeHeight: number;
  layers: SerializedLayer[];
  recentColors: string[];
}
