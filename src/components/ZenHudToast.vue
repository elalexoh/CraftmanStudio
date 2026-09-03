<script setup lang="ts">
import { useZenMode } from '../composables/useZenMode';
import { Sparkles } from 'lucide-vue-next';

const { zenToastMessage } = useZenMode();
</script>

<template>
  <Transition name="zen-toast">
    <div v-if="zenToastMessage" class="zen-hud-toast-container">
      <Sparkles :size="14" class="zen-toast-icon" />
      <span class="zen-toast-text">{{ zenToastMessage }}</span>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.zen-hud-toast-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  pointer-events: none;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.92);
  color: #ffffff;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.zen-toast-icon {
  color: #38bdf8;
  animation: pulse-glow 1.5s infinite ease-in-out;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.9); }
}

.zen-toast-enter-active,
.zen-toast-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.zen-toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -12px) scale(0.92);
}

.zen-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px) scale(0.95);
}
</style>
