<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useHotkeys, formatEventKey } from '../composables/useHotkeys';
import { useI18n } from '../composables/useI18n';
import type { HotkeyActionId } from '../types/hotkeys';
import { X, Keyboard, RotateCcw, Check, Plus, Trash2 } from 'lucide-vue-next';

const { isHotkeysModalOpen, userHotkeys, updateBinding, resetAllToDefault } = useHotkeys();
const { t } = useI18n();

const capturingActionId = ref<HotkeyActionId | null>(null);
const capturedKey = ref<string>('');

function startCapturing(actionId: HotkeyActionId) {
  capturingActionId.value = actionId;
  capturedKey.value = '';
}

function cancelCapturing() {
  capturingActionId.value = null;
  capturedKey.value = '';
}

function onCaptureKeyDown(e: KeyboardEvent) {
  if (!capturingActionId.value) return;

  e.preventDefault();
  e.stopPropagation();

  if (e.key === 'Escape') {
    cancelCapturing();
    return;
  }

  const keyStr = formatEventKey(e);
  // Don't bind lone modifier keys
  if (keyStr === 'Ctrl' || keyStr === 'Shift') {
    return;
  }

  // Update binding
  const action = userHotkeys.value.find(b => b.id === capturingActionId.value);
  if (action) {
    if (!action.currentKeys.includes(keyStr)) {
      updateBinding(action.id, [...action.currentKeys, keyStr]);
    }
  }
  cancelCapturing();
}

function removeKeyFromAction(actionId: HotkeyActionId, keyToRemove: string) {
  const action = userHotkeys.value.find(b => b.id === actionId);
  if (action && action.currentKeys.length > 1) {
    const updated = action.currentKeys.filter(k => k !== keyToRemove);
    updateBinding(actionId, updated);
  }
}

onMounted(() => {
  window.addEventListener('keydown', onCaptureKeyDown, true);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onCaptureKeyDown, true);
});
</script>

<template>
  <div v-if="isHotkeysModalOpen" class="hotkeys-modal-overlay" @click.self="isHotkeysModalOpen = false">
    <div class="hotkeys-modal">
      <!-- Header -->
      <div class="modal-header">
        <div class="title-wrap">
          <Keyboard :size="20" class="header-icon" />
          <span class="title">Configuración de Atajos de Teclado (Hotkeys)</span>
        </div>
        <button class="btn-close" @click="isHotkeysModalOpen = false">
          <X :size="18" />
        </button>
      </div>

      <!-- Body / Hotkeys List -->
      <div class="modal-body">
        <p class="subtitle">
          Haz clic en <strong>+ Añadir tecla</strong> o selecciona una tecla para reasignar cualquier acción a tu preferencia.
        </p>

        <div class="hotkeys-grid">
          <div v-for="binding in userHotkeys" :key="binding.id" class="hotkey-item-row">
            <div class="action-info">
              <span class="action-name">{{ t(binding.labelKey as any) || binding.id }}</span>
              <span v-if="binding.id === 'eyedropperHold'" class="action-desc">
                (Mantener presionado activa temporalmente el cuentagotas)
              </span>
            </div>

            <!-- Key Badges -->
            <div class="keys-container">
              <div
                v-for="k in binding.currentKeys"
                :key="k"
                class="key-chip"
              >
                <span class="key-text">{{ k }}</span>
                <button
                  v-if="binding.currentKeys.length > 1"
                  class="btn-remove-key"
                  title="Eliminar atajo"
                  @click="removeKeyFromAction(binding.id, k)"
                >
                  <X :size="12" />
                </button>
              </div>

              <!-- Add key / Recording badge -->
              <button
                v-if="capturingActionId === binding.id"
                class="btn-record active"
                @click="cancelCapturing"
              >
                <span>Pulsa una tecla... (Esc para cancelar)</span>
              </button>
              <button
                v-else
                class="btn-record"
                title="Añadir nueva tecla"
                @click="startCapturing(binding.id)"
              >
                <Plus :size="13" />
                <span>Asignar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="modal-footer">
        <button class="btn-reset" @click="resetAllToDefault">
          <RotateCcw :size="14" />
          <span>Restablecer valores por defecto (MediBang)</span>
        </button>

        <button class="btn-confirm" @click="isHotkeysModalOpen = false">
          <Check :size="15" />
          <span>Guardar y Cerrar</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.hotkeys-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 250;
  padding: 16px;
}

.hotkeys-modal {
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 640px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;

  .title-wrap {
    display: flex;
    align-items: center;
    gap: 10px;

    .header-icon {
      color: #2563eb;
    }

    .title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }
  }

  .btn-close {
    background: transparent;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
  }
}

.modal-body {
  padding: 18px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .subtitle {
    font-size: 13px;
    color: #475569;
    margin: 0 0 6px 0;
  }
}

.hotkeys-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hotkey-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
  transition: all 0.15s;

  &:hover {
    background: #f1f5f9;
    border-color: #e2e8f0;
  }

  .action-info {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .action-name {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
    }

    .action-desc {
      font-size: 11px;
      color: #64748b;
    }
  }

  .keys-container {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
}

.key-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-bottom: 2px solid #94a3b8;
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  font-family: inherit;

  .btn-remove-key {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;

    &:hover {
      color: #ef4444;
      background: #fee2e2;
    }
  }
}

.btn-record {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  border: 1px dashed #94a3b8;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
    border-style: solid;
  }

  &.active {
    background: #eff6ff;
    border-color: #3b82f6;
    border-style: solid;
    color: #2563eb;
    animation: pulse 1.5s infinite;
  }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;

  .btn-reset {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: none;
    color: #64748b;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 6px;
    transition: all 0.15s;

    &:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
  }

  .btn-confirm {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #2563eb;
    color: #ffffff;
    border: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 7px 16px;
    border-radius: 6px;
    transition: all 0.15s;

    &:hover {
      background: #1d4ed8;
    }
  }
}
</style>
