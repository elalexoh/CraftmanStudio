<script setup lang="ts">
import { useAppState } from '../composables/useAppState';
import { useI18n } from '../composables/useI18n';
import { PenTool, Layers, Settings } from 'lucide-vue-next';

const { activeMobileTab } = useAppState();
const { t } = useI18n();
</script>

<template>
  <nav class="mobile-bottom-tabs">
    <button
      class="tab-btn"
      :class="{ active: activeMobileTab === 'draw' }"
      @click="activeMobileTab = 'draw'"
    >
      <PenTool :size="18" />
      <span>{{ t('tabDraw') }}</span>
    </button>

    <button
      class="tab-btn"
      :class="{ active: activeMobileTab === 'layer' }"
      @click="activeMobileTab = 'layer'"
    >
      <Layers :size="18" />
      <span>{{ t('tabLayers') }}</span>
    </button>

    <button
      class="tab-btn"
      :class="{ active: activeMobileTab === 'settings' }"
      @click="activeMobileTab = 'settings'"
    >
      <Settings :size="18" />
      <span>{{ t('tabSettings') }}</span>
    </button>
  </nav>
</template>

<style scoped lang="scss">
.mobile-bottom-tabs {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 52px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 100;
  user-select: none;
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s;

  &.active {
    color: #2563eb;
    font-weight: 700;
  }
}

@media (max-width: 768px) {
  .mobile-bottom-tabs {
    display: flex;
  }
}
</style>
