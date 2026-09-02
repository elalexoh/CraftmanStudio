<script setup lang="ts">
import { useShapeState } from '../composables/useShapeState';
import type { ShapeType } from '../three/types/scene';
import {
  Circle,
  Box,
  Cylinder,
  Triangle,
  CircleDot,
  User,
} from 'lucide-vue-next';

const { currentShape, catalog, setShape } = useShapeState();

const getIcon = (id: ShapeType) => {
  switch (id) {
    case 'sphere':
      return Circle;
    case 'cube':
      return Box;
    case 'cylinder':
      return Cylinder;
    case 'cone':
      return Triangle;
    case 'torus':
      return CircleDot;
    case 'asaro':
      return User;
  }
};
</script>

<template>
  <nav class="shape-selector-container glass-panel" aria-label="Catálogo de formas 3D">
    <button
      v-for="shape in catalog"
      :key="shape.id"
      class="shape-btn"
      :class="{ 'is-active': currentShape === shape.id }"
      :title="`${shape.label}: ${shape.description}`"
      @click="setShape(shape.id)"
    >
      <component :is="getIcon(shape.id)" :size="20" class="btn-icon" />
      <span class="btn-label">{{ shape.label }}</span>
    </button>
  </nav>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.shape-selector-container {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem;
  overflow-x: auto;
  max-width: 100%;

  /* Scrollbar oculta */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.shape-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.5rem 0.85rem;
  border-radius: $radius-sm;
  color: $text-secondary;
  background: transparent;
  transition: all $transition-fast;
  min-width: 68px;

  .btn-icon {
    transition: transform $transition-fast;
  }

  .btn-label {
    font-size: 0.72rem;
    font-weight: 500;
    white-space: nowrap;
  }

  &:hover {
    color: $text-primary;
    background: rgba(255, 255, 255, 0.08);

    .btn-icon {
      transform: scale(1.1);
    }
  }

  &.is-active {
    color: #ffffff;
    background: $accent-primary;
    box-shadow: 0 0 16px rgba(99, 102, 241, 0.4);

    .btn-icon {
      transform: scale(1.05);
    }
  }
}
</style>
