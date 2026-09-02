import * as THREE from 'three';
import type { ISceneEntity } from '../types/scene';

export class GroundEntity implements ISceneEntity {
  public group: THREE.Group;
  private mesh: THREE.Mesh;
  private gridHelper: THREE.GridHelper;

  constructor() {
    this.group = new THREE.Group();

    // 1. Plano receptor de sombras proyectadas
    const geometry = new THREE.PlaneGeometry(30, 30);
    const material = new THREE.MeshStandardMaterial({
      color: 0x1f1f24,
      roughness: 0.92,
      metalness: 0.08,
      polygonOffset: true,
      polygonOffsetFactor: 2,
      polygonOffsetUnits: 2,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = -1.5;
    this.mesh.receiveShadow = true;
    this.group.add(this.mesh);

    // 2. Grilla de perspectiva (Perspectiva y líneas de fuga)
    this.gridHelper = new THREE.GridHelper(30, 30, 0x4f46e5, 0x2e2e38);
    this.gridHelper.position.y = -1.496; // Ligeramente encima del plano
    (this.gridHelper.material as THREE.Material).transparent = true;
    (this.gridHelper.material as THREE.Material).opacity = 0.65;
    this.group.add(this.gridHelper);
  }

  public init(scene: THREE.Scene): void {
    scene.add(this.group);
  }

  public setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  public setGridVisible(visible: boolean): void {
    this.gridHelper.visible = visible;
  }

  public dispose(): void {
    this.mesh.geometry.dispose();
    if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach((m) => m.dispose());
    } else {
      this.mesh.material.dispose();
    }
    this.gridHelper.geometry.dispose();
    (this.gridHelper.material as THREE.Material).dispose();
  }
}
