<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLayers } from '../composables/useLayers';
import { useI18n } from '../composables/useI18n';
import { Plus, Eye, EyeOff, ArrowUp, ArrowDown, Trash2 } from 'lucide-vue-next';

const {
  layers,
  activeLayerId,
  addLayer,
  deleteLayer,
  moveLayer,
  setLayerOpacity,
  toggleLayerVisibility,
  renameLayer
} = useLayers();
const { t } = useI18n();

const editingLayerId = ref<string | null>(null);
const editNameInput = ref<string>('');

// Render list with top layer first (descending by index)
const reversedLayers = computed(() => {
  return [...layers.value].map((layer, index) => ({ layer, originalIndex: index })).reverse();
});

const activeOriginalIndex = computed(() => {
  return layers.value.findIndex(l => l.id === activeLayerId.value);
});

function handleAddLayer() {
  addLayer(t('layerName') + ' ' + (layers.value.length + 1));
}

function selectLayer(id: string) {
  activeLayerId.value = id;
}

function startRename(id: string, name: string) {
  editingLayerId.value = id;
  editNameInput.value = name;
}

function saveRename(id: string) {
  if (editingLayerId.value === id && editNameInput.value.trim()) {
    renameLayer(id, editNameInput.value);
  }
  editingLayerId.value = null;
}

function handleMoveUp() {
  const idx = activeOriginalIndex.value;
  if (idx < layers.value.length - 1) {
    moveLayer(idx, idx + 1);
  }
}

function handleMoveDown() {
  const idx = activeOriginalIndex.value;
  if (idx > 0) {
    moveLayer(idx, idx - 1);
  }
}

function handleDelete() {
  if (layers.value.length <= 1) {
    alert(t('cannotDeleteLastLayer'));
    return;
  }
  if (confirm(t('confirmDeleteLayer'))) {
    deleteLayer(activeLayerId.value);
  }
}
</script>

<template>
  <aside class="layer-panel-sidebar">
    <div class="panel-header">
      <span class="panel-title">{{ t('layers') }}</span>
      <button class="btn-add-layer" :title="t('addLayer')" @click="handleAddLayer">
        <Plus :size="16" />
      </button>
    </div>

    <!-- Layer List -->
    <div class="layer-items-list">
      <div
        v-for="{ layer, originalIndex } in reversedLayers"
        :key="layer.id"
        class="layer-row"
        :class="{ active: layer.id === activeLayerId }"
        @click="selectLayer(layer.id)"
      >
        <!-- Visibility toggle -->
        <button
          class="btn-vis"
          :title="t('toggleVisibility')"
          @click.stop="toggleLayerVisibility(layer.id)"
        >
          <Eye v-if="layer.visible" :size="15" />
          <EyeOff v-else :size="15" class="vis-hidden" />
        </button>

        <!-- Layer Name / Edit -->
        <div class="layer-info" @dblclick.stop="startRename(layer.id, layer.name)">
          <input
            v-if="editingLayerId === layer.id"
            v-model="editNameInput"
            class="layer-name-input"
            autofocus
            @blur="saveRename(layer.id)"
            @keydown.enter="saveRename(layer.id)"
            @keydown.esc="editingLayerId = null"
          />
          <span v-else class="layer-name">{{ layer.name }}</span>

          <!-- Opacity slider -->
          <div class="layer-opacity-row" @click.stop>
            <span class="op-label">{{ Math.round(layer.opacity * 100) }}%</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              :value="layer.opacity"
              class="op-slider"
              @input="setLayerOpacity(layer.id, parseFloat(($event.target as HTMLInputElement).value))"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Layer action footer -->
    <div class="panel-footer">
      <button
        class="footer-btn"
        :disabled="activeOriginalIndex >= layers.length - 1"
        :title="t('moveUp')"
        @click="handleMoveUp"
      >
        <ArrowUp :size="14" />
      </button>

      <button
        class="footer-btn"
        :disabled="activeOriginalIndex <= 0"
        :title="t('moveDown')"
        @click="handleMoveDown"
      >
        <ArrowDown :size="14" />
      </button>

      <button
        class="footer-btn btn-delete"
        :disabled="layers.length <= 1"
        :title="t('deleteLayer')"
        @click="handleDelete"
      >
        <Trash2 :size="14" />
        <span>{{ t('deleteLayer') }}</span>
      </button>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.layer-panel-sidebar {
  position: absolute;
  top: 60px;
  right: 12px;
  width: 220px;
  max-height: calc(100vh - 80px);
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  z-index: 90;
  user-select: none;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #e2e8f0;
}

.panel-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.btn-add-layer {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #1d4ed8;
  }
}

.layer-items-list {
  flex: 1;
  overflow-y: auto;
  max-height: 380px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.layer-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #f1f5f9;
  }

  &.active {
    background: #eff6ff;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
}

.btn-vis {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #475569;
  display: flex;
  align-items: center;
  padding: 2px;

  .vis-hidden {
    color: #94a3b8;
  }
}

.layer-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.layer-name {
  font-size: 12px;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-name-input {
  font-size: 12px;
  padding: 2px 4px;
  border: 1px solid #3b82f6;
  border-radius: 3px;
  width: 100%;
}

.layer-opacity-row {
  display: flex;
  align-items: center;
  gap: 6px;

  .op-label {
    font-size: 10px;
    color: #64748b;
    width: 26px;
  }

  .op-slider {
    flex: 1;
    height: 4px;
    cursor: pointer;
  }
}

.panel-footer {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.footer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 11px;
  color: #334155;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #f1f5f9;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &.btn-delete {
    margin-left: auto;
    color: #dc2626;
    border-color: #fca5a5;

    &:hover:not(:disabled) {
      background: #fef2f2;
    }
  }
}

@media (max-width: 768px) {
  .layer-panel-sidebar {
    top: 56px;
    right: 8px;
    width: 200px;
  }
}
</style>
