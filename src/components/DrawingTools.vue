<script setup lang="ts">
import { ref } from 'vue';
import { usePainting } from '../composables/usePainting';
import { useRulers } from '../composables/useRulers';
import { useSelection } from '../composables/useSelection';
import { useI18n } from '../composables/useI18n';
import type { ToolType, RulerType } from '../types/painting';
import ColorPickerWheel from './ColorPickerWheel.vue';
import { Pen, Eraser, PaintBucket, Pipette, Lasso, Ruler, Minus, Plus, ChevronDown } from 'lucide-vue-next';

const { currentTool, penSize, setTool, setPenSize, penColor } = usePainting();
const { activeRuler, setRuler } = useRulers();
const { hasSelection, deselect } = useSelection();
const { t } = useI18n();

const showMobileColorPopup = ref(false);
const showRulerMenu = ref(false);

function adjustSize(delta: number) {
  setPenSize(penSize.value + delta);
}

function selectRuler(ruler: RulerType) {
  setRuler(ruler);
  showRulerMenu.value = false;
}
</script>

<template>
  <aside class="drawing-tools-sidebar">
    <!-- Tool Selector Buttons -->
    <div class="tool-buttons-group">
      <button
        class="tool-btn"
        :class="{ active: currentTool === 'pen' }"
        :title="t('pen')"
        @click="setTool('pen')"
      >
        <Pen :size="18" />
        <span>{{ t('pen') }}</span>
      </button>

      <button
        class="tool-btn"
        :class="{ active: currentTool === 'eraser' }"
        :title="t('eraser')"
        @click="setTool('eraser')"
      >
        <Eraser :size="18" />
        <span>{{ t('eraser') }}</span>
      </button>

      <button
        class="tool-btn"
        :class="{ active: currentTool === 'bucket' }"
        :title="t('bucket')"
        @click="setTool('bucket')"
      >
        <PaintBucket :size="18" />
        <span>{{ t('bucket') }}</span>
      </button>

      <button
        class="tool-btn"
        :class="{ active: currentTool === 'eyedropper' }"
        :title="t('eyedropper')"
        @click="setTool('eyedropper')"
      >
        <Pipette :size="18" />
        <span>{{ t('eyedropper') }}</span>
      </button>

      <button
        class="tool-btn"
        :class="{ active: currentTool === 'lasso' }"
        :title="t('lasso') || 'Lazo de Selección'"
        @click="setTool('lasso')"
      >
        <Lasso :size="18" />
        <span>{{ t('lasso') || 'Lazo' }}</span>
      </button>

      <!-- Ruler Selector with Dropdown -->
      <div class="ruler-dropdown-wrap">
        <button
          class="tool-btn"
          :class="{ active: activeRuler !== 'none' }"
          :title="t('ruler') || 'Reglas Guía'"
          @click="showRulerMenu = !showRulerMenu"
        >
          <Ruler :size="18" />
          <span>{{ activeRuler === 'none' ? (t('ruler') || 'Regla') : activeRuler === 'vertical' ? 'Vertical' : activeRuler === 'horizontal' ? 'Horizontal' : 'Radial' }}</span>
          <ChevronDown :size="10" class="arrow-icon" />
        </button>

        <div v-if="showRulerMenu" class="ruler-menu">
          <button
            class="ruler-menu-item"
            :class="{ selected: activeRuler === 'none' }"
            @click="selectRuler('none')"
          >
            <span>Desactivada</span>
          </button>
          <button
            class="ruler-menu-item"
            :class="{ selected: activeRuler === 'vertical' }"
            @click="selectRuler('vertical')"
          >
            <span>↕️ Regla Vertical (360°)</span>
          </button>
          <button
            class="ruler-menu-item"
            :class="{ selected: activeRuler === 'horizontal' }"
            @click="selectRuler('horizontal')"
          >
            <span>↔️ Regla Horizontal (Latitud)</span>
          </button>
          <button
            class="ruler-menu-item"
            :class="{ selected: activeRuler === 'radial' }"
            @click="selectRuler('radial')"
          >
            <span>🎯 Regla Radial (Perspectiva)</span>
          </button>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Pen Size Control -->
    <div class="size-control-group">
      <div class="size-header">
        <span class="size-label">{{ t('thickness') }}</span>
      </div>

      <div class="size-slider-row">
        <button class="step-btn" :title="t('thinner')" @click="adjustSize(-1)">
          <Minus :size="12" />
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
          <Plus :size="12" />
        </button>
      </div>

      <input
        type="number"
        min="1"
        max="50"
        :value="penSize"
        class="size-num-input"
        @input="setPenSize(parseInt(($event.target as HTMLInputElement).value, 10))"
      />
    </div>

    <div class="divider"></div>

    <!-- Color Picker Wheel -->
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
  width: 210px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 90;
  user-select: none;
}

.tool-buttons-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 8px 6px;
  font-size: 12px;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
  }

  &.active {
    background: #2563eb;
    border-color: #1d4ed8;
    color: #fff;
  }
}

.ruler-dropdown-wrap {
  position: relative;
  width: 100%;

  .tool-btn {
    width: 100%;
    .arrow-icon {
      margin-left: auto;
    }
  }

  .ruler-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 200px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    z-index: 100;

    .ruler-menu-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 10px;
      font-size: 12px;
      font-weight: 500;
      color: #334155;
      background: transparent;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s;

      &:hover {
        background: #f1f5f9;
        color: #0f172a;
      }

      &.selected {
        background: #eff6ff;
        color: #2563eb;
        font-weight: 700;
      }
    }
  }
}

.divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0 -2px;
}

.size-control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.size-header {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.size-slider-row {
  display: flex;
  align-items: center;
  gap: 6px;

  .step-btn {
    width: 22px;
    height: 22px;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
      background: #e2e8f0;
    }
  }

  .size-slider {
    flex: 1;
    cursor: pointer;
  }
}

.size-num-input {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}

.color-picker-section {
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .drawing-tools-sidebar {
    top: 56px;
    left: 8px;
    width: 190px;
    padding: 8px;
  }
}
</style>
