<script setup lang="ts">
import { useAppState } from '../composables/useAppState';
import { useI18n } from '../composables/useI18n';
import { X, Pen, Eraser, PaintBucket, Pipette, Lasso, Ruler, Layers, Trash2, Save, Grid, Move, ZoomIn, Undo, Redo, Smartphone, Sliders, FlipHorizontal } from 'lucide-vue-next';

const { isHelpOpen } = useAppState();
const { t } = useI18n();
</script>

<template>
  <div v-if="isHelpOpen" class="help-overlay" @click.self="isHelpOpen = false">
    <div class="help-panel">
      <div class="panel-header">
        <span class="title">{{ t('helpTitle') }}</span>
        <button class="btn-close" @click="isHelpOpen = false">
          <X :size="18" />
        </button>
      </div>

      <div class="help-content">
        <!-- Tools Section -->
        <div class="category-header">Herramientas (Tools)</div>
        <div class="shortcut-row">
          <Pen :size="15" class="icon" />
          <span>{{ t('helpPen') }}</span>
        </div>
        <div class="shortcut-row">
          <Eraser :size="15" class="icon" />
          <span>{{ t('helpEraser') }}</span>
        </div>
        <div class="shortcut-row">
          <PaintBucket :size="15" class="icon" />
          <span>{{ t('helpBucket') }}</span>
        </div>
        <div class="shortcut-row">
          <Pipette :size="15" class="icon" />
          <span>{{ t('helpEyedropper') }}</span>
        </div>
        <div class="shortcut-row">
          <Lasso :size="15" class="icon" />
          <span>L / 5: {{ t('lasso') || 'Lazo de Selección' }}</span>
        </div>
        <div class="shortcut-row">
          <Ruler :size="15" class="icon" />
          <span>R: {{ t('ruler') || 'Alternar Reglas Guía (Recta / Radial)' }}</span>
        </div>
        <div class="shortcut-row">
          <Sliders :size="15" class="icon" />
          <span>{{ t('helpBrushSize') }}</span>
        </div>

        <div class="divider"></div>

        <!-- History & Selection -->
        <div class="category-header">Edición y Selección (Edit & Selection)</div>
        <div class="shortcut-row">
          <Undo :size="15" class="icon" />
          <span>{{ t('helpUndo') }}</span>
        </div>
        <div class="shortcut-row">
          <Redo :size="15" class="icon" />
          <span>{{ t('helpRedo') }}</span>
        </div>
        <div class="shortcut-row">
          <X :size="15" class="icon" />
          <span>Ctrl + D: {{ t('deselect') || 'Deseleccionar' }}</span>
        </div>
        <div class="shortcut-row">
          <FlipHorizontal :size="15" class="icon" />
          <span>Ctrl + Shift + I: {{ t('invertSelection') || 'Invertir selección' }}</span>
        </div>
        <div class="shortcut-row">
          <Layers :size="15" class="icon" />
          <span>{{ t('helpNewLayer') }}</span>
        </div>
        <div class="shortcut-row">
          <Trash2 :size="15" class="icon" />
          <span>Supr / Delete: {{ t('deleteLayer') }}</span>
        </div>
        <div class="shortcut-row">
          <Save :size="15" class="icon" />
          <span>{{ t('helpSave') }}</span>
        </div>
        <div class="shortcut-row">
          <Grid :size="15" class="icon" />
          <span>{{ t('helpGrid') }}</span>
        </div>

        <div class="divider"></div>

        <!-- Navigation 3D -->
        <div class="category-header">Navegación 360° (View)</div>
        <div class="shortcut-row">
          <Move :size="15" class="icon" />
          <span>{{ t('helpSpaceDrag') }}</span>
        </div>
        <div class="shortcut-row">
          <ZoomIn :size="15" class="icon" />
          <span>{{ t('helpZDrag') }}</span>
        </div>

        <div class="divider"></div>

        <!-- Touch Gestures -->
        <div class="category-header">Gestos Táctiles (Mobile / Tablet)</div>
        <div class="shortcut-row">
          <Smartphone :size="15" class="icon" />
          <span>{{ t('helpTouchDraw') }}</span>
        </div>
        <div class="shortcut-row">
          <Smartphone :size="15" class="icon" />
          <span>{{ t('helpTouchOrbit') }}</span>
        </div>
        <div class="shortcut-row">
          <Smartphone :size="15" class="icon" />
          <span>{{ t('helpTouchPinch') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.help-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px;
}

.help-panel {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;

  .title {
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
  }

  .btn-close {
    background: transparent;
    border: none;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;

    &:hover {
      color: #0f172a;
    }
  }
}

.help-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shortcut-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #334155;

  .icon {
    color: #2563eb;
    flex-shrink: 0;
  }
}

.divider {
  height: 1px;
  background: #e2e8f0;
  margin: 4px 0;
}
</style>
