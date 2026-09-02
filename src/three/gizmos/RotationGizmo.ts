import * as THREE from 'three';
import type { ISceneEntity } from '../types/scene';

export type GizmoAxis = 'x' | 'y' | 'z' | null;

export class RotationGizmo implements ISceneEntity {
  public group: THREE.Group;

  private ringX: THREE.Mesh;
  private ringY: THREE.Mesh;
  private ringZ: THREE.Mesh;

  private matX: THREE.MeshBasicMaterial;
  private matY: THREE.MeshBasicMaterial;
  private matZ: THREE.MeshBasicMaterial;

  private activeAxis: GizmoAxis = null;

  constructor(radius = 1.7, tubeRadius = 0.028) {
    this.group = new THREE.Group();
    this.group.name = 'RotationGizmoGroup';
    this.group.visible = false;

    // 1. Geometría compartida para los anillos
    const geometry = new THREE.TorusGeometry(radius, tubeRadius, 16, 64);

    // 2. Materiales con colores estándar de Blender / 3D
    // Eje X (Rojo)
    this.matX = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.65,
      depthTest: false,
    });
    this.ringX = new THREE.Mesh(geometry, this.matX);
    this.ringX.rotation.y = Math.PI / 2; // Plano YZ perpendicular al eje X
    this.ringX.renderOrder = 999;
    this.ringX.userData = { isGizmo: true, gizmoAxis: 'x' };
    this.group.add(this.ringX);

    // Eje Y (Verde)
    this.matY = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.65,
      depthTest: false,
    });
    this.ringY = new THREE.Mesh(geometry, this.matY);
    this.ringY.rotation.x = Math.PI / 2; // Plano XZ perpendicular al eje Y
    this.ringY.renderOrder = 999;
    this.ringY.userData = { isGizmo: true, gizmoAxis: 'y' };
    this.group.add(this.ringY);

    // Eje Z (Azul)
    this.matZ = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.65,
      depthTest: false,
    });
    this.ringZ = new THREE.Mesh(geometry, this.matZ); // Plano XY perpendicular al eje Z
    this.ringZ.renderOrder = 999;
    this.ringZ.userData = { isGizmo: true, gizmoAxis: 'z' };
    this.group.add(this.ringZ);
  }

  public init(scene: THREE.Scene): void {
    scene.add(this.group);
  }

  public setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  public setPosition(x: number, y: number, z: number): void {
    this.group.position.set(x, y, z);
  }

  public setHighlightAxis(axis: GizmoAxis): void {
    this.activeAxis = axis;

    this.matX.opacity = axis === 'x' ? 1.0 : axis === null ? 0.65 : 0.25;
    this.matY.opacity = axis === 'y' ? 1.0 : axis === null ? 0.65 : 0.25;
    this.matZ.opacity = axis === 'z' ? 1.0 : axis === null ? 0.65 : 0.25;
  }

  public getGizmoObjects(): THREE.Mesh[] {
    return [this.ringX, this.ringY, this.ringZ];
  }

  public dispose(): void {
    this.ringX.geometry.dispose();
    this.matX.dispose();
    this.matY.dispose();
    this.matZ.dispose();
  }
}
