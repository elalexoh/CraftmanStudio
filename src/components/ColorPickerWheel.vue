<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { usePainting } from '../composables/usePainting';
import { useI18n } from '../composables/useI18n';

const { penColor, setPenColor, recentColors } = usePainting();
const { t } = useI18n();

// HSV state
const hue = ref<number>(0); // 0 - 360
const sat = ref<number>(100); // 0 - 100
const val = ref<number>(100); // 0 - 100

const wheelCanvasRef = ref<HTMLCanvasElement | null>(null);
const boxCanvasRef = ref<HTMLCanvasElement | null>(null);
const nativeColorInput = ref<HTMLInputElement | null>(null);

const isDraggingHue = ref(false);
const isDraggingBox = ref(false);

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  s = s / 100;
  v = v / 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function hexToHsv(hex: string): [number, number, number] {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;

  if (max !== min) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return [h, s, v];
}

function updateColorFromHsv() {
  const [r, g, b] = hsvToRgb(hue.value, sat.value, val.value);
  const hex = rgbToHex(r, g, b);
  setPenColor(hex);
  drawBoxCanvas();
}

function drawHueRing() {
  const canvas = wheelCanvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d')!;
  const size = canvas.width;
  const center = size / 2;
  const outerR = center - 4;
  const innerR = outerR - 18;

  ctx.clearRect(0, 0, size, size);

  for (let angle = 0; angle < 360; angle += 1) {
    const startRad = ((angle - 1) * Math.PI) / 180;
    const endRad = ((angle + 1) * Math.PI) / 180;
    ctx.beginPath();
    ctx.arc(center, center, outerR, startRad, endRad, false);
    ctx.arc(center, center, innerR, endRad, startRad, true);
    ctx.closePath();
    ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
    ctx.fill();
  }
}

function drawBoxCanvas() {
  const canvas = boxCanvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Base hue
  ctx.fillStyle = `hsl(${hue.value}, 100%, 50%)`;
  ctx.fillRect(0, 0, w, h);

  // White gradient (left to right)
  const whiteGrad = ctx.createLinearGradient(0, 0, w, 0);
  whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
  whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = whiteGrad;
  ctx.fillRect(0, 0, w, h);

  // Black gradient (top to bottom)
  const blackGrad = ctx.createLinearGradient(0, 0, 0, h);
  blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
  blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.fillStyle = blackGrad;
  ctx.fillRect(0, 0, w, h);
}

function handleHuePointer(e: PointerEvent) {
  const canvas = wheelCanvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = e.clientX - cx;
  const dy = e.clientY - cy;

  let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (angle < 0) angle += 360;
  hue.value = Math.round(angle) % 360;
  updateColorFromHsv();
}

function handleBoxPointer(e: PointerEvent) {
  const canvas = boxCanvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
  const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

  sat.value = Math.round((x / rect.width) * 100);
  val.value = Math.round((1 - y / rect.height) * 100);
  updateColorFromHsv();
}

function onHueDown(e: PointerEvent) {
  isDraggingHue.value = true;
  (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
  handleHuePointer(e);
}

function onHueMove(e: PointerEvent) {
  if (isDraggingHue.value) handleHuePointer(e);
}

function onHueUp(e: PointerEvent) {
  isDraggingHue.value = false;
  (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
}

function onBoxDown(e: PointerEvent) {
  isDraggingBox.value = true;
  (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
  handleBoxPointer(e);
}

function onBoxMove(e: PointerEvent) {
  if (isDraggingBox.value) handleBoxPointer(e);
}

function onBoxUp(e: PointerEvent) {
  isDraggingBox.value = false;
  (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
}

function selectRecentColor(hex: string) {
  setPenColor(hex);
  const [h, s, v] = hexToHsv(hex);
  hue.value = h;
  sat.value = s;
  val.value = v;
  drawBoxCanvas();
}

function triggerNativeColor() {
  if (nativeColorInput.value) {
    nativeColorInput.value.click();
  }
}

function onNativeColorChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.value) {
    selectRecentColor(target.value);
  }
}

watch(penColor, (newColor) => {
  const [h, s, v] = hexToHsv(newColor);
  hue.value = h;
  sat.value = s;
  val.value = v;
  drawBoxCanvas();
}, { immediate: true });

onMounted(() => {
  drawHueRing();
  drawBoxCanvas();
});
</script>

<template>
  <div class="color-picker-container">
    <div class="color-header">
      <span class="color-title">{{ t('color') }}</span>
      <button
        class="current-color-badge"
        :style="{ backgroundColor: penColor }"
        :title="t('currentColor')"
        @click="triggerNativeColor"
      ></button>
      <input
        ref="nativeColorInput"
        type="color"
        :value="penColor"
        class="hidden-color-input"
        @input="onNativeColorChange"
      />
    </div>

    <!-- HSV Circle Picker -->
    <div class="color-wheel-wrapper">
      <canvas
        ref="wheelCanvasRef"
        width="180"
        height="180"
        class="hue-canvas"
        @pointerdown="onHueDown"
        @pointermove="onHueMove"
        @pointerup="onHueUp"
      ></canvas>

      <!-- Center Box -->
      <div class="center-box-container">
        <canvas
          ref="boxCanvasRef"
          width="88"
          height="88"
          class="box-canvas"
          @pointerdown="onBoxDown"
          @pointermove="onBoxMove"
          @pointerup="onBoxUp"
        ></canvas>

        <!-- Box handle -->
        <div
          class="box-handle"
          :style="{
            left: `${sat}%`,
            top: `${100 - val}%`,
            backgroundColor: penColor
          }"
        ></div>
      </div>
    </div>

    <!-- Recent Colors -->
    <div class="recent-colors-section">
      <div class="recent-colors-grid">
        <button
          v-for="(hex, idx) in recentColors"
          :key="idx"
          class="recent-color-swatch"
          :class="{ active: hex.toLowerCase() === penColor.toLowerCase() }"
          :style="{ backgroundColor: hex }"
          @click="selectRecentColor(hex)"
        ></button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.color-picker-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 8px;
}

.color-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.color-title {
  font-size: 13px;
  font-weight: bold;
  color: #333;
}

.current-color-badge {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #ccc, inset 0 0 2px rgba(0,0,0,0.2);
  cursor: pointer;
  transition: transform 0.1s ease;

  &:hover {
    transform: scale(1.08);
  }
}

.hidden-color-input {
  display: none;
}

.color-wheel-wrapper {
  position: relative;
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
}

.hue-canvas {
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  cursor: crosshair;
}

.center-box-container {
  position: relative;
  width: 88px;
  height: 88px;
  border-radius: 4px;
  overflow: visible;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.15);
}

.box-canvas {
  width: 88px;
  height: 88px;
  border-radius: 4px;
  cursor: crosshair;
  display: block;
}

.box-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 2px rgba(0,0,0,0.8);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.recent-colors-section {
  width: 100%;
}

.recent-colors-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 5px;
  width: 100%;
}

.recent-color-swatch {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.2);
  cursor: pointer;
  padding: 0;
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.15);
  }

  &.active {
    outline: 2px solid #2563eb;
    outline-offset: 1px;
  }
}
</style>
