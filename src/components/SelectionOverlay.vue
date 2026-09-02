<script setup lang="ts">
import { useSelection } from '../composables/useSelection';
import { usePainting } from '../composables/usePainting';
import { useI18n } from '../composables/useI18n';
import { X, FlipHorizontal, Trash2 } from 'lucide-vue-next';

const {
  hasSelection,
  isInverted,
  deselect,
  invertSelection
} = useSelection();

const { clearActiveLayer } = usePainting();
const { t } = useI18n();
</script>

<template>
  <div v-if="hasSelection" class="selection-overlay-container">
    <!-- Floating Selection Quick Action Bar -->
    <div class="selection-action-bar">
      <button class="btn-sel" :title="t('invertSelection') || 'Invertir selección (Ctrl+Shift+I)'" @click="invertSelection">
        <FlipHorizontal :size="14" />
        <span>{{ isInverted ? 'Revertir Inversión' : 'Invertir' }}</span>
      </button>

      <button class="btn-sel" :title="t('clearLayer') || 'Limpiar selección (Supr)'" @click="clearActiveLayer">
        <Trash2 :size="14" />
        <span>Limpiar Área</span>
      </button>

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

.selection-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.selection-action-bar {
  position: absolute;
  bottom: 64px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  pointer-events: auto;
  animation: fadeIn 0.2s ease-out;

  .btn-sel {
    display: flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: none;
    color: #f1f5f9;
    font-size: 11px;
    font-weight: 600;
    padding: 5px 8px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }

    &.btn-deselect {
      color: #94a3b8;
      &:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
      }
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, 8px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
</style>
