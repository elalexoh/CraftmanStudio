import * as THREE from 'three';
import { GroundEntity } from '../entities/Ground';
import { LightsManager } from '../entities/Lights';
import { ShapesManager } from '../entities/Shapes';
import { ObjectRotationController } from '../controls/ObjectRotationController';
import { SelectionController } from '../controls/SelectionController';
import type { SceneManagerOptions, ShapeType, SelectableTarget } from '../types/scene';

export interface ExtendedSceneManagerOptions extends SceneManagerOptions {
  onSelectionChange?: (target: SelectableTarget) => void;
  onRotationChange?: (rotation: { x: number; y: number; z: number }) => void;
}

export class SceneManager {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;

  public ground: GroundEntity;
  public lights: LightsManager;
  public shapes: ShapesManager;
  public rotationController: ObjectRotationController;
  public selectionController: SelectionController;

  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(options: ExtendedSceneManagerOptions) {
    this.canvas = options.canvas;
    this.clock = new THREE.Clock();

    // 1. Escena principal
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x18181b);

    // 2. Cámara (fija para observación precisa de planos)
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 2.0, 7.0);
    this.camera.lookAt(0, 0, 0);

    // 3. Renderizador con sombras suaves
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: options.antialias ?? true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // 4. Instanciar entidades
    this.ground = new GroundEntity();
    this.ground.init(this.scene);

    this.lights = new LightsManager();
    this.lights.init(this.scene);

    this.shapes = new ShapesManager();
    this.shapes.init(this.scene);

    // 5. Controlador de rotación del objeto
    this.rotationController = new ObjectRotationController({
      canvas: this.canvas,
      target: this.shapes.group,
      onRotate: options.onRotationChange,
    });

    // 6. Controlador de selección
    this.selectionController = new SelectionController({
      canvas: this.canvas,
      camera: this.camera,
      shapes: this.shapes,
      lights: this.lights,
      onSelect: options.onSelectionChange,
    });

    // 7. Configurar redimensionamiento
    this.setupResize();

    // 8. Iniciar bucle de render
    this.start();
  }

  private setupResize(): void {
    const handleResize = () => {
      const parent = this.canvas.parentElement;
      const width = parent ? parent.clientWidth : window.innerWidth;
      const height = parent ? parent.clientHeight : window.innerHeight;

      if (width === 0 || height === 0) return;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    if (this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(() => handleResize());
      this.resizeObserver.observe(this.canvas.parentElement);
    }

    window.addEventListener('resize', handleResize);
  }

  public setShape(type: ShapeType): void {
    this.shapes.setShape(type);
  }

  public selectTarget(target: SelectableTarget): void {
    this.selectionController.setSelection(target);
  }

  public resetRotation(): void {
    this.rotationController.resetRotation();
  }

  public applyDeltaRotation(dx: number, dy: number, dz: number): void {
    this.rotationController.applyDelta(dx, dy, dz);
  }

  public setRotation(x: number, y: number, z: number): void {
    this.rotationController.setRotation(x, y, z);
  }

  public setLightPosition(x: number, y: number, z: number): void {
    this.lights.setLightPosition(x, y, z);
  }

  public setLightIntensity(intensity: number): void {
    this.lights.setLightIntensity(intensity);
  }

  public setLightColor(colorHex: string): void {
    this.lights.setLightColor(colorHex);
  }

  public setGroundGridVisible(visible: boolean): void {
    this.ground.setGridVisible(visible);
  }

  public setObjectWireframeVisible(visible: boolean): void {
    this.shapes.setWireframeVisible(visible);
  }

  public setObjectWireframeOpacity(opacity: number): void {
    this.shapes.setWireframeOpacity(opacity);
  }

  public setObjectLineartVisible(visible: boolean): void {
    this.shapes.setLineartVisible(visible);
  }

  public setObjectLineartOpacity(opacity: number): void {
    this.shapes.setLineartOpacity(opacity);
  }

  public setObjectOutlineThickness(thickness: number): void {
    this.shapes.setOutlineThickness(thickness);
  }

  private render = (): void => {
    const delta = this.clock.getDelta();

    // Actualizar inercia de rotación del objeto
    this.rotationController.update();

    // Actualizar entidades con información de cámara
    this.lights.update(delta, this.camera);
    this.shapes.update(delta);

    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(this.render);
  };

  public start(): void {
    if (this.animationFrameId === null) {
      this.clock.start();
      this.render();
    }
  }

  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public dispose(): void {
    this.stop();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.selectionController.dispose();
    this.rotationController.dispose();
    this.ground.dispose();
    this.lights.dispose();
    this.shapes.dispose();

    this.renderer.dispose();
  }
}
