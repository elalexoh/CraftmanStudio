import { ref, readonly } from 'vue';

const isZenMode = ref(false);
const zenToastMessage = ref<string | null>(null);
let toastTimer: number | null = null;

export function useZenMode() {
  const toggleZenMode = () => {
    isZenMode.value = !isZenMode.value;
    if (isZenMode.value) {
      showZenToast('Modo Zen Activado (Presiona Tab para salir)', 2500);
    } else {
      showZenToast('Modo Zen Desactivado', 1500);
    }
  };

  const setZenMode = (active: boolean) => {
    isZenMode.value = active;
  };

  const showZenToast = (message: string, durationMs: number = 2000) => {
    zenToastMessage.value = message;
    if (toastTimer !== null) {
      window.clearTimeout(toastTimer);
    }
    toastTimer = window.setTimeout(() => {
      zenToastMessage.value = null;
      toastTimer = null;
    }, durationMs);
  };

  return {
    isZenMode: readonly(isZenMode),
    zenToastMessage: readonly(zenToastMessage),
    toggleZenMode,
    setZenMode,
    showZenToast,
  };
}
