import * as THREE from 'three';
import type { ShapesManager } from '../entities/Shapes';
import type { LightsManager } from '../entities/Lights';
import type { SelectableTarget } from '../types/scene';

export interface SelectionControllerOptions {
  canvas: HTMLCanvasElement;
  camera: THREE.PerspectiveCamera;
  shapes: ShapesManager;
  lights: LightsManager;
  onSelect?: (target: SelectableTarget) => void;
}

export class SelectionController {
  private canvas: HTMLCanvasElement;
  private camera: THREE.PerspectiveCamera;
  private shapes: ShapesManager;
  private lights: LightsManager;
  private onSelect?: (target: SelectableTarget) => void;

  private raycaster: THREE.Raycaster;
  private pointer: THREE.Vector2;
  private pointerDownPos = { x: 0, y: 0 };
  private currentSelection: SelectableTarget = 'shape';

  constructor(options: SelectionControllerOptions) {
    this.canvas = options.canvas;
    this.camera = options.camera;
    this.shapes = options.shapes;
    this.lights = options.lights;
    this.onSelect = options.onSelect;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.bindEvents();
    this.applyVisualSelection('shape');
  }

  private bindEvents(): void {
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
  }

  private onPointerDown = (event: PointerEvent): void => {
    this.pointerDownPos = { x: event.clientX, y: event.clientY };
  };

  private onPointerUp = (event: PointerEvent): void => {
    // Umbral de 6px para diferenciar clic simple de arrastre de rotación
    const dist = Math.hypot(event.clientX - this.pointerDownPos.x, event.clientY - this.pointerDownPos.y);
    if (dist > 6) return;

    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    const checkObjects: THREE.Object3D[] = [
      this.shapes.getMesh(),
      this.lights.getHelperMesh(),
    ];

    const intersects = this.raycaster.intersectObjects(checkObjects, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      let target: SelectableTarget = null;

      if (hit === this.shapes.getMesh() || hit.userData.selectableType === 'shape') {
        target = 'shape';
      } else if (hit === this.lights.getHelperMesh() || hit.userData.selectableType === 'light') {
        target = 'light';
      }

      this.setSelection(target);
    }
  };

  public setSelection(target: SelectableTarget): void {
    this.currentSelection = target;
    this.applyVisualSelection(target);

    if (this.onSelect) {
      this.onSelect(target);
    }
  }

  private applyVisualSelection(target: SelectableTarget): void {
    this.shapes.setSelected(target === 'shape');
    this.lights.setSelected(target === 'light');
  }

  public getSelection(): SelectableTarget {
    return this.currentSelection;
  }

  public dispose(): void {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
  }
}
