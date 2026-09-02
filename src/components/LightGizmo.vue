<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useLightingState } from '../composables/useLightingState';
import { useSelectionState } from '../composables/useSelectionState';
import { Sun, Compass } from 'lucide-vue-next';

const { lightState, setPositionSpherical } = useLightingState();
const { selectedTarget, setSelection } = useSelectionState();

const gizmoCanvasRef = ref<HTMLCanvasElement | null>(null);
const isDragging = ref(false);

const drawGizmo = () => {
  const canvas = gizmoCanvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const radius = width * 0.42;
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.clearRect(0, 0, width, height);

  // 1. Fondo de la esfera (gradiente 3D para efecto de volumen)
  const azRad = (lightState.value.azimuth * Math.PI) / 180;
  const elRad = (lightState.value.elevation * Math.PI) / 180;

  // Proyección 2D del vector de luz en el círculo
  const lightX = centerX + radius * Math.cos(elRad) * Math.sin(azRad);
  const lightY = centerY - radius * Math.sin(elRad); // Invertir eje Y

  // Gradiente radial simulando la iluminación en la mini-esfera
  const sphereGrad = ctx.createRadialGradient(
    lightX,
    lightY,
    radius * 0.1,
    centerX,
    centerY,
    radius
  );
  sphereGrad.addColorStop(0, '#383842');
  sphereGrad.addColorStop(0.5, '#22222a');
  sphereGrad.addColorStop(1, '#131316');

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = sphereGrad;
  ctx.fill();

  // Borde de la esfera
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = selectedTarget.value === 'light' ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)';
  ctx.stroke();

  // 2. Líneas de referencia de cuadrícula (Ecuador y Meridiano)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  // Ecuador
  ctx.ellipse(centerX, centerY, radius, radius * 0.35, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  // Meridiano
  ctx.ellipse(centerX, centerY, radius * 0.35, radius, 0, 0, Math.PI * 2);
  ctx.stroke();

  // 3. Indicador de la posición de la Luz (Punto brillante)
  ctx.beginPath();
  ctx.arc(lightX, lightY, 6, 0, Math.PI * 2);
  ctx.fillStyle = lightState.value.color;
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 10;
  ctx.fill();

  // Anillo alrededor del punto de luz
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.restore();
};

const handlePointer = (event: PointerEvent) => {
  const canvas = gizmoCanvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const radius = rect.width * 0.42;

  const dx = event.clientX - rect.left - centerX;
  const dy = event.clientY - rect.top - centerY;

  // Distancia normalizada al centro
  const dist = Math.hypot(dx, dy);
  const clampedDist = Math.min(dist, radius);
  const factor = clampedDist / radius;

  // Calcular ángulo en el plano (Azimut)
  let angleDeg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  if (angleDeg < 0) angleDeg += 360;

  // Calcular elevación (-80° a 80°)
  // Si está cerca del centro -> elevación alta (~75°), en el borde -> rasante (~0°)
  const elevationDeg = (1 - factor) * 80;

  setPositionSpherical(Math.round(angleDeg), Math.round(elevationDeg));
  setSelection('light');
};

const onPointerDown = (event: PointerEvent) => {
  isDragging.value = true;
  handlePointer(event);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
};

const onPointerMove = (event: PointerEvent) => {
  if (isDragging.value) {
    handlePointer(event);
  }
};

const onPointerUp = () => {
  isDragging.value = false;
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
};

watch(
  [() => lightState.value, selectedTarget],
  () => {
    drawGizmo();
  },
  { deep: true }
);

onMounted(() => {
  drawGizmo();
});

onUnmounted(() => {
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
});
</script>

<template>
  <div
    class="light-gizmo-wrapper glass-panel"
    :class="{ 'is-selected': selectedTarget === 'light' }"
    title="Esfera Gizmo: Haz clic y arrastra para orientar la luz"
  >
    <div class="gizmo-header" @click="setSelection('light')">
      <div class="title-wrap">
        <Sun :size="14" class="icon" />
        <span>Gizmo de Luz</span>
      </div>
      <span class="coords-badge">
        {{ Math.round(lightState.azimuth) }}° / {{ Math.round(lightState.elevation) }}°
      </span>
    </div>

    <div class="canvas-box">
      <canvas
        ref="gizmoCanvasRef"
        width="110"
        height="110"
        class="gizmo-canvas"
        @pointerdown="onPointerDown"
      ></canvas>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.light-gizmo-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.6rem;
  width: 124px;
  cursor: pointer;
  transition: border-color $transition-fast, box-shadow $transition-fast;

  &.is-selected {
    border-color: rgba(245, 158, 11, 0.6);
    box-shadow: 0 0 16px rgba(245, 158, 11, 0.25);
  }
}

.gizmo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 0.35rem;
  font-size: 0.7rem;
  color: $text-secondary;

  .title-wrap {
    display: flex;
    align-items: center;
    gap: 0.3rem;

    .icon {
      color: #f59e0b;
    }
  }

  .coords-badge {
    font-size: 0.65rem;
    font-family: monospace;
    color: $text-muted;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.1rem 0.3rem;
    border-radius: $radius-sm;
  }
}

.canvas-box {
  display: flex;
  justify-content: center;
  align-items: center;
}

.gizmo-canvas {
  width: 110px;
  height: 110px;
  display: block;
  cursor: crosshair;
  touch-action: none;
}
</style>
