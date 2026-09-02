import * as THREE from 'three';

export interface RotationControllerOptions {
  canvas: HTMLCanvasElement;
  target: THREE.Object3D;
  rotateSpeed?: number;
  dampingFactor?: number;
  onRotate?: (rotation: { x: number; y: number; z: number }) => void;
}

export class ObjectRotationController {
  private canvas: HTMLCanvasElement;
  private target: THREE.Object3D;
  private onRotate?: (rotation: { x: number; y: number; z: number }) => void;

  private isDragging = false;
  private previousPointerPosition = { x: 0, y: 0 };
  private velocity = { x: 0, y: 0, z: 0 };

  public rotateSpeed: number;
  public dampingFactor: number;

  constructor(options: RotationControllerOptions) {
    this.canvas = options.canvas;
    this.target = options.target;
    this.onRotate = options.onRotate;
    this.rotateSpeed = options.rotateSpeed ?? 0.007;
    this.dampingFactor = options.dampingFactor ?? 0.9;

    this.bindEvents();
  }

  private bindEvents(): void {
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;

    this.isDragging = true;
    this.previousPointerPosition = {
      x: event.clientX,
      y: event.clientY,
    };
    this.velocity = { x: 0, y: 0, z: 0 };
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.previousPointerPosition.x;
    const deltaY = event.clientY - this.previousPointerPosition.y;

    // Rotación Turntable suave: giro horizontal libre (Y) y leve inclinación (X)
    const rotY = deltaX * this.rotateSpeed;
    const rotX = deltaY * this.rotateSpeed * 0.5;

    this.target.rotation.y += rotY;
    this.target.rotation.x += rotX;

    // Limitar inclinación para mantener la perspectiva cómoda
    const maxPitch = Math.PI / 2.2;
    this.target.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, this.target.rotation.x));

    this.velocity.y = rotY;
    this.velocity.x = rotX;

    this.notifyRotation();

    this.previousPointerPosition = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  private onPointerUp = (): void => {
    this.isDragging = false;
  };

  public update(): void {
    if (!this.isDragging) {
      if (Math.abs(this.velocity.y) > 0.0001 || Math.abs(this.velocity.x) > 0.0001) {
        this.target.rotation.y += this.velocity.y;
        this.target.rotation.x += this.velocity.x;

        this.velocity.y *= this.dampingFactor;
        this.velocity.x *= this.dampingFactor;

        this.notifyRotation();
      }
    }
  }

  public applyDelta(dx: number, dy: number, dz: number): void {
    this.target.rotation.x += dx;
    this.target.rotation.y += dy;
    this.target.rotation.z += dz;
    this.velocity = { x: 0, y: 0, z: 0 };
    this.notifyRotation();
  }

  public setRotation(x: number, y: number, z: number): void {
    this.target.rotation.set(x, y, z);
    this.velocity = { x: 0, y: 0, z: 0 };
    this.notifyRotation();
  }

  public resetRotation(): void {
    this.setRotation(0, 0, 0);
  }

  private notifyRotation(): void {
    if (this.onRotate) {
      this.onRotate({
        x: this.target.rotation.x,
        y: this.target.rotation.y,
        z: this.target.rotation.z,
      });
    }
  }

  public dispose(): void {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
  }
}
