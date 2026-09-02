<script setup lang="ts">
import { ref } from 'vue';
import { useGridState } from '../composables/useGridState';
import { useShapeState } from '../composables/useShapeState';
import { Grid, Layers, PenTool, SlidersHorizontal, RotateCcw } from 'lucide-vue-next';

const {
  showGroundGrid,
  showObjectWireframe,
  wireframeOpacity,
  showObjectLineart,
  lineartOpacity,
  outlineThickness,
  toggleGroundGrid,
  toggleObjectWireframe,
  toggleObjectLineart,
  setWireframeOpacity,
  setLineartOpacity,
  setOutlineThickness,
} = useGridState();

const { triggerResetRotation } = useShapeState();

const showWireframeSlider = ref(false);
const showLineartSettings = ref(false);
</script>

<template>
  <div class="view-toolbar glass-panel">
    <!-- 1. Toggle Grilla Suelo -->
    <button
      class="toolbar-btn"
      :class="{ 'is-active': showGroundGrid }"
      :title="showGroundGrid ? 'Ocultar grilla de perspectiva de suelo' : 'Mostrar grilla de perspectiva de suelo'"
      @click="toggleGroundGrid"
    >
      <Grid :size="15" class="btn-icon" />
      <span class="btn-text">Grilla Suelo</span>
    </button>

    <span class="divider"></span>

    <!-- 2. Toggle Estructura Objeto (Wireframe) -->
    <div class="btn-with-controls">
      <button
        class="toolbar-btn"
        :class="{ 'is-active': showObjectWireframe }"
        :title="showObjectWireframe ? 'Ocultar grilla de estructura del objeto' : 'Mostrar grilla de estructura del objeto'"
        @click="toggleObjectWireframe"
      >
        <Layers :size="15" class="btn-icon" />
        <span class="btn-text">Grilla Objeto</span>
      </button>

      <button
        v-if="showObjectWireframe"
        class="mini-slider-btn"
        :class="{ 'is-open': showWireframeSlider }"
        title="Ajustar opacidad de la grilla del objeto"
        @click="showWireframeSlider = !showWireframeSlider"
      >
        <SlidersHorizontal :size="12" />
      </button>

      <!-- Popover de Opacidad de la Grilla -->
      <div v-if="showObjectWireframe && showWireframeSlider" class="settings-popover glass-panel">
        <div class="control-row">
          <div class="row-header">
            <span>Opacidad Grilla</span>
            <span class="row-val">{{ Math.round(wireframeOpacity * 100) }}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1.0"
            step="0.05"
            :value="wireframeOpacity"
            class="control-slider"
            @input="(e) => setWireframeOpacity(Number((e.target as HTMLInputElement).value))"
          />
        </div>
      </div>
    </div>

    <span class="divider"></span>

    <!-- 3. Toggle Lineart / Contorno Blanco -->
    <div class="btn-with-controls">
      <button
        class="toolbar-btn"
        :class="{ 'is-active': showObjectLineart }"
        :title="showObjectLineart ? 'Ocultar contorno lineart blanco' : 'Mostrar contorno lineart blanco'"
        @click="toggleObjectLineart"
      >
        <PenTool :size="15" class="btn-icon" />
        <span class="btn-text">Contorno Blanco</span>
      </button>

      <button
        v-if="showObjectLineart"
        class="mini-slider-btn"
        :class="{ 'is-open': showLineartSettings }"
        title="Ajustar grosor y opacidad del contorno"
        @click="showLineartSettings = !showLineartSettings"
      >
        <SlidersHorizontal :size="12" />
      </button>

      <!-- Popover de Grosor y Opacidad del Contorno -->
      <div v-if="showObjectLineart && showLineartSettings" class="settings-popover glass-panel lineart-popover">
        <div class="control-row">
          <div class="row-header">
            <span>Grosor Trazo</span>
            <span class="row-val">{{ (outlineThickness * 100).toFixed(1) }}</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.18"
            step="0.005"
            :value="outlineThickness"
            class="control-slider"
            @input="(e) => setOutlineThickness(Number((e.target as HTMLInputElement).value))"
          />
        </div>

        <span class="popover-divider"></span>

        <div class="control-row">
          <div class="row-header">
            <span>Opacidad Trazo</span>
            <span class="row-val">{{ Math.round(lineartOpacity * 100) }}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            :value="lineartOpacity"
            class="control-slider"
            @input="(e) => setLineartOpacity(Number((e.target as HTMLInputElement).value))"
          />
        </div>
      </div>
    </div>

    <span class="divider"></span>

    <!-- 4. Botón Reset Rotación -->
    <button
      class="toolbar-btn reset-btn"
      title="Restablecer rotación a 0°"
      @click="triggerResetRotation"
    >
      <RotateCcw :size="15" class="btn-icon" />
      <span class="btn-text">Reset Giro</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.view-toolbar {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.5rem;
  position: relative;
}

.btn-with-controls {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.6rem;
  border-radius: $radius-sm;
  color: $text-secondary;
  font-size: 0.74rem;
  font-weight: 500;
  transition: all $transition-fast;

  .btn-icon {
    transition: transform $transition-fast;
  }

  &:hover {
    color: $text-primary;
    background: rgba(255, 255, 255, 0.08);

    .btn-icon {
      transform: scale(1.08);
    }
  }

  &.is-active {
    color: #ffffff;
    background: rgba(99, 102, 241, 0.25);
    border: 1px solid rgba(99, 102, 241, 0.5);

    .btn-icon {
      color: $accent-primary;
    }
  }

  &.reset-btn:hover {
    color: #f59e0b;
    .btn-icon {
      transform: rotate(-30deg);
    }
  }
}

.mini-slider-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem 0.4rem;
  border-radius: $radius-sm;
  color: $text-muted;
  background: rgba(255, 255, 255, 0.05);
  transition: all $transition-fast;

  &:hover,
  &.is-open {
    color: $text-primary;
    background: rgba(255, 255, 255, 0.14);
  }
}

.divider {
  width: 1px;
  height: 18px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 0 0.1rem;
}

.settings-popover {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  padding: 0.65rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 20;

  &.lineart-popover {
    width: 160px;
  }

  .popover-divider {
    width: 100%;
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
  }

  .control-row {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;

    .row-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.68rem;
      color: $text-secondary;

      .row-val {
        font-family: monospace;
        color: $text-primary;
        font-weight: 600;
      }
    }

    .control-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: $radius-full;
      outline: none;
      cursor: pointer;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: $accent-primary;
        cursor: pointer;
      }
    }
  }
}
</style>
