<script setup lang="ts">
import { useZenMode } from '../composables/useZenMode';
import { EyeOff, Sparkles } from 'lucide-vue-next';

const { zenToastMessage } = useZenMode();
</script>

<template>
  <Transition name="zen-toast">
    <div
      v-if="zenToastMessage"
      class="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none select-none flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-900/90 text-zinc-100 backdrop-blur-md border border-white/10 shadow-2xl text-xs font-medium tracking-wide"
    >
      <Sparkles class="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
      <span>{{ zenToastMessage }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.zen-toast-enter-active,
.zen-toast-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.zen-toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -12px) scale(0.95);
}

.zen-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px) scale(0.95);
}
</style>
