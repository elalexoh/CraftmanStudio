<script setup lang="ts">
import { ref } from 'vue';
import {
  useCameraPresets,
  type AxonometricPreset,
} from '../composables/useCameraPresets';
import {
  Compass,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Save,
  Check,
  X
} from 'lucide-vue-next';

const {
  currentPreset,
  orientation,
  bookmarks,
  isPresetsPanelOpen,
  setPreset,
  setOrientation,
  saveBookmark,
  loadBookmark,
  setPresetsPanelOpen,
} = useCameraPresets();

const isCollapsed = ref(false);
const savedSlotId = ref<number | null>(null);

const presetsList: { id: AxonometricPreset; label: string; desc: string }[] = [
  { id: 'isometric', label: 'Isométrica', desc: '30° / 30° - Ejes 1:1:1' },
  { id: 'dimetric', label: 'Dimétrica', desc: '15° / 15° - Proporción 1:1:0.5' },
  { id: 'cavalier', label: 'Caballera', desc: 'Frontal 90°, oblicuo 45°' },
  { id: 'military', label: 'Militar', desc: 'Planta a 45°, eje Z vertical' },
  { id: 'free', label: 'Modo Libre', desc: 'Órbita y orientación continua' },
];

const handleYawChange = (val: number | string) => {
  const num = Number(val);
  if (!isNaN(num)) {
    setOrientation(num, orientation.pitch, orientation.roll, false);
  }
};

const handlePitchChange = (val: number | string) => {
  const num = Number(val);
  if (!isNaN(num)) {
    setOrientation(orientation.yaw, num, orientation.roll, false);
  }
};

const handleRollChange = (val: number | string) => {
  const num = Number(val);
  if (!isNaN(num)) {
    setOrientation(orientation.yaw, orientation.pitch, num, false);
  }
};

const stepAngle = (axis: 'yaw' | 'pitch' | 'roll', delta: number) => {
  if (axis === 'yaw') {
    setOrientation(orientation.yaw + delta, orientation.pitch, orientation.roll, true);
  } else if (axis === 'pitch') {
    setOrientation(orientation.yaw, orientation.pitch + delta, orientation.roll, true);
  } else if (axis === 'roll') {
    setOrientation(orientation.yaw, orientation.pitch, orientation.roll + delta, true);
  }
};

const handleSaveSlot = (slotId: number) => {
  saveBookmark(slotId);
  savedSlotId.value = slotId;
  setTimeout(() => {
    savedSlotId.value = null;
  }, 1200);
};
</script>

<template>
  <aside v-if="isPresetsPanelOpen" class="camera-presets-panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="header-title-row" @click="isCollapsed = !isCollapsed">
        <Compass :size="16" class="header-icon" />
        <span class="panel-title">Inclinación & Proyección</span>
      </div>
      <div class="header-actions">
        <button
          class="icon-btn"
          :title="isCollapsed ? 'Expandir' : 'Colapsar'"
          @click="isCollapsed = !isCollapsed"
        >
          <ChevronUp v-if="!isCollapsed" :size="14" />
          <ChevronDown v-else :size="14" />
        </button>
        <button
          class="icon-btn close-btn"
          title="Cerrar panel"
          @click="setPresetsPanelOpen(false)"
        >
          <X :size="14" />
        </button>
      </div>
    </div>

    <!-- Body -->
    <div v-show="!isCollapsed" class="panel-body">
      <!-- Section 1: Presets Axonométricos -->
      <div class="section-group">
        <label class="section-label">Proyecciones Axonométricas</label>
        <div class="presets-grid">
          <button
            v-for="p in presetsList"
            :key="p.id"
            class="preset-btn"
            :class="{ active: currentPreset === p.id, 'full-span': p.id === 'free' }"
            :title="p.desc"
            @click="setPreset(p.id)"
          >
            <span>{{ p.label }}</span>
          </button>
        </div>
      </div>

      <div class="panel-divider"></div>

      <!-- Section 2: Precise Numeric Angles in Degrees -->
      <div class="section-group">
        <div class="section-header-row">
          <label class="section-label">Ajuste Preciso (Grados)</label>
          <span class="section-hint">Snap 15° con Shift</span>
        </div>

        <!-- Yaw (Azimut) -->
        <div class="control-row">
          <div class="control-label-row">
            <span class="axis-title">Azimut (Yaw):</span>
            <div class="stepper-box">
              <button class="step-btn" title="-15°" @click="stepAngle('yaw', -15)">-15°</button>
              <input
                type="number"
                class="num-input"
                :value="Math.round(orientation.yaw)"
                @input="handleYawChange(($event.target as HTMLInputElement).value)"
              />
              <span class="unit-symbol">°</span>
              <button class="step-btn" title="+15°" @click="stepAngle('yaw', 15)">+15°</button>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="359"
            class="angle-slider"
            :value="Math.round(orientation.yaw)"
            @input="handleYawChange(($event.target as HTMLInputElement).value)"
          />
        </div>

        <!-- Pitch (Elevación) -->
        <div class="control-row">
          <div class="control-label-row">
            <span class="axis-title">Elevación (Pitch):</span>
            <div class="stepper-box">
              <button class="step-btn" title="-15°" @click="stepAngle('pitch', -15)">-15°</button>
              <input
                type="number"
                class="num-input"
                :value="Math.round(orientation.pitch)"
                @input="handlePitchChange(($event.target as HTMLInputElement).value)"
              />
              <span class="unit-symbol">°</span>
              <button class="step-btn" title="+15°" @click="stepAngle('pitch', 15)">+15°</button>
            </div>
          </div>
          <input
            type="range"
            min="-89"
            max="89"
            class="angle-slider"
            :value="Math.round(orientation.pitch)"
            @input="handlePitchChange(($event.target as HTMLInputElement).value)"
          />
        </div>

        <!-- Roll (Inclinación Lateral) -->
        <div class="control-row">
          <div class="control-label-row">
            <span class="axis-title">Inclinación (Roll):</span>
            <div class="stepper-box">
              <button
                class="step-btn reset-btn"
                title="Reset a 0°"
                @click="setOrientation(orientation.yaw, orientation.pitch, 0, true)"
              >
                <RotateCcw :size="11" />
              </button>
              <input
                type="number"
                class="num-input"
                :value="Math.round(orientation.roll)"
                @input="handleRollChange(($event.target as HTMLInputElement).value)"
              />
              <span class="unit-symbol">°</span>
            </div>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            class="angle-slider"
            :value="Math.round(orientation.roll)"
            @input="handleRollChange(($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>

      <div class="panel-divider"></div>

      <!-- Section 3: Bookmarks -->
      <div class="section-group">
        <div class="section-header-row">
          <label class="section-label">Bookmarks de Cámara</label>
          <span class="section-hint">Alt + 1..4</span>
        </div>
        <div class="bookmarks-grid">
          <div v-for="b in bookmarks" :key="b.id" class="bookmark-slot-wrapper">
            <button
              class="bookmark-load-btn"
              :class="{ saved: savedSlotId === b.id }"
              :title="`Cargar Vista ${b.id} (${b.preset})`"
              @click="loadBookmark(b.id)"
            >
              <span v-if="savedSlotId === b.id" class="saved-feedback">
                <Check :size="12" />
              </span>
              <span v-else>#{{ b.id }}</span>
            </button>
            <button
              class="bookmark-save-btn"
              :title="`Guardar vista actual en Slot #${b.id}`"
              @click.stop="handleSaveSlot(b.id)"
            >
              <Save :size="10" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.camera-presets-panel {
  position: absolute;
  top: 60px;
  left: 236px;
  width: 250px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 95;
  user-select: none;
  font-family: inherit;
  color: #1e293b;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.header-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  flex: 1;
}

.header-icon {
  color: #2563eb;
}

.panel-title {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  padding: 4px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }

  &.close-btn:hover {
    background: #fee2e2;
    color: #ef4444;
  }
}

.panel-body {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.section-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
}

.section-hint {
  font-size: 10px;
  color: #94a3b8;
}

.presets-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}

.preset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 4px;
  font-size: 11px;
  font-weight: 500;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
  }

  &.active {
    background: #eff6ff;
    border-color: #2563eb;
    color: #2563eb;
    font-weight: 700;
    box-shadow: 0 1px 3px rgba(37, 99, 235, 0.15);
  }

  &.full-span {
    grid-column: span 2;
  }
}

.panel-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 1px 0;
}

.control-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
}

.axis-title {
  color: #475569;
}

.stepper-box {
  display: flex;
  align-items: center;
  gap: 3px;
}

.step-btn {
  padding: 2px 4px;
  font-size: 9px;
  font-weight: 600;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  color: #475569;
  cursor: pointer;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }

  &.reset-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3px 5px;
  }
}

.num-input {
  width: 44px;
  padding: 2px 2px;
  text-align: center;
  font-family: monospace;
  font-size: 11px;
  font-weight: 600;
  color: #2563eb;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 4px;

  &:focus {
    outline: none;
    border-color: #2563eb;
    background: #ffffff;
  }
}

.unit-symbol {
  font-size: 10px;
  color: #94a3b8;
}

.angle-slider {
  width: 100%;
  height: 4px;
  accent-color: #2563eb;
  background: #cbd5e1;
  border-radius: 2px;
  cursor: pointer;
}

.bookmarks-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
}

.bookmark-slot-wrapper {
  position: relative;
  display: flex;

  &:hover .bookmark-save-btn {
    display: flex;
  }
}

.bookmark-load-btn {
  width: 100%;
  padding: 6px 0;
  font-size: 11px;
  font-family: monospace;
  font-weight: 600;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
  }

  &.saved {
    background: #ecfdf5;
    border-color: #10b981;
    color: #059669;
  }
}

.bookmark-save-btn {
  display: none;
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #2563eb;
  color: #ffffff;
  border: 1px solid #ffffff;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

  &:hover {
    background: #1d4ed8;
  }
}

.saved-feedback {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .camera-presets-panel {
    left: 12px;
    right: 12px;
    top: 60px;
    width: auto;
    max-height: 60vh;
  }
}
</style>
