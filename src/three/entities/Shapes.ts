import * as THREE from 'three';
import type { ISceneEntity, ShapeType } from '../types/scene';
import { createAsaroHeadGeometry } from '../geometries/AsaroHeadGeometry';

/**
 * Genera una geometría con normales suaves / unificadas en las esquinas y aristas duras.
 * Esto evita que el casco invertido de silueta se desgarre o abra huecos en cubos y poliedros.
 */
function createSmoothOutlineGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  const smoothGeo = geometry.clone();
  const posAttr = smoothGeo.getAttribute('position');
  const normalAttr = smoothGeo.getAttribute('normal');
  if (!posAttr) return smoothGeo;

  const posMap = new Map<string, THREE.Vector3>();
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();

  // 1. Acumular normales coincidentes por posición espacial
  for (let i = 0; i < posAttr.count; i++) {
    p.fromBufferAttribute(posAttr, i);
    const key = `${p.x.toFixed(3)},${p.y.toFixed(3)},${p.z.toFixed(3)}`;

    if (normalAttr) {
      n.fromBufferAttribute(normalAttr, i);
    } else {
      n.copy(p).normalize();
    }

    if (!posMap.has(key)) {
      posMap.set(key, new THREE.Vector3());
    }
    posMap.get(key)!.add(n);
  }

  // 2. Normalizar las normales promediadas
  posMap.forEach((vec) => vec.normalize());

  // 3. Asignar las nuevas normales continuas
  const newNormals = new Float32Array(posAttr.count * 3);
  for (let i = 0; i < posAttr.count; i++) {
    p.fromBufferAttribute(posAttr, i);
    const key = `${p.x.toFixed(3)},${p.y.toFixed(3)},${p.z.toFixed(3)}`;
    const avgNormal = posMap.get(key) || new THREE.Vector3(0, 1, 0);
    newNormals[i * 3] = avgNormal.x;
    newNormals[i * 3 + 1] = avgNormal.y;
    newNormals[i * 3 + 2] = avgNormal.z;
  }

  smoothGeo.setAttribute('normal', new THREE.BufferAttribute(newNormals, 3));
  return smoothGeo;
}

export class ShapesManager implements ISceneEntity {
  public group: THREE.Group;
  private currentMesh: THREE.Mesh;

  // 1. Grilla / Estructura interna del objeto (Wireframe)
  private wireframeLines: THREE.LineSegments;
  private wireframeMaterial: THREE.LineBasicMaterial;

  // 2. Lineart / Contorno Blanco (Silueta Cartoon y Aristas duras)
  private lineartEdges: THREE.LineSegments;
  private silhouetteMesh: THREE.Mesh;
  private lineartMaterial: THREE.LineBasicMaterial;
  private silhouetteMaterial: THREE.ShaderMaterial;

  private smoothMaterial: THREE.MeshStandardMaterial;
  private flatMaterial: THREE.MeshStandardMaterial;

  private currentShapeType: ShapeType = 'sphere';
  private isSelected = false;

  // Nivel del suelo
  private readonly FLOOR_Y = -1.5;
  private currentCenterY = -0.3;

  constructor() {
    this.group = new THREE.Group();

    // Materiales de malla con polygonOffset
    this.smoothMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      roughness: 0.75,
      metalness: 0.05,
      flatShading: false,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });

    this.flatMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      roughness: 0.75,
      metalness: 0.05,
      flatShading: true,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });

    // Malla principal (en el origen local 0,0,0)
    this.currentMesh = new THREE.Mesh();
    this.currentMesh.userData = { selectableType: 'shape' };
    this.currentMesh.position.set(0, 0, 0);
    this.group.add(this.currentMesh);

    // 1. Grilla / Estructura del Objeto (Wireframe sutil)
    this.wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.35,
      depthTest: true,
    });
    this.wireframeLines = new THREE.LineSegments(new THREE.BufferGeometry(), this.wireframeMaterial);
    this.wireframeLines.position.set(0, 0, 0);
    this.group.add(this.wireframeLines);

    // 2. Lineart Blanco de Aristas Estructurales
    this.lineartMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      depthTest: true,
    });
    this.lineartEdges = new THREE.LineSegments(new THREE.BufferGeometry(), this.lineartMaterial);
    this.lineartEdges.position.set(0, 0, 0);
    this.group.add(this.lineartEdges);

    // 3. Silueta Exterior Cartoon con Extrusión en View-Space (Trazo Blanco)
    this.silhouetteMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uThickness: { value: 0.05 },
        uColor: { value: new THREE.Color(0xffffff) },
        uOpacity: { value: 0.95 },
      },
      vertexShader: `
        uniform float uThickness;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vec3 transformedNormal = normalize(normalMatrix * normal);
          mvPosition.xy += transformedNormal.xy * uThickness;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        void main() {
          gl_FragColor = vec4(uColor, uOpacity);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthTest: true,
    });

    this.silhouetteMesh = new THREE.Mesh(new THREE.BufferGeometry(), this.silhouetteMaterial);
    this.silhouetteMesh.position.set(0, 0, 0);
    this.group.add(this.silhouetteMesh);

    this.setShape('sphere');
  }

  public init(scene: THREE.Scene): void {
    scene.add(this.group);
  }

  public setShape(type: ShapeType): void {
    this.currentShapeType = type;

    // Liberar geometrías anteriores
    if (this.currentMesh.geometry) {
      this.currentMesh.geometry.dispose();
    }
    if (this.wireframeLines.geometry) {
      this.wireframeLines.geometry.dispose();
    }
    if (this.lineartEdges.geometry) {
      this.lineartEdges.geometry.dispose();
    }
    if (this.silhouetteMesh.geometry) {
      this.silhouetteMesh.geometry.dispose();
    }

    let geometry: THREE.BufferGeometry;
    let material = this.smoothMaterial;
    let edgeThreshold = 20;

    switch (type) {
      case 'cube':
        geometry = new THREE.BoxGeometry(2.0, 2.0, 2.0, 4, 4, 4);
        material = this.flatMaterial;
        edgeThreshold = 35;
        break;

      case 'cylinder':
        geometry = new THREE.CylinderGeometry(1.0, 1.0, 2.4, 24, 8);
        edgeThreshold = 25;
        break;

      case 'cone':
        geometry = new THREE.ConeGeometry(1.2, 2.4, 24, 8);
        edgeThreshold = 25;
        break;

      case 'torus':
        geometry = new THREE.TorusGeometry(1.1, 0.45, 16, 32);
        edgeThreshold = 180;
        break;

      case 'asaro':
        geometry = createAsaroHeadGeometry();
        material = this.flatMaterial;
        edgeThreshold = 15;
        break;

      case 'sphere':
      default:
        geometry = new THREE.SphereGeometry(1.2, 32, 24);
        edgeThreshold = 180;
        break;
    }

    // 1. Centrar la geometría en sus ejes locales para un pivote perfecto
    geometry.center();
    geometry.computeBoundingBox();
    geometry.computeVertexNormals();

    // 2. Calcular altura total y ubicar el grupo para apoyar la base en el suelo
    const bbox = geometry.boundingBox!;
    const halfHeight = (bbox.max.y - bbox.min.y) / 2;
    this.currentCenterY = this.FLOOR_Y + halfHeight;

    this.group.position.set(0, this.currentCenterY, 0);

    // Malla principal
    this.currentMesh.geometry = geometry;
    this.currentMesh.material = material;
    this.currentMesh.castShadow = true;
    this.currentMesh.receiveShadow = true;
    this.currentMesh.position.set(0, 0, 0);

    // 3. Grilla / Estructura del Objeto (Wireframe)
    const wireGeo = new THREE.WireframeGeometry(geometry);
    this.wireframeLines.geometry = wireGeo;
    this.wireframeLines.position.set(0, 0, 0);

    // 4. Lineart de Aristas Estructurales
    const edgesGeo = new THREE.EdgesGeometry(geometry, edgeThreshold);
    this.lineartEdges.geometry = edgesGeo;
    this.lineartEdges.position.set(0, 0, 0);

    // 5. Silueta Exterior Cartoon con Normales Suaves (evita desgarros en esquinas de cubos)
    this.silhouetteMesh.geometry = createSmoothOutlineGeometry(geometry);
    this.silhouetteMesh.visible = true;
    this.silhouetteMesh.position.set(0, 0, 0);
  }

  public getCenterY(): number {
    return this.currentCenterY;
  }

  // --- Controles de Grilla / Estructura del Objeto ---
  public setWireframeVisible(visible: boolean): void {
    this.wireframeLines.visible = visible;
  }

  public setWireframeOpacity(opacity: number): void {
    this.wireframeMaterial.opacity = opacity;
  }

  // --- Controles de Lineart / Contorno Blanco ---
  public setLineartVisible(visible: boolean): void {
    this.lineartEdges.visible = visible;
    this.silhouetteMesh.visible = visible;
  }

  public setLineartOpacity(opacity: number): void {
    this.lineartMaterial.opacity = opacity;
    if (this.silhouetteMaterial.uniforms && this.silhouetteMaterial.uniforms.uOpacity) {
      this.silhouetteMaterial.uniforms.uOpacity.value = opacity;
    }
  }

  public setOutlineThickness(thickness: number): void {
    if (this.silhouetteMaterial.uniforms && this.silhouetteMaterial.uniforms.uThickness) {
      this.silhouetteMaterial.uniforms.uThickness.value = thickness;
    }
  }

  public setSelected(selected: boolean): void {
    this.isSelected = selected;
  }

  public getMesh(): THREE.Mesh {
    return this.currentMesh;
  }

  public getShapeType(): ShapeType {
    return this.currentShapeType;
  }

  public update(_delta: number): void {
    // No-op
  }

  public dispose(): void {
    if (this.currentMesh.geometry) {
      this.currentMesh.geometry.dispose();
    }
    if (this.wireframeLines.geometry) {
      this.wireframeLines.geometry.dispose();
    }
    if (this.lineartEdges.geometry) {
      this.lineartEdges.geometry.dispose();
    }
    if (this.silhouetteMesh.geometry) {
      this.silhouetteMesh.geometry.dispose();
    }
    this.smoothMaterial.dispose();
    this.flatMaterial.dispose();
    this.wireframeMaterial.dispose();
    this.lineartMaterial.dispose();
    this.silhouetteMaterial.dispose();
  }
}
