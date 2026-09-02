# Tareas: 003 - Sistema de Iluminación y Selección Interactiva

**Plan base**: plan.md  
**Fecha**: 2026-08-26  
**Estado general**: [x] Completo  

---

## Fase 1: Tipos & Estado Reactivo

- [x] **TASK-01**: Actualizar tipos en `src/three/types/scene.ts`.
  - Archivo: `src/three/types/scene.ts`
  - Criterio: Tipos `SelectableTarget` y `SphericalLightState` definidos.
  - Dependencias: ninguna

- [x] **TASK-02**: Crear composables `useSelectionState` y `useLightingState`.
  - Archivo: `src/composables/useSelectionState.ts`, `src/composables/useLightingState.ts`
  - Criterio: Estado reactivo de selección y conversor esférico-cartesiano de luz implementados.
  - Dependencias: TASK-01

---

## Fase 2: Motor 3D & Controladores

- [x] **TASK-03**: Actualizar `LightsManager` para soporte de coordenadas esféricas y helper interactivo.
  - Archivo: `src/three/entities/Lights.ts`
  - Criterio: Métodos `setSphericalPosition(azimuth, elevation, distance)`, `setColor`, `setIntensity` y helper seleccionable.
  - Dependencias: TASK-01

- [x] **TASK-04**: Actualizar `ShapesManager` para exponer malla para raycasting.
  - Archivo: `src/three/entities/Shapes.ts`
  - Criterio: Método `getMesh()` accesible para pruebas de intersección de raycaster.
  - Dependencias: TASK-01

- [x] **TASK-05**: Implementar `SelectionController.ts` con Raycasting y contorno de selección (Outline).
  - Archivo: `src/three/controls/SelectionController.ts`
  - Criterio: Detección por clic sobre objeto y luz con highlight visual en el elemento activo.
  - Dependencias: TASK-03, TASK-04

- [x] **TASK-06**: Integrar selección y parámetros de luz en `SceneManager.ts`.
  - Archivo: `src/three/core/SceneManager.ts`
  - Criterio: `SceneManager` expone métodos para seleccionar y actualizar la luz en tiempo real.
  - Dependencias: TASK-05

---

## Fase 3: Componentes Vue & UI

- [x] **TASK-07**: Crear widget interactivo `LightGizmo.vue`.
  - Archivo: `src/components/LightGizmo.vue`
  - Criterio: Mini-esfera con punto de luz arrastrable que actualiza azimut y elevación en tiempo real.
  - Dependencias: TASK-02

- [x] **TASK-08**: Crear panel de sliders `LightControlPanel.vue`.
  - Archivo: `src/components/LightControlPanel.vue`
  - Criterio: Sliders para azimut, elevación, distancia, intensidad y selector de color con diseño colapsable.
  - Dependencias: TASK-02

- [x] **TASK-09**: Integrar `LightGizmo`, `LightControlPanel` y selección en `SceneCanvas.vue` y `App.vue`.
  - Archivo: `src/components/SceneCanvas.vue`, `src/App.vue`
  - Criterio: Interfaz completa conectada bidireccionalmente con el motor 3D.
  - Dependencias: TASK-06, TASK-07, TASK-08

---

## Fase 4: Verificación

- [x] **TASK-10**: Validar compilación TypeScript y funcionamiento en navegador.
  - Criterio: Cero errores de tipos, selección interactiva, manipulación por gizmo y sombras fluidas a 60 FPS.
  - Dependencias: TASK-09

---

## Resumen
- Total tareas: 10
- Estimación: 1 sesión de trabajo
