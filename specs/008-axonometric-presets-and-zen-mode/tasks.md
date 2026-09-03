# Tareas: Presets Axonométricos, Control Preciso de Inclinación y Modo Zen

**Plan base**: `plan.md`  
**Fecha**: 2026-09-02  
**Estado general**: [x] Completada

---

## Fase 1: Tipos y Composables Base

- [x] **TASK-01**: Crear composable de presets y orientación de cámara
  - Archivo: `src/composables/useCameraPresets.ts`
  - Criterio: Exporta estado reactivo para preset activo (`'free' | 'isometric' | 'dimetric' | 'cavalier' | 'military'`), ángulos en grados (`yaw`, `pitch`, `roll`), métodos de cambio de preset con valores canónicos y gestión de 4 slots de bookmarks.
  - Dependencias: ninguna

- [x] **TASK-02**: Crear composable de Modo Zen y notificaciones HUD
  - Archivo: `src/composables/useZenMode.ts`
  - Criterio: Exporta `isZenMode`, `toggleZenMode`, `zenToastMessage` y función `showZenToast(message)` con temporizador de desvanecimiento automático.
  - Dependencias: ninguna

---

## Fase 2: Motor 3D y Grillas

- [x] **TASK-03**: Ampliar `PanoramicEngine` con soporte de grados, interpolación y snap
  - Archivo: `src/three/PanoramicEngine.ts`
  - Criterio: Soporta orientación mediante grados numéricos, método de transición suave `animateToOrientation(yawDeg, pitchDeg, rollDeg, durationMs)`, snap a múltiplos de 15° al orbitar con `Shift` y renderizado de grilla axonométrica adaptable.
  - Dependencias: TASK-01

---

## Fase 3: Componentes de UI y Atajos

- [x] **TASK-04**: Crear componente HUD minimalista para Modo Zen
  - Archivo: `src/components/ZenHudToast.vue`
  - Criterio: Renderiza un badge flotante no obstructivo en la esquina/centro superior con animación de entrada y salida suave cuando `zenToastMessage` está activo.
  - Dependencias: TASK-02

- [x] **TASK-05**: Crear panel colapsable de presets e inclinación precisa
  - Archivo: `src/components/CameraPresetsPanel.vue`
  - Criterio: Interfaz con selector de presets (Isométrica, Dimétrica, Caballera, Militar, Libre), sliders e inputs numéricos interactivos de Yaw (0-360°), Pitch (-90° a 90°), Roll (-180° a 180°), botón colapsar/expandir y 4 slots de bookmarks.
  - Dependencias: TASK-01, TASK-03

- [x] **TASK-06**: Integrar atajo global `Tab` y bookmarks en `useHotkeys`
  - Archivo: `src/composables/useHotkeys.ts`
  - Criterio: Intercepta la tecla `Tab` para alternar Modo Zen (evitando blur indeseado si el foco está en un input/textarea) y teclas numéricas de bookmarks.
  - Dependencias: TASK-01, TASK-02

---

## Fase 4: Integración Global y Verificación

- [x] **TASK-07**: Integrar componentes y estilos de Modo Zen en `App.vue`
  - Archivo: `src/App.vue`
  - Criterio: Monta `CameraPresetsPanel` y `ZenHudToast`, conecta la reactividad con `PanoramicEngine` y aplica clase CSS `.zen-mode-active` para ocultar con suavidad la UI flotante al presionar `Tab`.
  - Dependencias: TASK-04, TASK-05, TASK-06

- [x] **TASK-08**: Verificación integral y build
  - Archivo: Todo el proyecto
  - Criterio: Compilación limpia, verificación de los presets de proyección, suavidad de movimiento, sincronización de grados y funcionalidad del Modo Zen sin regresiones.
  - Dependencias: TASK-07

---

## Resumen
- Total tareas: 8
- Fases: 4
- Estado: Completado con éxito
