<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { useRotationState, type CanonicalView } from '../composables/useRotationState';
import { Compass, RotateCcw } from 'lucide-vue-next';

const canvasRef = ref<HTMLCanvasElement | null>(null);
const { currentRotation, applyDelta, snapTo, resetRotation } = useRotationState();

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let gizmoGroup: THREE.Group | null = null;
let animId: number | null = null;

let isDragging = false;
let previousPointer = { x: 0, y: 0 };
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clickablePills: THREE.Mesh[] = [];

onMounted(() => {
  if (!canvasRef.value) return;

  const width = 110;
  const height = 110;

  // 1. Escena dedicada del Gizmo
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
  camera.position.set(0, 0, 4.2);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 2. Luces
  const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(2, 4, 5);
  scene.add(dirLight);

  // 3. Grupo de Orientación (sincronizado con la rotación del objeto principal)
  gizmoGroup = new THREE.Group();
  scene.add(gizmoGroup);

  // 4. Mini Cubo Central de Navegación
  const cubeGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
  const cubeMat = new THREE.MeshStandardMaterial({
    color: 0x3f3f46,
    roughness: 0.5,
    metalness: 0.1,
    flatShading: true,
  });
  const centralCube = new THREE.Mesh(cubeGeo, cubeMat);
  gizmoGroup.add(centralCube);

  // Bordes del mini cubo
  const edgeGeo = new THREE.EdgesGeometry(cubeGeo);
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x71717a });
  const cubeEdges = new THREE.LineSegments(edgeGeo, edgeMat);
  gizmoGroup.add(cubeEdges);

  // 5. Ejes Coordenados y Botones (X Rojo, Y Verde, Z Azul)
  function createAxis(
    dir: THREE.Vector3,
    colorHex: number,
    axisName: CanonicalView,
    label: string
  ) {
    const axisGroup = new THREE.Group();

    // Línea/Cilindro del eje
    const cylGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.55, 12);
    const cylMat = new THREE.MeshBasicMaterial({ color: colorHex });
    const cyl = new THREE.Mesh(cylGeo, cylMat);
    cyl.position.y = 0.28;
    axisGroup.add(cyl);

    // Botón esférico de extremo con texto
    const pillGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const pillMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.3,
      metalness: 0.2,
    });
    const pill = new THREE.Mesh(pillGeo, pillMat);
    pill.position.y = 0.62;
    pill.userData = { isAxisPill: true, axisView: axisName, label };
    axisGroup.add(pill);
    clickablePills.push(pill);

    // Orientar hacia la dirección requerida
    if (dir.x > 0) {
      axisGroup.rotation.z = -Math.PI / 2;
    } else if (dir.x < 0) {
      axisGroup.rotation.z = Math.PI / 2;
    } else if (dir.y < 0) {
      axisGroup.rotation.z = Math.PI;
    } else if (dir.z > 0) {
      axisGroup.rotation.x = Math.PI / 2;
    } else if (dir.z < 0) {
      axisGroup.rotation.x = -Math.PI / 2;
    }

    gizmoGroup?.add(axisGroup);
  }

  // +X (Derecha / Perfil)
  createAxis(new THREE.Vector3(1, 0, 0), 0xef4444, 'right', 'X');
  // +Y (Superior / Cenital)
  createAxis(new THREE.Vector3(0, 1, 0), 0x22c55e, 'top', 'Y');
  // +Z (Frontal / Frente)
  createAxis(new THREE.Vector3(0, 0, 1), 0x3b82f6, 'front', 'Z');

  // 6. Bucle de render del widget
  const renderGizmo = () => {
    if (gizmoGroup) {
      // Sincronizar ángulo exacto
      gizmoGroup.rotation.x = currentRotation.value.x;
      gizmoGroup.rotation.y = currentRotation.value.y;
      gizmoGroup.rotation.z = currentRotation.value.z;
    }
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
    animId = requestAnimationFrame(renderGizmo);
  };
  renderGizmo();

  // 7. Eventos de interacción en el widget
  const canvas = canvasRef.value;

  const onPointerDown = (e: PointerEvent) => {
    isDragging = true;
    previousPointer = { x: e.clientX, y: e.clientY };

    // Verificar si se hizo clic directo sobre un botón de eje
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (camera) {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickablePills, true);
      if (hits.length > 0) {
        const hitPill = hits[0].object;
        const view = hitPill.userData.axisView as CanonicalView;
        if (view) {
          snapTo(view);
          isDragging = false;
        }
      }
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - previousPointer.x;
    const deltaY = e.clientY - previousPointer.y;

    const rotSpeed = 0.012;
    applyDelta(deltaY * rotSpeed * 0.5, deltaX * rotSpeed, 0);

    previousPointer = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = () => {
    isDragging = false;
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
});

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId);
  if (renderer) renderer.dispose();
});
</script>

<template>
  <aside class="rotation-widget-container glass-panel">
    <div class="widget-header">
      <div class="header-left">
        <Compass :size="13" class="widget-icon" />
        <span class="widget-title">Orientación</span>
      </div>
      <button class="reset-icon-btn" title="Restablecer vista a 0°" @click="resetRotation">
        <RotateCcw :size="12" />
      </button>
    </div>

    <!-- Mini Lienzo 3D -->
    <div class="canvas-box">
      <canvas ref="canvasRef" class="gizmo-canvas"></canvas>
    </div>

    <!-- Botones de Vistas Rápidas -->
    <div class="quick-views">
      <button class="view-pill x-pill" title="Vista Lateral (Eje X)" @click="snapTo('right')">X</button>
      <button class="view-pill y-pill" title="Vista Cenital (Eje Y)" @click="snapTo('top')">Y</button>
      <button class="view-pill z-pill" title="Vista Frontal (Eje Z)" @click="snapTo('front')">Z</button>
    </div>
  </aside>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.rotation-widget-container {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.55rem 0.65rem;
  z-index: 10;
  gap: 0.35rem;
  width: 124px;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 0.2rem;

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    color: $text-secondary;
    font-size: 0.7rem;
    font-weight: 500;

    .widget-icon {
      color: $accent-primary;
    }
  }

  .reset-icon-btn {
    color: $text-muted;
    padding: 0.2rem;
    border-radius: $radius-sm;
    transition: all $transition-fast;

    &:hover {
      color: #f59e0b;
      background: rgba(255, 255, 255, 0.08);
      transform: rotate(-30deg);
    }
  }
}

.canvas-box {
  width: 110px;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  .gizmo-canvas {
    width: 110px;
    height: 110px;
    display: block;
    outline: none;
  }
}

.quick-views {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  width: 100%;
  justify-content: center;

  .view-pill {
    width: 22px;
    height: 20px;
    border-radius: $radius-sm;
    font-size: 0.68rem;
    font-weight: 700;
    font-family: monospace;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all $transition-fast;
    cursor: pointer;

    &.x-pill {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);

      &:hover {
        background: rgba(239, 68, 68, 0.35);
        color: #ffffff;
      }
    }

    &.y-pill {
      color: #22c55e;
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);

      &:hover {
        background: rgba(34, 197, 94, 0.35);
        color: #ffffff;
      }
    }

    &.z-pill {
      color: #3b82f6;
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.3);

      &:hover {
        background: rgba(59, 130, 246, 0.35);
        color: #ffffff;
      }
    }
  }
}
</style>
