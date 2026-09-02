<script setup lang="ts">
import { useAppState } from '../composables/useAppState';
import { useI18n } from '../composables/useI18n';
import { Grid, Sparkles, ExternalLink } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'open-guide'): void;
}>();

const { showGroundGrid, toggleGroundGrid, appMode } = useAppState();
const { currentLanguage } = useI18n();
</script>

<template>
  <!-- Left Side: Developer Portfolio Badge -->
  <div class="floating-left-dock">
    <a
      href="https://deeply-portfolio.netlify.app/"
      target="_blank"
      rel="noopener noreferrer"
      class="dock-btn dev-btn"
      :title="currentLanguage === 'ja' ? '開発者ポートフォリオ（Deeply Oku）' : currentLanguage === 'en' ? 'Developer Portfolio (Deeply Oku)' : 'Desarrollado por Deeply Oku - Ver Portafolio'"
    >
      <span class="dev-emoji">👺</span>
      <span class="dev-name">Deeply Oku</span>
      <ExternalLink :size="11" class="ext-icon" />
    </a>
  </div>

  <!-- Right Side: Extra Options (Grid Toggle & Quick Guide) -->
  <div class="floating-right-dock">
    <!-- 1. Grid Toggle (360 mode only) -->
    <button
      v-if="appMode === '360'"
      class="dock-btn grid-toggle-btn"
      :class="{ 'is-active': showGroundGrid }"
      :title="showGroundGrid ? 'Ocultar cuadrícula de perspectiva' : 'Mostrar cuadrícula de perspectiva'"
      @click="toggleGroundGrid()"
    >
      <Grid :size="14" :class="{ 'text-active': showGroundGrid }" />
      <span>{{ showGroundGrid ? (currentLanguage === 'ja' ? 'グリッド: ON' : currentLanguage === 'en' ? 'Grid: ON' : 'Cuadrícula: ON') : (currentLanguage === 'ja' ? 'グリッド: OFF' : currentLanguage === 'en' ? 'Grid: OFF' : 'Cuadrícula: OFF') }}</span>
    </button>

    <!-- 2. Quick Guide Button -->
    <button
      class="dock-btn guide-btn"
      :title="currentLanguage === 'ja' ? 'クイックガイド' : currentLanguage === 'en' ? 'Quick Guide' : 'Guía Rápida 3D'"
      @click="emit('open-guide')"
    >
      <Sparkles :size="14" class="sparkle-icon" />
      <span>{{ currentLanguage === 'ja' ? 'ガイド' : currentLanguage === 'en' ? 'Guide' : 'Guía 3D' }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.floating-left-dock {
  position: fixed;
  bottom: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 4px 6px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05);
  z-index: 90;
  user-select: none;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    bottom: 58px; // Above mobile tabs
    left: 10px;
  }
}

.floating-right-dock {
  position: fixed;
  bottom: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 4px 6px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05);
  z-index: 90;
  user-select: none;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    bottom: 58px; // Above mobile tabs
    right: 10px;
    gap: 4px;
  }
}

.dock-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
    color: #0f172a;
  }

  @media (max-width: 768px) {
    padding: 4px 8px;
    font-size: 11px;
  }
}

/* 1. Developer Button (Left) */
.dev-btn {
  .dev-emoji {
    font-size: 12px;
  }

  .dev-name {
    color: #334155;
    font-weight: 600;
  }

  .ext-icon {
    color: #94a3b8;
    transition: transform 0.15s ease;
  }

  &:hover {
    background: #f1f5f9;
    border-color: #94a3b8;

    .ext-icon {
      color: #6366f1;
      transform: translate(1px, -1px);
    }
  }

  @media (max-width: 600px) {
    .dev-name {
      display: none;
    }
  }
}

/* 2. Grid Toggle Button (Right) */
.grid-toggle-btn {
  &.is-active {
    background: #eff6ff;
    border-color: #93c5fd;
    color: #1d4ed8;

    .text-active {
      color: #2563eb;
    }
  }
}

/* 3. Guide Button (Right) */
.guide-btn {
  .sparkle-icon {
    color: #f59e0b;
  }

  &:hover {
    background: #f8fafc;
    border-color: #94a3b8;
  }
}
</style>
