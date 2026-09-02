<script setup lang="ts">
import { useSelection } from '../composables/useSelection';
import { usePainting } from '../composables/usePainting';
import { useI18n } from '../composables/useI18n';
import { X, RefreshCw, Trash2, FlipHorizontal, FlipVertical } from 'lucide-vue-next';

const {
  hasSelection,
  isInverted,
  deselect,
  invertSelection
} = useSelection();

const { clearActiveLayer, flipHorizontal, flipVertical } = usePainting();
const { t } = useI18n();
</script>

<template>
  <div v-if="hasSelection" class="selection-overlay-container">
    <!-- Floating Selection Quick Action Bar -->
    <div class="selection-action-bar">
      <!-- 1. Flip Horizontal -->
      <button class="btn-sel" title="Voltear horizontalmente el área seleccionada" @click="flipHorizontal">
        <FlipHorizontal :size="14" />
        <span>Voltear H</span>
      </button>

      <!-- 2. Flip Vertical -->
      <button class="btn-sel" title="Voltear verticalmente el área seleccionada" @click="flipVertical">
        <FlipVertical :size="14" />
        <span>Voltear V</span>
      </button>

      <!-- 3. Invert Selection -->
      <button class="btn-sel" :title="t('invertSelection') || 'Invertir selección (Ctrl+Shift+I)'" @click="invertSelection">
        <RefreshCw :size="13" />
        <span>{{ isInverted ? 'Revertir Inversión' : 'Invertir' }}</span>
      </button>

      <!-- 4. Clear Area -->
      <button class="btn-sel" :title="t('clearLayer') || 'Limpiar selección (Supr)'" @click="clearActiveLayer">
        <Trash2 :size="14" />
        <span>Limpiar Área</span>
      </button>

      <!-- 5. Deselect -->
      <button class="btn-sel btn-deselect" :title="t('deselect') || 'Deseleccionar (Ctrl+D)'" @click="deselect">
        <X :size="14" />
        <span>Deseleccionar</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.selection-overlay-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  overflow: hidden;
}

.selection-action-bar {
  position: absolute;
  bottom: 64px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  padding: 5px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05);
  pointer-events: auto;
  user-select: none;
  animation: slideUp 0.15s ease-out;

  @media (max-width: 768px) {
    bottom: 110px;
    flex-wrap: wrap;
    justify-content: center;
  }
}

@keyframes slideUp {
  from { opacity: 0; transform: translate(-50%, 8px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.btn-sel {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
    color: #0f172a;
  }

  &.btn-deselect {
    color: #dc2626;
    border-color: #fecaca;
    background: #fef2f2;

    &:hover {
      background: #fee2e2;
      border-color: #fca5a5;
    }
  }
}
</style>
