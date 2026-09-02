<script setup lang="ts">
import { ref } from 'vue';
import { useLightingState } from '../composables/useLightingState';
import { useSelectionState } from '../composables/useSelectionState';
import {
  Sun,
  Sliders,
  ChevronDown,
  ChevronUp,
  Palette,
  Maximize2,
} from 'lucide-vue-next';

const {
  lightState,
  setAzimuth,
  setElevation,
  setDistance,
  setIntensity,
  setColor,
} = useLightingState();

const { selectedTarget, setSelection } = useSelectionState();

const isCollapsed = ref(false);

const colorPresets = [
  { label: 'Neutro', color: '#ffffff' },
  { label: 'Cálido', color: '#ffe4c4' },
  { label: 'Dorado', color: '#ffb347' },
  { label: 'Frío', color: '#d0e8ff' },
  { label: 'Cian', color: '#67e8f9' },
  { label: 'Magenta', color: '#f472b6' },
];

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<template>
  <div
    class="light-panel glass-panel"
    :class="{
      'is-collapsed': isCollapsed,
      'is-selected': selectedTarget === 'light',
    }"
  >
    <!-- Cabecera del Panel -->
    <div class="panel-header" @click="setSelection('light')">
      <div class="title-wrap">
        <Sun :size="16" class="header-icon" />
        <span class="title-text">Luz Principal</span>
        <span class="selection-tag" v-if="selectedTarget === 'light'">Activa</span>
      </div>

      <button
        class="toggle-btn"
        :title="isCollapsed ? 'Expandir controles' : 'Colapsar controles'"
        @click.stop="toggleCollapse"
      >
        <ChevronUp v-if="!isCollapsed" :size="16" />
        <ChevronDown v-else :size="16" />
      </button>
    </div>

    <!-- Contenido de Sliders (Expandible) -->
    <div v-show="!isCollapsed" class="panel-body">
      <!-- 1. Azimut -->
      <div class="control-row">
        <div class="label-box">
          <span>Azimut (Horizontal)</span>
          <span class="val-num">{{ Math.round(lightState.azimuth) }}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          step="1"
          :value="lightState.azimuth"
          class="slider"
          @input="(e) => setAzimuth(Number((e.target as HTMLInputElement).value))"
        />
      </div>

      <!-- 2. Elevación -->
      <div class="control-row">
        <div class="label-box">
          <span>Elevación (Vertical)</span>
          <span class="val-num">{{ Math.round(lightState.elevation) }}°</span>
        </div>
        <input
          type="range"
          min="-80"
          max="80"
          step="1"
          :value="lightState.elevation"
          class="slider"
          @input="(e) => setElevation(Number((e.target as HTMLInputElement).value))"
        />
      </div>

      <!-- 3. Distancia -->
      <div class="control-row">
        <div class="label-box">
          <span>Distancia / Radio</span>
          <span class="val-num">{{ lightState.distance.toFixed(1) }}m</span>
        </div>
        <input
          type="range"
          min="2"
          max="12"
          step="0.1"
          :value="lightState.distance"
          class="slider"
          @input="(e) => setDistance(Number((e.target as HTMLInputElement).value))"
        />
      </div>

      <!-- 4. Intensidad -->
      <div class="control-row">
        <div class="label-box">
          <span>Intensidad</span>
          <span class="val-num">{{ Math.round(lightState.intensity) }}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          :value="lightState.intensity"
          class="slider"
          @input="(e) => setIntensity(Number((e.target as HTMLInputElement).value))"
        />
      </div>

      <!-- 5. Color y Temperatura -->
      <div class="control-row color-section">
        <div class="label-box">
          <span>Color de Luz</span>
          <label class="color-picker-label" :style="{ backgroundColor: lightState.color }">
            <input
              type="color"
              :value="lightState.color"
              class="hidden-picker"
              @input="(e) => setColor((e.target as HTMLInputElement).value)"
            />
          </label>
        </div>

        <div class="presets-grid">
          <button
            v-for="preset in colorPresets"
            :key="preset.color"
            class="preset-pill"
            :class="{ 'is-active': lightState.color.toLowerCase() === preset.color.toLowerCase() }"
            :style="{ '--preset-color': preset.color }"
            :title="preset.label"
            @click="setColor(preset.color)"
          >
            <span class="preset-dot"></span>
            <span class="preset-label">{{ preset.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.light-panel {
  width: 250px;
  padding: 0.85rem;
  transition: all $transition-fast;

  &.is-selected {
    border-color: rgba(245, 158, 11, 0.6);
    box-shadow: 0 0 16px rgba(245, 158, 11, 0.2);
  }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  .title-wrap {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .header-icon {
      color: #f59e0b;
    }

    .title-text {
      font-size: 0.85rem;
      font-weight: 600;
      color: $text-primary;
    }

    .selection-tag {
      font-size: 0.65rem;
      font-weight: 500;
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.15);
      padding: 0.1rem 0.4rem;
      border-radius: $radius-full;
    }
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-secondary;
    padding: 0.2rem;
    border-radius: $radius-sm;

    &:hover {
      color: $text-primary;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.85rem;
}

.control-row {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  .label-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.72rem;
    color: $text-secondary;

    .val-num {
      font-family: monospace;
      color: $text-primary;
      font-weight: 600;
    }
  }

  .slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: $radius-full;
    outline: none;
    cursor: pointer;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #f59e0b;
      cursor: pointer;
      box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
      transition: transform $transition-fast;

      &:hover {
        transform: scale(1.2);
      }
    }
  }
}

.color-section {
  margin-top: 0.2rem;

  .color-picker-label {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.4);
    cursor: pointer;
    position: relative;
    overflow: hidden;

    .hidden-picker {
      position: absolute;
      opacity: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
  }

  .presets-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.35rem;
    margin-top: 0.35rem;
  }

  .preset-pill {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.4rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid transparent;
    border-radius: $radius-sm;
    color: $text-secondary;
    font-size: 0.68rem;
    transition: all $transition-fast;

    .preset-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--preset-color);
    }

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: $text-primary;
    }

    &.is-active {
      border-color: rgba(245, 158, 11, 0.5);
      background: rgba(245, 158, 11, 0.15);
      color: $text-primary;
    }
  }
}
</style>
