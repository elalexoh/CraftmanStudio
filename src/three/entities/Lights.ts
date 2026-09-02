import * as THREE from 'three';
import type { ISceneEntity } from '../types/scene';

export class LightsManager implements ISceneEntity {
  public group: THREE.Group;
  private ambientLight: THREE.AmbientLight;
  private primaryPointLight: THREE.PointLight;
  private lightHelperMesh: THREE.Mesh;
  private selectionRing: THREE.LineSegments;
  private isSelected = false;

  constructor() {
    this.group = new THREE.Group();

    // 1. Luz ambiental suave
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.18);
    this.group.add(this.ambientLight);

    // 2. Luz puntual principal
    this.primaryPointLight = new THREE.PointLight(0xffffff, 35, 25, 1.1);
    this.primaryPointLight.position.set(3.8, 3.8, 3.8);
    this.primaryPointLight.castShadow = true;

    // Configuración de sombras suaves
    this.primaryPointLight.shadow.mapSize.width = 1024;
    this.primaryPointLight.shadow.mapSize.height = 1024;
    this.primaryPointLight.shadow.camera.near = 0.5;
    this.primaryPointLight.shadow.camera.far = 30;
    this.primaryPointLight.shadow.bias = -0.0015;

    // 3. Visualizador interactivo de la luz (foco esférico)
    const helperGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const helperMat = new THREE.MeshBasicMaterial({
      color: 0xffe066,
      wireframe: false,
    });
    this.lightHelperMesh = new THREE.Mesh(helperGeo, helperMat);
    this.lightHelperMesh.userData = { selectableType: 'light' };
    this.primaryPointLight.add(this.lightHelperMesh);

    // 4. Anillo de selección estilo Blender (Outline ring)
    const ringGeo = new THREE.RingGeometry(0.24, 0.28, 32);
    const ringEdges = new THREE.EdgesGeometry(ringGeo);
    const ringMat = new THREE.LineBasicMaterial({
      color: 0xf59e0b, // Naranja estilo Blender
      linewidth: 2,
      depthTest: false,
    });
    this.selectionRing = new THREE.LineSegments(ringEdges, ringMat);
    this.selectionRing.visible = false;
    this.primaryPointLight.add(this.selectionRing);

    this.group.add(this.primaryPointLight);
  }

  public init(scene: THREE.Scene): void {
    scene.add(this.group);
  }

  public setLightPosition(x: number, y: number, z: number): void {
    this.primaryPointLight.position.set(x, y, z);
  }

  public setLightIntensity(intensity: number): void {
    this.primaryPointLight.intensity = intensity;
  }

  public setLightColor(colorHex: string | number): void {
    this.primaryPointLight.color.set(colorHex);
    // Actualizar brillo del helper
    (this.lightHelperMesh.material as THREE.MeshBasicMaterial).color.set(colorHex);
  }

  public setSelected(selected: boolean): void {
    this.isSelected = selected;
    this.selectionRing.visible = selected;
    const mat = this.lightHelperMesh.material as THREE.MeshBasicMaterial;
    if (selected) {
      mat.color.set(0xffffff);
    } else {
      mat.color.set(this.primaryPointLight.color);
    }
  }

  public update(delta: number, camera?: THREE.Camera): void {
    // Si la luz está seleccionada, orientar el anillo hacia la cámara (billboarding)
    if (this.isSelected && camera) {
      this.selectionRing.quaternion.copy(camera.quaternion);
    }
  }

  public getHelperMesh(): THREE.Mesh {
    return this.lightHelperMesh;
  }

  public getPointLight(): THREE.PointLight {
    return this.primaryPointLight;
  }

  public dispose(): void {
    this.lightHelperMesh.geometry.dispose();
    (this.lightHelperMesh.material as THREE.Material).dispose();
    this.selectionRing.geometry.dispose();
    (this.selectionRing.material as THREE.Material).dispose();
  }
}
