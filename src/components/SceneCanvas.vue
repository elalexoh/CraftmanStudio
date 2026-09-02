<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { SceneManager } from '../three/core/SceneManager';
import { useShapeState } from '../composables/useShapeState';
import { useLightingState } from '../composables/useLightingState';
import { useSelectionState } from '../composables/useSelectionState';
import { useGridState } from '../composables/useGridState';
import { useRotationState, type CanonicalView } from '../composables/useRotationState';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let sceneManager: SceneManager | null = null;

const { currentShape } = useShapeState();
const { lightState, cartesianPosition } = useLightingState();
const { selectedTarget, setSelection } = useSelectionState();
const {
  showGroundGrid,
  showObjectWireframe,
  wireframeOpacity,
  showObjectLineart,
  lineartOpacity,
  outlineThickness,
} = useGridState();

const {
  setRotation,
  deltaRotationTrigger,
  snapViewTrigger,
  resetRotationTrigger,
} = useRotationState();

onMounted(() => {
  if (canvasRef.value) {
    sceneManager = new SceneManager({
      canvas: canvasRef.value,
      antialias: true,
      onSelectionChange: (target) => {
        setSelection(target);
      },
      onRotationChange: (rot) => {
        setRotation(rot.x, rot.y, rot.z);
      },
    });

    // Sincronizar estado inicial
    sceneManager.setShape(currentShape.value);
    const [x, y, z] = cartesianPosition.value;
    sceneManager.setLightPosition(x, y, z);
    sceneManager.setLightIntensity(lightState.value.intensity);
    sceneManager.setLightColor(lightState.value.color);
    sceneManager.selectTarget(selectedTarget.value);

    // Sincronizar grilla de suelo
    sceneManager.setGroundGridVisible(showGroundGrid.value);

    // Sincronizar grilla/estructura del objeto
    sceneManager.setObjectWireframeVisible(showObjectWireframe.value);
    sceneManager.setObjectWireframeOpacity(wireframeOpacity.value);

    // Sincronizar lineart / contorno blanco
    sceneManager.setObjectLineartVisible(showObjectLineart.value);
    sceneManager.setObjectLineartOpacity(lineartOpacity.value);
    sceneManager.setObjectOutlineThickness(outlineThickness.value);
  }
});

// Reaccionar a cambios de forma
watch(currentShape, (newShape) => {
  if (sceneManager) {
    sceneManager.setShape(newShape);
  }
});

// Reaccionar a cambios de posición de luz
watch(cartesianPosition, ([x, y, z]) => {
  if (sceneManager) {
    sceneManager.setLightPosition(x, y, z);
  }
});

// Reaccionar a cambios de intensidad de luz
watch(
  () => lightState.value.intensity,
  (newIntensity) => {
    if (sceneManager) {
      sceneManager.setLightIntensity(newIntensity);
    }
  }
);

// Reaccionar a cambios de color de luz
watch(
  () => lightState.value.color,
  (newColor) => {
    if (sceneManager) {
      sceneManager.setLightColor(newColor);
    }
  }
);

// Reaccionar a cambios de selección desde la UI
watch(selectedTarget, (newTarget) => {
  if (sceneManager) {
    sceneManager.selectTarget(newTarget);
  }
});

// Reaccionar a cambios de grilla de suelo
watch(showGroundGrid, (visible) => {
  if (sceneManager) {
    sceneManager.setGroundGridVisible(visible);
  }
});

// Reaccionar a cambios de grilla / estructura del objeto
watch(showObjectWireframe, (visible) => {
  if (sceneManager) {
    sceneManager.setObjectWireframeVisible(visible);
  }
});

watch(wireframeOpacity, (opacity) => {
  if (sceneManager) {
    sceneManager.setObjectWireframeOpacity(opacity);
  }
});

// Reaccionar a cambios de lineart / contorno
watch(showObjectLineart, (visible) => {
  if (sceneManager) {
    sceneManager.setObjectLineartVisible(visible);
  }
});

watch(lineartOpacity, (opacity) => {
  if (sceneManager) {
    sceneManager.setObjectLineartOpacity(opacity);
  }
});

watch(outlineThickness, (thickness) => {
  if (sceneManager) {
    sceneManager.setObjectOutlineThickness(thickness);
  }
});

// Sincronizar deltas desde el Widget de rotación de la esquina
watch(deltaRotationTrigger, (delta) => {
  if (sceneManager && delta) {
    sceneManager.applyDeltaRotation(delta.dx, delta.dy, delta.dz);
  }
});

// Sincronizar vistas canónicas (clic en ejes X, Y, Z)
watch(snapViewTrigger, (view: CanonicalView | null) => {
  if (!sceneManager || !view) return;

  switch (view) {
    case 'front':
      sceneManager.setRotation(0, 0, 0);
      break;
    case 'right':
      sceneManager.setRotation(0, -Math.PI / 2, 0);
      break;
    case 'left':
      sceneManager.setRotation(0, Math.PI / 2, 0);
      break;
    case 'top':
      sceneManager.setRotation(Math.PI / 2, 0, 0);
      break;
    case 'bottom':
      sceneManager.setRotation(-Math.PI / 2, 0, 0);
      break;
    case 'back':
      sceneManager.setRotation(0, Math.PI, 0);
      break;
  }
});

// Reaccionar a trigger de reseteo de rotación
watch(resetRotationTrigger, () => {
  if (sceneManager) {
    sceneManager.resetRotation();
  }
});

onUnmounted(() => {
  if (sceneManager) {
    sceneManager.dispose();
    sceneManager = null;
  }
});

defineExpose({
  getSceneManager: () => sceneManager,
});
</script>

<template>
  <div class="canvas-wrapper">
    <canvas ref="canvasRef" class="webgl-canvas"></canvas>
  </div>
</template>

<style scoped lang="scss">
.canvas-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.webgl-canvas {
  width: 100%;
  height: 100%;
  display: block;
  outline: none;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}
</style>
