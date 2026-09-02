<script setup lang="ts">
import { ref } from 'vue';
import { usePainting } from '../composables/usePainting';
import { useLayers } from '../composables/useLayers';
import { useAppState } from '../composables/useAppState';
import { useProjectStorage } from '../composables/useProjectStorage';
import { useI18n } from '../composables/useI18n';
import { isHotkeysModalOpen } from '../composables/useHotkeys';
import type { CanvasResolution, Language } from '../types/painting';
import { Undo2, Redo2, HelpCircle, Eye, Grid, Download, Upload, Image as ImageIcon, Globe, Keyboard, Save } from 'lucide-vue-next';

const { canUndo, canRedo, undo, redo } = usePainting();
const { setCanvasResolution } = useLayers();
const {
  appMode,
  eyeHeight,
  showGroundGrid,
  canvasResolution,
  isPreviewOpen,
  isHelpOpen,
  autoSaveEnabled,
  setAppMode,
  setEyeHeight,
  adjustEyeHeight,
  toggleGroundGrid,
  setResolution,
  toggleAutoSave
} = useAppState();
const { saveProjectToFile, loadProjectFromFile, exportPng } = useProjectStorage();
const { currentLanguage, setLanguage, t } = useI18n();

const fileInputRef = ref<HTMLInputElement | null>(null);

function onResolutionChange(e: Event) {
  const target = e.target as HTMLSelectElement;
  const res = parseInt(target.value, 10) as CanvasResolution;
  setResolution(res);
  setCanvasResolution(res);
}

function onLanguageChange(e: Event) {
  const target = e.target as HTMLSelectElement;
  setLanguage(target.value as Language);
}

function triggerLoadFile() {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
}

async function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const success = await loadProjectFromFile(target.files[0]);
    if (success) {
      alert(t('projectLoadedSuccess'));
    } else {
      alert(t('projectLoadError'));
    }
    target.value = '';
  }
}
</script>

<template>
  <header class="top-toolbar">
    <div class="toolbar-left">
      <div class="app-branding">
        <span class="app-name">{{ t('appTitle') }}</span>
      </div>

      <!-- Mode Switcher -->
      <div class="mode-switcher-group">
        <button
          class="mode-tab-btn"
          :class="{ active: appMode === '360' }"
          @click="setAppMode('360')"
        >
          {{ t('mode360Canvas') }}
        </button>
        <button
          class="mode-tab-btn"
          :class="{ active: appMode === '3d-reference' }"
          @click="setAppMode('3d-reference')"
        >
          {{ t('mode3DReference') }}
        </button>
      </div>

      <!-- Undo / Redo (only in 360 mode) -->
      <div v-if="appMode === '360'" class="history-group">
        <button
          class="btn-icon"
          :disabled="!canUndo"
          :title="t('undo')"
          @click="undo"
        >
          <Undo2 :size="16" />
        </button>
        <button
          class="btn-icon"
          :disabled="!canRedo"
          :title="t('redo')"
          @click="redo"
        >
          <Redo2 :size="16" />
        </button>
      </div>
    </div>

    <!-- Center settings (for 360 mode) -->
    <div v-if="appMode === '360'" class="toolbar-center">
      <!-- Resolution -->
      <div class="control-item">
        <label for="resSelect">{{ t('outputSize') }}:</label>
        <select
          id="resSelect"
          :value="canvasResolution"
          class="select-input"
          @change="onResolutionChange"
        >
          <option :value="2048">2048 × 1024</option>
          <option :value="4096">4096 × 2048</option>
          <option :value="8192">8192 × 4096</option>
        </select>
      </div>

      <!-- Eye Height -->
      <div class="control-item eye-control">
        <label for="eyeInput">{{ t('eyeHeight') }}:</label>
        <button
          class="step-btn"
          :title="t('lowerEye')"
          @click="adjustEyeHeight(-0.1)"
        >−</button>
        <input
          id="eyeSlider"
          type="range"
          min="0.5"
          max="30"
          step="0.1"
          :value="eyeHeight"
          class="slider-input"
          @input="setEyeHeight(parseFloat(($event.target as HTMLInputElement).value))"
        />
        <button
          class="step-btn"
          :title="t('raiseEye')"
          @click="adjustEyeHeight(0.1)"
        >+</button>
        <input
          id="eyeInput"
          type="number"
          min="0.5"
          max="30"
          step="0.1"
          :value="eyeHeight"
          class="num-input"
          @input="setEyeHeight(parseFloat(($event.target as HTMLInputElement).value))"
        />
        <span class="unit">m</span>
      </div>

      <!-- Ground Grid Toggle -->
      <label class="toggle-item">
        <input
          type="checkbox"
          :checked="showGroundGrid"
          @change="toggleGroundGrid(($event.target as HTMLInputElement).checked)"
        />
        <span>{{ t('groundGrid') }}</span>
      </label>

      <!-- Language Selector -->
      <div class="control-item lang-selector">
        <Globe :size="14" class="lang-icon" />
        <select
          :value="currentLanguage"
          class="select-input select-lang"
          @change="onLanguageChange"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
        </select>
      </div>
    </div>

    <!-- Right Actions -->
    <div class="toolbar-right">
      <button
        class="btn-action"
        :class="{ 'btn-active': autoSaveEnabled }"
        :title="autoSaveEnabled ? 'Auto-guardado activo' : 'Auto-guardado desactivado'"
        @click="toggleAutoSave"
      >
        <Save :size="14" :class="{ 'text-active': autoSaveEnabled }" />
        <span>{{ autoSaveEnabled ? 'Auto-guardado: ON' : 'Auto-guardado: OFF' }}</span>
      </button>

      <button class="btn-action" @click="saveProjectToFile('painting.gururi')">
        <Download :size="14" />
        <span>{{ t('saveProject') }}</span>
      </button>

      <button class="btn-action" @click="triggerLoadFile">
        <Upload :size="14" />
        <span>{{ t('loadProject') }}</span>
      </button>
      <input
        ref="fileInputRef"
        type="file"
        accept=".gururi,application/json"
        class="hidden-file"
        @change="onFileSelected"
      />

      <button class="btn-action" @click="isPreviewOpen = true">
        <Eye :size="14" />
        <span>{{ t('preview') }}</span>
      </button>

      <button
        class="btn-icon"
        :title="t('hotkeysConfig')"
        @click="isHotkeysModalOpen = true"
      >
        <Keyboard :size="18" />
      </button>

      <button
        class="btn-icon btn-help"
        :title="t('help')"
        @click="isHelpOpen = true"
      >
        <HelpCircle :size="18" />
      </button>
    </div>
  </header>
</template>

<style scoped lang="scss">
.top-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  z-index: 100;
  font-size: 13px;
  user-select: none;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-branding {
  font-weight: 700;
  color: #1e293b;
  margin-right: 4px;
}

.mode-switcher-group {
  display: flex;
  background: #e2e8f0;
  border-radius: 6px;
  padding: 2px;
  gap: 2px;
  margin-right: 6px;
}

.mode-tab-btn {
  background: transparent;
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    color: #1e293b;
  }

  &.active {
    background: #ffffff;
    color: #2563eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}

.history-group {
  display: flex;
  background: #f1f5f9;
  border-radius: 6px;
  padding: 2px;
}

.btn-icon {
  background: transparent;
  border: none;
  padding: 5px 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #334155;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: #e2e8f0;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.control-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #475569;
}

.select-input {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 3px 6px;
  font-size: 12px;
  color: #1e293b;
  cursor: pointer;
}

.eye-control {
  .step-btn {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 3px;
    width: 20px;
    height: 22px;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: #e2e8f0;
    }
  }

  .slider-input {
    width: 70px;
    cursor: pointer;
  }

  .num-input {
    width: 44px;
    padding: 2px 4px;
    border: 1px solid #cbd5e1;
    border-radius: 3px;
    font-size: 12px;
    text-align: center;
  }

  .unit {
    font-size: 11px;
    color: #64748b;
  }
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #475569;
  font-size: 12px;
}

.lang-selector {
  .lang-icon {
    color: #64748b;
  }
  .select-lang {
    font-weight: 500;
  }
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 12px;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
  }

  &.btn-primary {
    background: #2563eb;
    border-color: #1d4ed8;
    color: #fff;

    &:hover {
      background: #1d4ed8;
    }
  }

  &.btn-active {
    background: #eff6ff;
    border-color: #93c5fd;
    color: #1d4ed8;
  }

  .text-active {
    color: #16a34a;
  }
}

.hidden-file {
  display: none;
}

@media (max-width: 900px) {
  .toolbar-center {
    display: none;
  }
}
</style>
