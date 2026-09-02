# Tareas: 004 - Grillas de Perspectiva en Suelo y Objeto

**Plan base**: plan.md  
**Fecha**: 2026-08-26  
**Estado general**: [x] Completo  

---

## Fase 1: Estado Reactivo

- [x] **TASK-01**: Crear composable `useGridState`.
  - Archivo: `src/composables/useGridState.ts`
  - Criterio: Estado reactivo de `showGroundGrid` (true), `showObjectWireframe` (true) y `wireframeOpacity` (0.35) con métodos de toggle y ajuste.
  - Dependencias: ninguna

---

## Fase 2: Motor 3D & Entidades

- [x] **TASK-02**: Actualizar `GroundEntity` con `GridHelper` de perspectiva.
  - Archivo: `src/three/entities/Ground.ts`
  - Criterio: Cuadrícula en `y = -1.498` con método `setGridVisible(visible: boolean)`.
  - Dependencias: TASK-01

- [x] **TASK-03**: Actualizar `ShapesManager` con Wireframe Overlay y `polygonOffset`.
  - Archivo: `src/three/entities/Shapes.ts`
  - Criterio: Creación de capa `LineSegments` transparente que se actualiza con cada forma, y métodos `setWireframeVisible()` y `setWireframeOpacity()`.
  - Dependencias: TASK-01

- [x] **TASK-04**: Integrar métodos de grillas y wireframe en `SceneManager.ts`.
  - Archivo: `src/three/core/SceneManager.ts`
  - Criterio: Métodos delegados `setGroundGridVisible()`, `setObjectWireframeVisible()` y `setObjectWireframeOpacity()`.
  - Dependencias: TASK-02, TASK-03

---

## Fase 3: Componentes Vue & UI

- [x] **TASK-05**: Crear componente `ViewControlsToolbar.vue`.
  - Archivo: `src/components/ViewControlsToolbar.vue`
  - Criterio: Botonera en panel de vidrio con toggles para grilla de suelo y wireframe de objeto, más control de opacidad.
  - Dependencias: TASK-01

- [x] **TASK-06**: Integrar `ViewControlsToolbar` en `SceneCanvas.vue` y `App.vue`.
  - Archivo: `src/components/SceneCanvas.vue`, `src/App.vue`
  - Criterio: Canvas sincronizado reactivamente con `useGridState` y barra de herramientas montada en el overlay.
  - Dependencias: TASK-04, TASK-05

---

## Fase 4: Verificación

- [x] **TASK-07**: Validar compilación TypeScript y funcionamiento en navegador.
  - Criterio: Cero errores de tipos, grilla de suelo y wireframe visibles por defecto y controlables con los toggles.
  - Dependencias: TASK-06

---

## Resumen
- Total tareas: 7
- Estimación: 1 sesión de trabajo
