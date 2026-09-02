import * as THREE from 'three';

export interface RaycastResult {
  uv: THREE.Vector2;
  point: THREE.Vector3;
  pixelX: number;
  pixelY: number;
}

export class PanoramicEngine {
  private container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private groundGridMesh: THREE.Mesh | null = null;
  private horizontalGridMesh: THREE.Mesh | null = null;
  private verticalGuidesMesh: THREE.LineSegments | null = null;
  private groundGridMaterial: THREE.ShaderMaterial | null = null;
  private horizontalGridMaterial: THREE.ShaderMaterial | null = null;
  private horizonGuide: THREE.LineLoop | null = null;
  private sphereMesh: THREE.Mesh | null = null;
  private canvasTexture: THREE.CanvasTexture | null = null;
  private raycaster: THREE.Raycaster;

  // Camera angles (in radians)
  public yaw: number = 0; // horizontal angle
  public pitch: number = 0; // vertical angle
  public eyeHeight: number = 1.5; // in meters
  public showGroundGrid: boolean = true;

  // Eraser indicator
  private eraserCursorMesh: THREE.LineLoop | null = null;

  private animationFrameId: number | null = null;
  private masterCanvas: HTMLCanvasElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf1f5f9); // Light clean sky background

    this.raycaster = new THREE.Raycaster();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    this.camera.position.set(0, this.eyeHeight, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0xf1f5f9, 1.0);
    this.container.appendChild(this.renderer.domElement);

    // Sphere with BackSide for 360 Equirectangular Projection
    const geometry = new THREE.SphereGeometry(50, 64, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.BackSide,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    this.sphereMesh = new THREE.Mesh(geometry, material);
    this.sphereMesh.renderOrder = 15; // Render sphere on top of background grids
    this.scene.add(this.sphereMesh);

    // Selection Overlay Sphere (rendered on top of sphere mesh with translucency)
    this.setupSelectionOverlay();

    this.setupGroundGrid();
    this.setupEraserCursor();
    this.scene.add(this.rulerGuideGroup);
    this.updateCameraDirection();
    this.startRenderLoop();

    window.addEventListener('resize', this.onResize);
  }

  public setMasterCanvas(canvas: HTMLCanvasElement) {
    this.masterCanvas = canvas;
    if (this.canvasTexture) {
      this.canvasTexture.dispose();
    }
    this.canvasTexture = new THREE.CanvasTexture(canvas);
    this.canvasTexture.colorSpace = THREE.SRGBColorSpace;
    this.canvasTexture.minFilter = THREE.LinearFilter;
    this.canvasTexture.magFilter = THREE.LinearFilter;
    this.canvasTexture.wrapS = THREE.RepeatWrapping;
    this.canvasTexture.wrapT = THREE.ClampToEdgeWrapping;

    if (this.sphereMesh) {
      const mat = this.sphereMesh.material as THREE.MeshBasicMaterial;
      mat.map = this.canvasTexture;
      mat.needsUpdate = true;
    }
    this.notifyTextureUpdated();
  }

  public notifyTextureUpdated() {
    if (this.canvasTexture) {
      this.canvasTexture.needsUpdate = true;
    }
  }

  private setupGroundGrid() {
    const guideGridPlaneSize = 20000;
    const groundGridGeometry = new THREE.PlaneGeometry(guideGridPlaneSize, guideGridPlaneSize);

    const vertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `;

    const fragmentShader = `
      varying vec3 vWorldPosition;
      uniform float gridSize;
      void main() {
        vec2 gridPosition = vWorldPosition.xz / gridSize;
        vec2 gridDistance = abs(fract(gridPosition - 0.5) - 0.5) / fwidth(gridPosition);
        float line = 1.0 - min(min(gridDistance.x, gridDistance.y), 1.0);
        vec3 gridColor = vec3(0.25, 0.55, 1.0);
        gl_FragColor = vec4(gridColor, line * 0.35);
      }
    `;

    // 1. Infinite Ground Grid at y = 0
    this.groundGridMaterial = new THREE.ShaderMaterial({
      uniforms: {
        gridSize: { value: Math.sqrt(this.eyeHeight / 1.5) }
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
      vertexShader,
      fragmentShader
    });

    this.groundGridMesh = new THREE.Mesh(groundGridGeometry, this.groundGridMaterial);
    this.groundGridMesh.rotation.x = -Math.PI / 2;
    this.groundGridMesh.position.y = 0;
    this.groundGridMesh.renderOrder = 1;
    this.groundGridMesh.frustumCulled = false;
    this.groundGridMesh.visible = this.showGroundGrid;
    this.scene.add(this.groundGridMesh);

    // 2. Infinite Upper Horizontal Grid at y = eyeHeight + 30
    this.horizontalGridMaterial = new THREE.ShaderMaterial({
      uniforms: {
        gridSize: { value: 10.0 }
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
      vertexShader,
      fragmentShader
    });

    this.horizontalGridMesh = new THREE.Mesh(groundGridGeometry, this.horizontalGridMaterial);
    this.horizontalGridMesh.rotation.x = -Math.PI / 2;
    this.horizontalGridMesh.position.y = this.eyeHeight + 30;
    this.horizontalGridMesh.renderOrder = 2;
    this.horizontalGridMesh.frustumCulled = false;
    this.horizontalGridMesh.visible = this.showGroundGrid;
    this.scene.add(this.horizontalGridMesh);

    // 3. Vertical Guide Lines (12 radial directions, every 30 deg)
    const verticalGuidePoints: THREE.Vector3[] = [];
    const verticalGuideCount = 12;
    const verticalGuideSpacing = 50;
    const verticalGuideMaxDistance = 950;
    const verticalGuideHeight = 80;

    for (let distance = verticalGuideSpacing; distance <= verticalGuideMaxDistance; distance += verticalGuideSpacing) {
      for (let i = 0; i < verticalGuideCount; i++) {
        const angle = (i / verticalGuideCount) * Math.PI * 2;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        verticalGuidePoints.push(new THREE.Vector3(x, 0, z));
        verticalGuidePoints.push(new THREE.Vector3(x, verticalGuideHeight, z));
      }
    }

    const verticalGuideGeometry = new THREE.BufferGeometry().setFromPoints(verticalGuidePoints);
    const verticalGuideMaterial = new THREE.LineBasicMaterial({
      color: 0x6699ff,
      transparent: true,
      opacity: 0.18,
      depthTest: false,
      depthWrite: false
    });

    this.verticalGuidesMesh = new THREE.LineSegments(verticalGuideGeometry, verticalGuideMaterial);
    this.verticalGuidesMesh.renderOrder = 3;
    this.verticalGuidesMesh.frustumCulled = false;
    this.verticalGuidesMesh.visible = this.showGroundGrid;
    this.scene.add(this.verticalGuidesMesh);

    // 4. Horizon Guide Loop
    const ringRadius = 49.5;
    const ringSegments = 128;
    const ringPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= ringSegments; i++) {
      const theta = (i / ringSegments) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(Math.cos(theta) * ringRadius, 0, Math.sin(theta) * ringRadius));
    }
    const ringGeometry = new THREE.BufferGeometry().setFromPoints(ringPoints);
    const ringMaterial = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.7,
      depthTest: false,
      depthWrite: false
    });
    this.horizonGuide = new THREE.LineLoop(ringGeometry, ringMaterial);
    this.horizonGuide.visible = this.showGroundGrid;
    this.horizonGuide.renderOrder = 4;
    this.scene.add(this.horizonGuide);
  }

  public setEyeHeight(height: number) {
    this.eyeHeight = Math.max(0.5, Math.min(30, height));
    this.camera.position.set(0, this.eyeHeight, 0);

    // Update dynamic ground grid size proportional to height
    if (this.groundGridMaterial) {
      this.groundGridMaterial.uniforms.gridSize.value = Math.sqrt(this.eyeHeight / 1.5);
    }
    // Update upper horizontal grid height
    if (this.horizontalGridMesh) {
      this.horizontalGridMesh.position.y = this.eyeHeight + 30;
    }
  }

  public toggleGroundGrid(show: boolean) {
    this.showGroundGrid = show;
    if (this.groundGridMesh) this.groundGridMesh.visible = show;
    if (this.horizontalGridMesh) this.horizontalGridMesh.visible = show;
    if (this.verticalGuidesMesh) this.verticalGuidesMesh.visible = show;
    if (this.horizonGuide) this.horizonGuide.visible = show;
  }

  private setupEraserCursor() {
    const segments = 32;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta), Math.sin(theta), 0));
    }
    const cursorGeom = new THREE.BufferGeometry().setFromPoints(points);
    const cursorMat = new THREE.LineBasicMaterial({
      color: 0xef4444,
      depthTest: false,
      transparent: true,
      opacity: 0.9
    });
    this.eraserCursorMesh = new THREE.LineLoop(cursorGeom, cursorMat);
    this.eraserCursorMesh.visible = false;
    this.eraserCursorMesh.renderOrder = 999;
    this.scene.add(this.eraserCursorMesh);
  }

  public setEraserCursor(point: THREE.Vector3 | null, normal: THREE.Vector3 | null, size: number = 3) {
    if (!this.eraserCursorMesh) return;
    if (!point) {
      this.eraserCursorMesh.visible = false;
      return;
    }
    this.eraserCursorMesh.visible = true;
    this.eraserCursorMesh.position.copy(point).multiplyScalar(0.98);
    if (normal) {
      this.eraserCursorMesh.lookAt(point.clone().add(normal));
    }
    const scale = (size / 15) * (this.camera.fov / 75);
    this.eraserCursorMesh.scale.set(scale, scale, scale);
  }

  private rulerGuideGroup: THREE.Group = new THREE.Group();
  private rulerLineMaterial = new THREE.LineBasicMaterial({
    color: 0x06b6d4, // Bright cyan
    transparent: true,
    opacity: 0.85,
    depthTest: false,
    depthWrite: false
  });

  public updateRulerGuides(
    rulerType: string,
    anchor?: { x: number; y: number } | null,
    center?: { x: number; y: number },
    previewEnd?: { x: number; y: number } | null,
    isSphericalCurvatureEnabled: boolean = true
  ) {
    // Clear previous ruler objects and dispose geometries
    while (this.rulerGuideGroup.children.length > 0) {
      const obj = this.rulerGuideGroup.children[0] as THREE.Line;
      if (obj && obj.geometry) {
        obj.geometry.dispose();
      }
      this.rulerGuideGroup.remove(obj);
    }

    if (rulerType === 'none' || !this.masterCanvas) {
      return;
    }

    const w = this.masterCanvas.width;
    const h = this.masterCanvas.height;
    const r = 49.5; // spherical projection distance (inside 50 radius sphere)

    const pixelToSphere = (px: number, py: number): THREE.Vector3 => {
      const u = ((px % w) + w) % w / w;
      const v = Math.max(0, Math.min(1, 1 - py / h));
      const phi = (1 - v) * Math.PI;
      const theta = u * Math.PI * 2;

      const x = -r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(theta) * Math.sin(phi);
      return new THREE.Vector3(x, y, z);
    };

    const lineMaterial = this.rulerLineMaterial;

    if (rulerType === 'two-point') {
      if (anchor && previewEnd) {
        let adjustedX2 = previewEnd.x;
        const deltaX = adjustedX2 - anchor.x;
        if (deltaX < -w / 2) {
          adjustedX2 += w;
        } else if (deltaX > w / 2) {
          adjustedX2 -= w;
        }

        const pts: THREE.Vector3[] = [];
        const segments = 32;
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const curX = anchor.x + (adjustedX2 - anchor.x) * t;
          const curY = anchor.y + (previewEnd.y - anchor.y) * t;
          pts.push(pixelToSphere(curX, curY));
        }

        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.Line(geom, lineMaterial);
        line.renderOrder = 20;
        this.rulerGuideGroup.add(line);
      }
      return;
    }

    if (rulerType === 'orthogonal') {
      if (anchor && this.sphereMesh) {
        const anchor3D = pixelToSphere(anchor.x, anchor.y);
        const anchorNDC = anchor3D.clone().project(this.camera);

        // 1. Screen Horizontal guide line (fixed y = anchorNDC.y)
        const ptsH: THREE.Vector3[] = [];
        for (let i = 0; i <= 32; i++) {
          const ndcX = -1 + (i / 32) * 2;
          this.raycaster.setFromCamera(new THREE.Vector2(ndcX, anchorNDC.y), this.camera);
          const intersects = this.raycaster.intersectObject(this.sphereMesh, false);
          if (intersects.length > 0) {
            ptsH.push(intersects[0].point.clone().multiplyScalar(0.99));
          }
        }
        if (ptsH.length > 1) {
          const geomH = new THREE.BufferGeometry().setFromPoints(ptsH);
          const lineH = new THREE.Line(geomH, lineMaterial);
          lineH.renderOrder = 20;
          this.rulerGuideGroup.add(lineH);
        }

        // 2. Screen Vertical guide line (fixed x = anchorNDC.x)
        const ptsV: THREE.Vector3[] = [];
        for (let i = 0; i <= 32; i++) {
          const ndcY = -1 + (i / 32) * 2;
          this.raycaster.setFromCamera(new THREE.Vector2(anchorNDC.x, ndcY), this.camera);
          const intersects = this.raycaster.intersectObject(this.sphereMesh, false);
          if (intersects.length > 0) {
            ptsV.push(intersects[0].point.clone().multiplyScalar(0.99));
          }
        }
        if (ptsV.length > 1) {
          const geomV = new THREE.BufferGeometry().setFromPoints(ptsV);
          const lineV = new THREE.Line(geomV, lineMaterial);
          lineV.renderOrder = 20;
          this.rulerGuideGroup.add(lineV);
        }
      }
      return;
    }

    if (rulerType === 'vertical') {
      // If stroke anchor is active, draw primary active meridian line
      if (anchor) {
        const pts: THREE.Vector3[] = [];
        const segments = 48;
        for (let i = 0; i <= segments; i++) {
          const y = (i / segments) * h;
          pts.push(pixelToSphere(anchor.x, y));
        }
        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.Line(geom, lineMaterial);
        line.renderOrder = 20;
        this.rulerGuideGroup.add(line);
      } else {
        // Draw 12 vertical meridian guide lines around the sphere (every 30 degrees)
        for (let m = 0; m < 12; m++) {
          const x = (m / 12) * w;
          const pts: THREE.Vector3[] = [];
          const segments = 32;
          for (let i = 0; i <= segments; i++) {
            const y = (i / segments) * h;
            pts.push(pixelToSphere(x, y));
          }
          const geom = new THREE.BufferGeometry().setFromPoints(pts);
          const line = new THREE.Line(geom, lineMaterial);
          line.renderOrder = 20;
          this.rulerGuideGroup.add(line);
        }
      }
    } else if (rulerType === 'horizontal') {
      // If stroke anchor is active, draw primary active latitude circle
      if (anchor) {
        const pts: THREE.Vector3[] = [];
        const segments = 64;
        for (let i = 0; i <= segments; i++) {
          const x = (i / segments) * w;
          pts.push(pixelToSphere(x, anchor.y));
        }
        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.LineLoop(geom, lineMaterial);
        line.renderOrder = 20;
        this.rulerGuideGroup.add(line);
      } else {
        // Draw 5 horizontal latitude circles (-60, -30, 0 horizon, +30, +60 degrees)
        const latitudes = [0.15, 0.32, 0.5, 0.68, 0.85];
        for (const latRatio of latitudes) {
          const y = latRatio * h;
          const pts: THREE.Vector3[] = [];
          const segments = 64;
          for (let i = 0; i <= segments; i++) {
            const x = (i / segments) * w;
            pts.push(pixelToSphere(x, y));
          }
          const geom = new THREE.BufferGeometry().setFromPoints(pts);
          const line = new THREE.LineLoop(geom, lineMaterial);
          line.renderOrder = 20;
          this.rulerGuideGroup.add(line);
        }
      }
    } else if (rulerType === 'radial' && center) {
      // 12 radial perspective rays
      const rays = 12;
      for (let i = 0; i < rays; i++) {
        const angle = (i / rays) * Math.PI * 2;
        const pts: THREE.Vector3[] = [];
        const segments = 32;
        for (let s = 0; s <= segments; s++) {
          const dist = (s / segments) * (w * 0.7);
          const curX = center.x + Math.cos(angle) * dist;
          const curY = center.y + Math.sin(angle) * dist;
          pts.push(pixelToSphere(curX, curY));
        }
        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.Line(geom, lineMaterial);
        line.renderOrder = 20;
        this.rulerGuideGroup.add(line);
      }
    }
  }

  private selectionOverlayCanvas: HTMLCanvasElement | null = null;
  private selectionOverlayCtx: CanvasRenderingContext2D | null = null;
  private selectionOverlayTexture: THREE.CanvasTexture | null = null;
  private selectionSphereMesh: THREE.Mesh | null = null;
  private selection3DLineMesh: THREE.LineLoop | null = null;
  private selection3DLineInnerMesh: THREE.LineLoop | null = null;

  private setupSelectionOverlay() {
    this.selectionOverlayCanvas = document.createElement('canvas');
    this.selectionOverlayCanvas.width = 2048;
    this.selectionOverlayCanvas.height = 1024;
    this.selectionOverlayCtx = this.selectionOverlayCanvas.getContext('2d');

    this.selectionOverlayTexture = new THREE.CanvasTexture(this.selectionOverlayCanvas);
    this.selectionOverlayTexture.minFilter = THREE.LinearFilter;
    this.selectionOverlayTexture.magFilter = THREE.LinearFilter;
    this.selectionOverlayTexture.wrapS = THREE.RepeatWrapping;
    this.selectionOverlayTexture.wrapT = THREE.ClampToEdgeWrapping;

    const overlayGeom = new THREE.SphereGeometry(49.8, 64, 32);
    const overlayMat = new THREE.MeshBasicMaterial({
      map: this.selectionOverlayTexture,
      side: THREE.BackSide,
      transparent: true,
      opacity: 1.0,
      depthTest: false,
      depthWrite: false
    });

    this.selectionSphereMesh = new THREE.Mesh(overlayGeom, overlayMat);
    this.selectionSphereMesh.renderOrder = 25;
    this.selectionSphereMesh.visible = false;
    this.scene.add(this.selectionSphereMesh);

    // 3D Vector Selection Lines with maximum contrast against white, dark and colored backgrounds
    const darkMat = new THREE.LineBasicMaterial({
      color: 0x000000, // Pure black outer contour
      linewidth: 3,
      transparent: true,
      opacity: 1.0,
      depthTest: false,
      depthWrite: false
    });
    this.selection3DLineMesh = new THREE.LineLoop(new THREE.BufferGeometry(), darkMat);
    this.selection3DLineMesh.renderOrder = 30;
    this.selection3DLineMesh.visible = false;
    this.scene.add(this.selection3DLineMesh);

    const brightMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff, // High-contrast neon cyan inner contour
      linewidth: 2,
      transparent: true,
      opacity: 1.0,
      depthTest: false,
      depthWrite: false
    });
    this.selection3DLineInnerMesh = new THREE.LineLoop(new THREE.BufferGeometry(), brightMat);
    this.selection3DLineInnerMesh.renderOrder = 31;
    this.selection3DLineInnerMesh.visible = false;
    this.scene.add(this.selection3DLineInnerMesh);
  }

  public updateSelectionGuides(points: { x: number; y: number }[], hasSelection: boolean, isDrawing: boolean, isInverted: boolean = false) {
    if (!this.selectionOverlayCanvas || !this.selectionOverlayCtx || !this.selectionSphereMesh || !this.selectionOverlayTexture || !this.masterCanvas) {
      return;
    }

    const masterW = this.masterCanvas.width;
    const masterH = this.masterCanvas.height;

    // Keep 1:1 crisp master canvas resolution
    if (this.selectionOverlayCanvas.width !== masterW || this.selectionOverlayCanvas.height !== masterH) {
      this.selectionOverlayCanvas.width = masterW;
      this.selectionOverlayCanvas.height = masterH;
      this.selectionOverlayTexture.dispose();
      this.selectionOverlayTexture = new THREE.CanvasTexture(this.selectionOverlayCanvas);
      this.selectionOverlayTexture.minFilter = THREE.LinearFilter;
      this.selectionOverlayTexture.magFilter = THREE.LinearFilter;
      this.selectionOverlayTexture.wrapS = THREE.RepeatWrapping;
      this.selectionOverlayTexture.wrapT = THREE.ClampToEdgeWrapping;
      (this.selectionSphereMesh.material as THREE.MeshBasicMaterial).map = this.selectionOverlayTexture;
      (this.selectionSphereMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
    }

    const w = masterW;
    const h = masterH;
    const ctx = this.selectionOverlayCtx;
    ctx.clearRect(0, 0, w, h);

    if ((!hasSelection && !isDrawing) || points.length < 2) {
      this.selectionSphereMesh.visible = false;
      if (this.selection3DLineMesh) this.selection3DLineMesh.visible = false;
      if (this.selection3DLineInnerMesh) this.selection3DLineInnerMesh.visible = false;
      this.selectionOverlayTexture.needsUpdate = true;
      return;
    }

    // 1. Draw 3D Vector Line in Three.js (exact 3D spherical alignment matching UVs)
    const pts3D: THREE.Vector3[] = points.map(p => {
      const u = ((p.x % masterW) + masterW) % masterW / masterW;
      const v = Math.max(0, Math.min(1, 1 - p.y / masterH));
      const phi = (1 - v) * Math.PI;
      const theta = u * Math.PI * 2;

      const r = 49.6;
      const x = -r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(theta) * Math.sin(phi);
      return new THREE.Vector3(x, y, z);
    });

    if (this.selection3DLineMesh && this.selection3DLineInnerMesh) {
      this.selection3DLineMesh.geometry.dispose();
      this.selection3DLineMesh.geometry = new THREE.BufferGeometry().setFromPoints(pts3D);
      this.selection3DLineMesh.visible = true;

      this.selection3DLineInnerMesh.geometry.dispose();
      this.selection3DLineInnerMesh.geometry = new THREE.BufferGeometry().setFromPoints(pts3D);
      this.selection3DLineInnerMesh.visible = true;
    }

    // 2. Draw Translucent Area Fill on Texture
    const drawPath = (offsetX: number = 0) => {
      ctx.beginPath();
      ctx.moveTo(points[0].x + offsetX, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x + offsetX, points[i].y);
      }
      if (hasSelection) ctx.closePath();
    };

    ctx.save();
    if (hasSelection && isInverted) {
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = points.length - 1; i >= 0; i--) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(2, 132, 199, 0.35)';
      ctx.fill('evenodd');
    } else if (hasSelection) {
      ctx.fillStyle = 'rgba(2, 132, 199, 0.35)';
      drawPath(0);
      ctx.fill();
      drawPath(-w);
      ctx.fill();
      drawPath(w);
      ctx.fill();
    }
    ctx.restore();

    this.selectionSphereMesh.visible = hasSelection;
    this.selectionOverlayTexture.needsUpdate = true;
  }

  public rotateCamera(deltaYaw: number, deltaPitch: number) {
    this.yaw += deltaYaw;
    this.yaw = (this.yaw % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);

    const maxPitch = (Math.PI / 2) - 0.02;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch + deltaPitch));
    this.updateCameraDirection();
  }

  public zoomFov(deltaFov: number) {
    this.camera.fov = Math.max(15, Math.min(120, this.camera.fov + deltaFov));
    this.camera.updateProjectionMatrix();
  }

  public updateCameraDirection() {
    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);
    const cosYaw = Math.cos(this.yaw);
    const sinYaw = Math.sin(this.yaw);

    const target = new THREE.Vector3(
      cosPitch * sinYaw,
      sinPitch,
      -cosPitch * cosYaw
    );

    this.camera.lookAt(
      this.camera.position.x + target.x,
      this.camera.position.y + target.y,
      this.camera.position.z + target.z
    );
  }

  public raycastFromClientCoords(clientX: number, clientY: number): RaycastResult | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    if (!this.sphereMesh) return null;
    this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
    const intersects = this.raycaster.intersectObject(this.sphereMesh, false);

    if (intersects.length > 0 && intersects[0].uv) {
      const hit = intersects[0];
      const uv = hit.uv!;
      const canvasWidth = this.masterCanvas ? this.masterCanvas.width : 4096;
      const canvasHeight = this.masterCanvas ? this.masterCanvas.height : 2048;

      const pixelX = Math.floor(uv.x * canvasWidth);
      const pixelY = Math.floor((1 - uv.y) * canvasHeight);

      return {
        uv,
        point: hit.point,
        pixelX: Math.max(0, Math.min(canvasWidth - 1, pixelX)),
        pixelY: Math.max(0, Math.min(canvasHeight - 1, pixelY))
      };
    }
    return null;
  }

  public snapRaycastToScreenOrthogonal(
    clientX: number,
    clientY: number,
    anchorPixel: { x: number; y: number },
    currentLockedAxis: 'x' | 'y' | null
  ): { pixelX: number; pixelY: number; lockedAxis: 'x' | 'y' } | null {
    if (!this.sphereMesh) return null;

    const canvasWidth = this.masterCanvas ? this.masterCanvas.width : 4096;
    const canvasHeight = this.masterCanvas ? this.masterCanvas.height : 2048;

    // 1. Calculate 3D sphere point of anchor
    const u = (((anchorPixel.x % canvasWidth) + canvasWidth) % canvasWidth) / canvasWidth;
    const v = Math.max(0, Math.min(1, 1 - anchorPixel.y / canvasHeight));
    const phi = (1 - v) * Math.PI;
    const theta = u * Math.PI * 2;
    const r = 50;

    const anchor3D = new THREE.Vector3(
      -r * Math.cos(theta) * Math.sin(phi),
      r * Math.cos(phi),
      r * Math.sin(theta) * Math.sin(phi)
    );

    // 2. Project anchor to screen NDC coordinates
    const anchorNDC = anchor3D.clone().project(this.camera);

    // 3. Current mouse position in screen NDC
    const rect = this.renderer.domElement.getBoundingClientRect();
    const currNDCX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const currNDCY = -((clientY - rect.top) / rect.height) * 2 + 1;

    const deltaNDCX = currNDCX - anchorNDC.x;
    const deltaNDCY = currNDCY - anchorNDC.y;

    let axis = currentLockedAxis;
    if (!axis) {
      if (Math.hypot(deltaNDCX * rect.width, deltaNDCY * rect.height) >= 3) {
        axis = Math.abs(deltaNDCX) >= Math.abs(deltaNDCY) ? 'x' : 'y';
      } else {
        return { pixelX: anchorPixel.x, pixelY: anchorPixel.y, lockedAxis: 'x' };
      }
    }

    // 4. Lock screen coordinate:
    // If horizontal (axis === 'x'), lock screen Y to anchorNDC.y
    // If vertical (axis === 'y'), lock screen X to anchorNDC.x
    const targetNDC = new THREE.Vector2(
      axis === 'x' ? currNDCX : anchorNDC.x,
      axis === 'y' ? currNDCY : anchorNDC.y
    );

    this.raycaster.setFromCamera(targetNDC, this.camera);
    const intersects = this.raycaster.intersectObject(this.sphereMesh, false);
    if (intersects.length > 0 && intersects[0].uv) {
      const uv = intersects[0].uv!;
      const px = Math.floor(uv.x * canvasWidth);
      const py = Math.floor((1 - uv.y) * canvasHeight);

      return {
        pixelX: Math.max(0, Math.min(canvasWidth - 1, px)),
        pixelY: Math.max(0, Math.min(canvasHeight - 1, py)),
        lockedAxis: axis
      };
    }

    return null;
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private startRenderLoop() {
    const render = () => {
      this.animationFrameId = requestAnimationFrame(render);
      this.renderer.render(this.scene, this.camera);
    };
    render();
  }

  public getCanvasElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  public dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    if (this.canvasTexture) this.canvasTexture.dispose();
  }
}
