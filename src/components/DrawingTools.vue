<script setup lang="ts">
import { usePainting } from '../composables/usePainting';
import { useRulers } from '../composables/useRulers';
import { useI18n } from '../composables/useI18n';
import ColorPickerWheel from './ColorPickerWheel.vue';
import {
  Pen,
  Eraser,
  PaintBucket,
  Pipette,
  Lasso,
  Ruler,
  Minus,
  Plus,
  FlipHorizontal,
  FlipVertical
} from 'lucide-vue-next';

const { currentTool, penSize, setTool, setPenSize, flipHorizontal, flipVertical } = usePainting();
const { activeRuler, setRuler } = useRulers();
const { t } = useI18n();

function adjustSize(delta: number) {
  setPenSize(penSize.value + delta);
}
</script>

<template>
  <aside class="drawing-tools-sidebar">
    <!-- 1. Primary Tool Buttons Grid (2x3) -->
    <div class="tool-buttons-group">
      <!-- Pen -->
      <button
        class="tool-btn"
        :class="{ active: currentTool === 'pen' }"
        :title="t('pen')"
        @click="setTool('pen')"
      >
        <Pen :size="16" />
        <span>{{ t('pen') }}</span>
      </button>

      <!-- Eraser -->
      <button
        class="tool-btn"
        :class="{ active: currentTool === 'eraser' }"
        :title="t('eraser')"
        @click="setTool('eraser')"
      >
        <Eraser :size="16" />
        <span>{{ t('eraser') }}</span>
      </button>

      <!-- Paint Bucket -->
      <button
        class="tool-btn"
        :class="{ active: currentTool === 'bucket' }"
        :title="t('bucket')"
        @click="setTool('bucket')"
      >
        <PaintBucket :size="16" />
        <span>{{ t('bucket') }}</span>
      </button>

      <!-- Eyedropper -->
      <button
        class="tool-btn"
        :class="{ active: currentTool === 'eyedropper' }"
        :title="t('eyedropper')"
        @click="setTool('eyedropper')"
      >
        <Pipette :size="16" />
        <span>{{ t('eyedropper') }}</span>
      </button>

      <!-- Lasso -->
      <button
        class="tool-btn"
        :class="{ active: currentTool === 'lasso' }"
        :title="t('lasso') || 'Lazo de Selección'"
        @click="setTool('lasso')"
      >
        <Lasso :size="16" />
        <span>{{ t('lasso') || 'Lazo' }}</span>
      </button>

      <!-- Orthogonal Ruler Toggle Button -->
      <button
        class="tool-btn"
        :class="{ active: activeRuler === 'orthogonal' }"
        :title="activeRuler === 'orthogonal' ? 'Regla Ortogonal: Activa (H / V)' : 'Activar Regla Ortogonal (H / V)'"
        @click="setRuler(activeRuler === 'orthogonal' ? 'none' : 'orthogonal')"
      >
        <Ruler :size="16" />
        <span>{{ activeRuler === 'orthogonal' ? 'Ortogonal: ON' : 'Ortogonal' }}</span>
      </button>
    </div>

    <!-- 2. Flip Transformations -->
    <div class="flip-actions-group">
      <button
        class="flip-btn"
        :title="t('flipHorizontal') || 'Voltear Horizontal (Espejo)'"
        @click="flipHorizontal"
      >
        <FlipHorizontal :size="14" />
        <span>Voltear H</span>
      </button>
      <button
        class="flip-btn"
        :title="t('flipVertical') || 'Voltear Vertical'"
        @click="flipVertical"
      >
        <FlipVertical :size="14" />
        <span>Voltear V</span>
      </button>
    </div>

    <div class="divider"></div>

    <!-- 3. Pen Size Slider & Stepper -->
    <div class="size-control-group">
      <div class="size-header">
        <span class="size-label">{{ t('thickness') }}</span>
        <div class="size-value-badge">
          <input
            type="number"
            min="1"
            max="50"
            :value="penSize"
            class="size-num-input"
            @input="setPenSize(parseInt(($event.target as HTMLInputElement).value, 10) || 1)"
          />
          <span class="size-unit">px</span>
        </div>
      </div>

      <div class="size-slider-row">
        <button class="step-btn" :title="t('thinner')" @click="adjustSize(-1)">
          <Minus :size="11" />
        </button>
        <input
          type="range"
          min="1"
          max="50"
          :value="penSize"
          class="size-slider"
          @input="setPenSize(parseInt(($event.target as HTMLInputElement).value, 10))"
        />
        <button class="step-btn" :title="t('thicker')" @click="adjustSize(1)">
          <Plus :size="11" />
        </button>
      </div>
    </div>

    <div class="divider"></div>

    <!-- 4. Color Picker Wheel -->
    <div class="color-picker-section">
      <ColorPickerWheel />
    </div>
  </aside>
</template>

<style scoped lang="scss">
.drawing-tools-sidebar {
  position: absolute;
  top: 60px;
  left: 12px;
  width: 216px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 90;
  user-select: none;
}

/* 1. Primary Tool Buttons Grid */
.tool-buttons-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 7px 6px;
  font-size: 11px;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
    color: #0f172a;
  }

  &.active {
    background: #2563eb;
    border-color: #1d4ed8;
    color: #ffffff;
  }
}

/* 2. Flip Transformation Actions */
.flip-actions-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}

.flip-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 5px 4px;
  font-size: 11px;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
  box-sizing: border-box;

  &:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
    color: #0f172a;
  }

  &:active {
    background: #eff6ff;
    border-color: #93c5fd;
    color: #1d4ed8;
  }
}

/* 3. Divider */
.divider {
  height: 1px;
  background: #e2e8f0;
  margin: 1px 0;
}

/* 4. Size Control Group */
.size-control-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.size-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.size-label {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
}

.size-value-badge {
  display: flex;
  align-items: center;
  gap: 2px;
}

.size-num-input {
  width: 38px;
  padding: 2px 3px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  background: #f8fafc;

  &:focus {
    outline: none;
    border-color: #2563eb;
    background: #ffffff;
  }
}

.size-unit {
  font-size: 10px;
  color: #94a3b8;
}

.size-slider-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.step-btn {
  width: 22px;
  height: 22px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #475569;
  transition: all 0.15s ease;
  flex-shrink: 0;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
}

.size-slider {
  flex: 1;
  height: 4px;
  accent-color: #2563eb;
  cursor: pointer;
}

/* 5. Color Picker Section */
.color-picker-section {
  display: flex;
  flex-direction: column;
}
</style>
