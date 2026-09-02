import * as THREE from 'three';

export interface SceneManagerOptions {
  canvas: HTMLCanvasElement;
  antialias?: boolean;
}

export interface ISceneEntity {
  group: THREE.Group | THREE.Object3D;
  init(scene: THREE.Scene): void;
  update?(delta: number): void;
  dispose(): void;
}

export type LightType = 'point' | 'directional' | 'ambient';

export interface LightConfig {
  id: string;
  name: string;
  type: LightType;
  color: string;
  intensity: number;
  position: [number, number, number];
  castShadow?: boolean;
}

export type ShapeType = 'sphere' | 'cube' | 'cylinder' | 'cone' | 'torus' | 'asaro';

export interface ShapeItem {
  id: ShapeType;
  label: string;
  description: string;
}

export type SelectableTarget = 'shape' | 'light' | null;

export interface SphericalLightState {
  azimuth: number; // 0 a 360 grados
  elevation: number; // -80 a 80 grados
  distance: number; // 1 a 15 unidades
  intensity: number; // 0 a 100
  color: string; // Formato Hex '#ffffff'
}


