<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useAppState } from '../composables/useAppState';
import { useLayers } from '../composables/useLayers';
import { useProjectStorage } from '../composables/useProjectStorage';
import { useI18n } from '../composables/useI18n';
import { X, Image as ImageIcon, Check } from 'lucide-vue-next';

const { isPreviewOpen, seamOffset, setSeamOffset } = useAppState();
const { masterCanvas, recomposeMaster } = useLayers();
const { exportPng } = useProjectStorage();
const { t } = useI18n();

const previewCanvasRef = ref<HTMLCanvasElement | null>(null);
const seamHandleRef = ref<HTMLElement | null>(null);
const isDraggingSeam = ref(false);

function renderPreview() {
  const canvas = previewCanvasRef.value;
  if (!canvas || !masterCanvas) return;
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;

  // 1. Fill solid white background (like Gururi Paint original)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  const mw = masterCanvas.width;
  const mh = masterCanvas.height;
  if (mw === 0 || mh === 0) return;

  const shiftX = Math.floor(seamOffset.value * mw);

  // 2. Draw shifted wrapped master canvas
  if (shiftX === 0) {
    ctx.drawImage(masterCanvas, 0, 0, mw, mh, 0, 0, w, h);
  } else {
    const part1Width = mw - shiftX;
    const destPart1Width = (part1Width / mw) * w;
    const destPart2Width = w - destPart1Width;

    // Right part drawn to left
    ctx.drawImage(masterCanvas, shiftX, 0, part1Width, mh, 0, 0, destPart1Width, h);
    // Left part drawn to right
    ctx.drawImage(masterCanvas, 0, 0, shiftX, mh, destPart1Width, 0, destPart2Width, h);
  }

  // 3. Draw seam guide line
  ctx.save();
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  const lineX = seamOffset.value * w;
  ctx.beginPath();
  ctx.moveTo(lineX, 0);
  ctx.lineTo(lineX, h);
  ctx.stroke();
  ctx.restore();
}

function handleSeamPointer(e: PointerEvent) {
  const canvas = previewCanvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const relX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
  setSeamOffset(relX / rect.width);
  renderPreview();
}

function onSeamDown(e: PointerEvent) {
  isDraggingSeam.value = true;
  (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
  handleSeamPointer(e);
}

function onSeamMove(e: PointerEvent) {
  if (isDraggingSeam.value) handleSeamPointer(e);
}

function onSeamUp(e: PointerEvent) {
  isDraggingSeam.value = false;
  (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
}

watch(isPreviewOpen, (open) => {
  if (open) {
    recomposeMaster();
    nextTick(() => {
      renderPreview();
    });
  }
});
</script>

<template>
  <div v-if="isPreviewOpen" class="preview-overlay" @click.self="isPreviewOpen = false">
    <div class="preview-panel">
      <div class="panel-header">
        <span class="title">{{ t('preview') }}</span>
        <button class="btn-close" @click="isPreviewOpen = false">
          <X :size="18" />
        </button>
      </div>

      <div class="canvas-wrap">
        <!-- Seam marker handle -->
        <div
          ref="seamHandleRef"
          class="seam-handle"
          :style="{ left: `${seamOffset * 100}%` }"
          :title="t('dragToAdjustSeam')"
          @pointerdown="onSeamDown"
          @pointermove="onSeamMove"
          @pointerup="onSeamUp"
        >
          <span>▼</span>
        </div>

        <canvas
          ref="previewCanvasRef"
          width="800"
          height="400"
          class="preview-canvas"
          @pointerdown="onSeamDown"
          @pointermove="onSeamMove"
          @pointerup="onSeamUp"
        ></canvas>
      </div>

      <div class="panel-footer">
        <span class="hint">{{ t('dragToAdjustSeam') }}</span>
        <button class="btn-export" @click="exportPng()">
          <ImageIcon :size="15" />
          <span>{{ t('savePng') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px;
}

.preview-panel {
  background: #1e293b;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  max-width: 90vw;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #0f172a;
  color: #fff;

  .title {
    font-size: 14px;
    font-weight: 600;
  }

  .btn-close {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    display: flex;
    align-items: center;

    &:hover {
      color: #fff;
    }
  }
}

.canvas-wrap {
  position: relative;
  padding: 24px 20px 10px 20px;
  display: flex;
  justify-content: center;
}

.preview-canvas {
  max-width: 100%;
  height: auto;
  aspect-ratio: 2 / 1;
  background: #ffffff;
  border: 1px solid #475569;
  border-radius: 6px;
  display: block;
  cursor: ew-resize;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.seam-handle {
  position: absolute;
  top: 4px;
  transform: translateX(-50%);
  color: #38bdf8;
  font-size: 16px;
  cursor: ew-resize;
  user-select: none;
  touch-action: none;
  z-index: 10;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
}

.panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px 14px 20px;
  color: #94a3b8;
  font-size: 12px;

  .hint {
    color: #cbd5e1;
  }

  .btn-export {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #2563eb;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: #1d4ed8;
    }
  }
}
</style>
