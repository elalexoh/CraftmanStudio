<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { PanoramicEngine } from './three/PanoramicEngine';
import { useLayers, onCanvasUpdated } from './composables/useLayers';
import { usePainting } from './composables/usePainting';
import { useAppState } from './composables/useAppState';
import { useProjectStorage } from './composables/useProjectStorage';
import { useI18n } from './composables/useI18n';

// 360 Canvas Components
import TopToolbar from './components/TopToolbar.vue';
import DrawingTools from './components/DrawingTools.vue';
import LayerPanel from './components/LayerPanel.vue';
import SelectionOverlay from './components/SelectionOverlay.vue';
import PreviewModal from './components/PreviewModal.vue';
import HelpModal from './components/HelpModal.vue';
import HotkeysSettingsModal from './components/HotkeysSettingsModal.vue';
import MobileBottomTabs from './components/MobileBottomTabs.vue';
import CameraPresetsPanel from './components/CameraPresetsPanel.vue';
import ZenHudToast from './components/ZenHudToast.vue';

// 3D Shading Reference Components
import SceneCanvas from './components/SceneCanvas.vue';
import ShapeSelector from './components/ShapeSelector.vue';
import LightGizmo from './components/LightGizmo.vue';
import LightControlPanel from './components/LightControlPanel.vue';
import ViewControlsToolbar from './components/ViewControlsToolbar.vue';
import RotationGizmoWidget from './components/RotationGizmoWidget.vue';
import { useShapeState } from './composables/useShapeState';
import { useSelectionState } from './composables/useSelectionState';
import { Sun, Box, MousePointerClick } from 'lucide-vue-next';

import { useHotkeys, isSpaceActive, isZActive } from './composables/useHotkeys';
import { useRulers } from './composables/useRulers';
import { useSelection } from './composables/useSelection';
import { useCameraPresets, onOrientationRequested } from './composables/useCameraPresets';
import { useEnvironmentSettings, onEnvironmentChanged } from './composables/useEnvironmentSettings';
import { useZenMode } from './composables/useZenMode';

import FloatingBottomDock from './components/FloatingBottomDock.vue';
import OnboardingModal from './components/OnboardingModal.vue';

const viewportRef = ref<HTMLElement | null>(null);
let engine: PanoramicEngine | null = null;
const isOnboardingOpen = ref(false);

const { activeRuler, strokeAnchor } = useRulers();
const { selectionPoints, hasSelection, isDrawingLasso, isInverted } = useSelection();
const { syncFromEngine } = useCameraPresets();
const { isZenMode } = useZenMode();

const { masterCanvas, initDefaultLayers } = useLayers();
const {
  currentTool,
  penSize,
  setTool,
  setPenSize,
  startStroke,
  continueStroke,
  endStroke
} = usePainting();
const {
  appMode,
  eyeHeight,
  showGroundGrid,
  activeMobileTab,
  isPreviewOpen,
  isHelpOpen
} = useAppState();
const { loadFromIndexedDB, saveToIndexedDB } = useProjectStorage();
const { t } = useI18n();
const { setupHotkeysListener, cleanupHotkeysListener } = useHotkeys();

// 3D Reference State
const { currentShape, catalog } = useShapeState();
const { selectedTarget, setSelection } = useSelectionState();

const currentShapeLabel = computed(() => {
  const item = catalog.find((c) => c.id === currentShape.value);
  return item ? item.label : 'Forma';
});

// Input states
const isInteracting = ref(false);
let lastPointerPos = { x: 0, y: 0 };
let activeTouchCount = 0;
let initialPinchDistance = 0;

// Ctrl + Alt Brush Resizing state
const isCtrlAltResizing = ref(false);
const resizeCursorX = ref(0);
const resizeCursorY = ref(0);
let startResizePointerX = 0;
let startResizeBrushSize = 3;

// Mobile detection
const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

function handleResize() {
  isMobile.value = window.innerWidth <= 768;
}

function init360Engine() {
  if (viewportRef.value && !engine) {
    engine = new PanoramicEngine(viewportRef.value);
    engine.setEyeHeight(eyeHeight.value);
    engine.toggleGroundGrid(showGroundGrid.value);
    engine.setMasterCanvas(masterCanvas);

    // Sync camera orientation to reactive state
    engine.onCameraRotated = (yawDeg, pitchDeg, rollDeg) => {
      syncFromEngine(yawDeg, pitchDeg, rollDeg);
    };

    // Listen to orientation and preset requests from UI
    onOrientationRequested((targetOrientation, preset, smooth) => {
      if (!engine) return;
      if (preset === 'isometric') {
        engine.setGridType('isometric');
      } else if (preset === 'cavalier' || preset === 'military') {
        engine.setGridType('axonometric');
      } else {
        engine.setGridType('standard');
      }

      if (smooth) {
        engine.animateToOrientationDeg(targetOrientation.yaw, targetOrientation.pitch, targetOrientation.roll, 350);
      } else {
        engine.setOrientationDeg(targetOrientation.yaw, targetOrientation.pitch, targetOrientation.roll);
      }
    });

    // Listen to environment settings (background color, grid color, grid mode)
    onEnvironmentChanged((env) => {
      if (!engine) return;
      engine.setBackgroundColor(env.backgroundColor);
      engine.setGridColor(env.gridColor, env.gridOpacity);
      engine.setGridType(env.gridMode);
    });
  }
}

onMounted(async () => {
  setTool('pen');
  window.addEventListener('resize', handleResize);
  setupHotkeysListener();

  // Try loading saved session from IndexedDB, else init default layer
  const loaded = await loadFromIndexedDB();
  if (!loaded) {
    initDefaultLayers(t('layerName'));
  }

  if (appMode.value === '360') {
    init360Engine();
  }

  // Check if onboarding was already completed
  try {
    if (!localStorage.getItem('craftsman_onboarding_seen')) {
      isOnboardingOpen.value = true;
    }
  } catch (e) {}

  // Subscribe to texture updates
  onCanvasUpdated(() => {
    engine?.notifyTextureUpdated();
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  cleanupHotkeysListener();
  engine?.dispose();
  engine = null;
});

// Watch appMode changes
watch(appMode, (newMode) => {
  if (newMode === '360') {
    nextTick(() => {
      init360Engine();
    });
  } else {
    engine?.dispose();
    engine = null;
  }
});

// Synchronize state with engine
watch(eyeHeight, (newHeight) => {
  engine?.setEyeHeight(newHeight);
});

watch(showGroundGrid, (newVal) => {
  engine?.toggleGroundGrid(newVal);
});

watch([activeRuler, strokeAnchor], () => {
  if (engine) {
    engine.updateRulerGuides(
      activeRuler.value,
      strokeAnchor.value
    );
  }
});

watch([selectionPoints, hasSelection, isDrawingLasso, isInverted], () => {
  if (engine) {
    engine.updateSelectionGuides(selectionPoints.value, hasSelection.value, isDrawingLasso.value, isInverted.value);
  }
}, { deep: true });

// Pointer / Mouse events on 3D Viewport
function onPointerDown(e: PointerEvent) {
  if (appMode.value !== '360') return;
  if (e.button !== 0 && e.button !== 2 && e.pointerType === 'mouse') return;
  (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);

  // Ctrl + Alt : Brush Sizing Drag mode
  if ((e.ctrlKey || e.metaKey) && e.altKey) {
    isCtrlAltResizing.value = true;
    resizeCursorX.value = e.clientX;
    resizeCursorY.value = e.clientY;
    startResizePointerX = e.clientX;
    startResizeBrushSize = penSize.value;
    return;
  }

  isInteracting.value = true;
  lastPointerPos = { x: e.clientX, y: e.clientY };

  if (isSpaceActive.value || isZActive.value) {
    return;
  }

  // Raycast to 3D sphere surface
  const hit = engine?.raycastFromClientCoords(e.clientX, e.clientY);
  if (hit) {
    startStroke(hit.pixelX, hit.pixelY);
  }
}

function onPointerMove(e: PointerEvent) {
  if (appMode.value !== '360' || !engine) return;

  // Handle Ctrl + Alt Drag / Move resizing
  if ((e.ctrlKey || e.metaKey) && e.altKey) {
    if (!isCtrlAltResizing.value) {
      isCtrlAltResizing.value = true;
      startResizePointerX = e.clientX;
      startResizeBrushSize = penSize.value;
    }
    const dx = e.clientX - startResizePointerX;
    const delta = Math.round(dx * 0.25);
    const newSize = Math.max(1, Math.min(50, startResizeBrushSize + delta));
    setPenSize(newSize);
    resizeCursorX.value = e.clientX;
    resizeCursorY.value = e.clientY;
    return;
  } else if (isCtrlAltResizing.value) {
    isCtrlAltResizing.value = false;
  }

  const dx = e.clientX - lastPointerPos.x;
  const dy = e.clientY - lastPointerPos.y;

  // Space + Drag: Orbit Look (Shift locks to 15-deg steps)
  if (isInteracting.value && isSpaceActive.value) {
    const rotSpeed = 0.0035;
    engine.rotateCameraWithSnap(-dx * rotSpeed, dy * rotSpeed, e.shiftKey);
    lastPointerPos = { x: e.clientX, y: e.clientY };
    return;
  }

  // Z + Drag: Zoom FOV
  if (isInteracting.value && isZActive.value) {
    const zoomSpeed = 0.3;
    engine.zoomFov(dy * zoomSpeed);
    lastPointerPos = { x: e.clientX, y: e.clientY };
    return;
  }

  // Screen-space Orthogonal Snap (MediBang style: 0% distortion at any camera angle)
  if (isInteracting.value && activeRuler.value !== 'none' && strokeAnchor.value && !isSpaceActive.value && !isZActive.value) {
    const snapped = engine.snapRaycastToScreenOrthogonal(e.clientX, e.clientY, strokeAnchor.value, lockedScreenAxis, activeRuler.value);
    if (snapped) {
      lockedScreenAxis = snapped.lockedAxis;
      continueStroke(snapped.pixelX, snapped.pixelY);
      lastPointerPos = { x: e.clientX, y: e.clientY };
      return;
    }
  }

  // Normal Drawing Raycast
  const hit = engine.raycastFromClientCoords(e.clientX, e.clientY);
  if (hit) {
    if (isInteracting.value && !isSpaceActive.value && !isZActive.value) {
      continueStroke(hit.pixelX, hit.pixelY);
    }

    // Update 3D Eraser Cursor visualizer
    if (currentTool.value === 'eraser') {
      engine.setEraserCursor(hit.point, hit.point.clone().normalize().negate(), penSize.value);
    } else {
      engine.setEraserCursor(null, null);
    }
  } else {
    engine.setEraserCursor(null, null);
  }

  lastPointerPos = { x: e.clientX, y: e.clientY };
}

let lockedScreenAxis: 'x' | 'y' | null = null;

function onPointerUp(e: PointerEvent) {
  if (appMode.value !== '360') return;

  lockedScreenAxis = null;

  if (isCtrlAltResizing.value) {
    isCtrlAltResizing.value = false;
    (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
    return;
  }

  isInteracting.value = false;
  (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
  endStroke();
  saveToIndexedDB(); // Auto save
}

function onWheel(e: WheelEvent) {
  if (appMode.value !== '360' || !engine) return;
  const delta = e.deltaY > 0 ? 3 : -3;
  engine.zoomFov(delta);
}

// Touch Gestures support (2 fingers orbit, pinch zoom)
function onTouchStart(e: TouchEvent) {
  if (appMode.value !== '360') return;
  activeTouchCount = e.touches.length;
  if (activeTouchCount === 2) {
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    initialPinchDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    lastPointerPos = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
  }
}

function onTouchMove(e: TouchEvent) {
  if (appMode.value !== '360' || !engine) return;
  if (e.touches.length === 2) {
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    const midX = (t1.clientX + t2.clientX) / 2;
    const midY = (t1.clientY + t2.clientY) / 2;

    // Orbit with 2 fingers
    const dx = midX - lastPointerPos.x;
    const dy = midY - lastPointerPos.y;
    engine.rotateCamera(-dx * 0.005, dy * 0.005);

    // Pinch Zoom
    if (initialPinchDistance > 0) {
      const pinchDelta = (initialPinchDistance - currentDist) * 0.15;
      engine.zoomFov(pinchDelta);
    }

    initialPinchDistance = currentDist;
    lastPointerPos = { x: midX, y: midY };
  }
}

function onTouchEnd(e: TouchEvent) {
  activeTouchCount = e.touches.length;
}
</script>

<template>
  <div class="app-root" :class="{ 'zen-mode-active': isZenMode }">
    <!-- Zen Mode HUD Indicator -->
    <ZenHudToast />

    <!-- Top Toolbar with Mode Switcher -->
    <TopToolbar />

    <!-- ============================================== -->
    <!-- MODE 1: Gururi Paint 360 Panoramic Canvas     -->
    <!-- ============================================== -->
    <template v-if="appMode === '360'">
      <main
        ref="viewportRef"
        class="viewport-container"
        :class="{
          'cursor-grab': isSpaceActive,
          'cursor-zoom': isZActive,
          'cursor-crosshair': !isSpaceActive && !isZActive
        }"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @wheel.prevent="onWheel"
        @touchstart.passive="onTouchStart"
        @touchmove.passive="onTouchMove"
        @touchend.passive="onTouchEnd"
      ></main>

      <!-- Sidebars: Always visible on desktop, tab-controlled on mobile -->
      <DrawingTools
        v-show="!isMobile || activeMobileTab === 'draw'"
        class="desktop-tool-sidebar"
      />

      <LayerPanel
        v-show="!isMobile || activeMobileTab === 'layer'"
        class="desktop-layer-sidebar"
      />

      <!-- Inclinación & Presets Axonométricos Panel -->
      <CameraPresetsPanel />

      <!-- Selection Marching Ants Overlay -->
      <SelectionOverlay />

      <!-- Bottom Tabs for Mobile -->
      <MobileBottomTabs />

      <!-- Visual Feedback for Brush Resizing (Ctrl + Alt + Drag) -->
      <div
        v-if="isCtrlAltResizing"
        class="brush-resize-overlay"
        :style="{
          left: `${resizeCursorX}px`,
          top: `${resizeCursorY}px`,
          width: `${Math.max(16, penSize * 4)}px`,
          height: `${Math.max(16, penSize * 4)}px`
        }"
      >
        <div class="resize-circle"></div>
        <span class="resize-badge">{{ penSize }} px</span>
      </div>

      <!-- Modals -->
      <PreviewModal />
      <HelpModal />
      <HotkeysSettingsModal />
    </template>

    <!-- ============================================== -->
    <!-- MODE 2: 3D Shading Reference (Geometry Study) -->
    <!-- ============================================== -->
    <template v-else-if="appMode === '3d-reference'">
      <div class="shading-study-container">
        <!-- 3D Canvas -->
        <SceneCanvas />

        <!-- UI Overlay -->
        <div class="shading-overlay-ui">
          <!-- Top Row Status & Light Controls -->
          <div class="shading-top-row">
            <aside class="right-lighting-controls">
              <LightGizmo />
              <LightControlPanel />
            </aside>
          </div>

          <!-- Rotation Gizmo -->
          <RotationGizmoWidget />

          <!-- Bottom Controls -->
          <div class="shading-bottom-controls">
            <ViewControlsToolbar />
            <ShapeSelector />

            <footer class="shading-footer">
              <div class="info-pill glass-panel">
                <button
                  class="pill-segment"
                  :class="{ 'is-active': selectedTarget === 'light' }"
                  @click="setSelection('light')"
                >
                  <Sun :size="14" class="pill-icon light-icon" />
                  <span>Luz Puntual</span>
                </button>
                <span class="separator">•</span>
                <button
                  class="pill-segment"
                  :class="{ 'is-active': selectedTarget === 'shape' }"
                  @click="setSelection('shape')"
                >
                  <Box :size="14" class="pill-icon shape-icon" />
                  <span>{{ currentShapeLabel }}</span>
                </button>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </template>

    <!-- Floating Bottom Dock (Grid Toggle, Guide, Developer Portfolio) -->
    <FloatingBottomDock @open-guide="isOnboardingOpen = true" />

    <!-- Interactive Quick Guide Modal -->
    <OnboardingModal v-if="isOnboardingOpen" @close="isOnboardingOpen = false" />
  </div>
</template>

<style scoped lang="scss">
@use './styles/variables' as *;

.app-root {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #0f172a;
}

.viewport-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  touch-action: none;

  &.cursor-grab {
    cursor: grab;
    &:active {
      cursor: grabbing;
    }
  }

  &.cursor-zoom {
    cursor: ns-resize;
  }

  &.cursor-crosshair {
    cursor: crosshair;
  }
}

.shading-study-container {
  position: absolute;
  top: 48px;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.shading-overlay-ui {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  z-index: 10;

  > * {
    pointer-events: auto;
  }
}

.shading-top-row {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.right-lighting-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}

.shading-bottom-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
}

.shading-footer {
  display: flex;
  justify-content: center;
  width: 100%;

  .info-pill {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.85rem;
    font-size: 0.78rem;
    color: $text-secondary;

    .pill-segment {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.2rem 0.5rem;
      border-radius: $radius-sm;
      transition: all $transition-fast;

      .pill-icon {
        &.light-icon {
          color: #f59e0b;
        }
        &.shape-icon {
          color: $accent-primary;
        }
      }

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: $text-primary;
      }

      &.is-active {
        background: rgba(255, 255, 255, 0.12);
        color: $text-primary;
        font-weight: 600;
      }
    }

    .separator {
      color: $border-subtle;
    }
  }
}

.brush-resize-overlay {
  position: fixed;
  pointer-events: none;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .resize-circle {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid #ef4444;
    background: rgba(239, 68, 68, 0.2);
    box-shadow: 0 0 12px rgba(239, 68, 68, 0.5);
  }

  .resize-badge {
    position: absolute;
    bottom: -26px;
    background: rgba(15, 23, 42, 0.92);
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 4px;
    white-space: nowrap;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}

@media (max-width: 768px) {
  .desktop-tool-sidebar {
    top: auto;
    bottom: 56px;
    left: 8px;
    right: 8px;
    width: calc(100vw - 16px);
    max-height: 45vh;
    overflow-y: auto;
  }

  .desktop-layer-sidebar {
    top: auto;
    bottom: 56px;
    left: 8px;
    right: 8px;
    width: calc(100vw - 16px);
    max-height: 45vh;
  }
}

// Modo Zen: Inmersión total (oculta UI flotante con transición suave)
.zen-mode-active {
  .desktop-tool-sidebar,
  .desktop-layer-sidebar,
  .top-toolbar-container,
  .floating-bottom-dock,
  .mobile-tabs,
  .shading-overlay-ui,
  .rotation-gizmo-container,
  aside,
  header {
    opacity: 0 !important;
    pointer-events: none !important;
    transform: translateY(-6px) scale(0.98);
    transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }
}
</style>


