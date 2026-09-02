# Tareas: 006 - Lineart Cartoon Blanco y Asaro Head Anatómica

**Plan base**: plan.md  
**Fecha**: 2026-08-26  
**Estado general**: [x] Completo  

---

## Fase 1: Geometría Anatómica Asaro Head

- [x] **TASK-01**: Reconstruir `AsaroHeadGeometry.ts` con topología anatómica completa y rica en planos faciales.
  - Archivo: `src/three/geometries/AsaroHeadGeometry.ts`
  - Criterio: Malla con definición precisa de frente, órbitas, puente y punta de nariz, pómulos, labios, mentón, mandíbula y cráneo.
  - Dependencias: ninguna

---

## Fase 2: Motor 3D & Sistema de Lineart Blanco

- [x] **TASK-02**: Actualizar `ShapesManager` con EdgesGeometry y silueta exterior de contorno blanco.
  - Archivo: `src/three/entities/Shapes.ts`
  - Criterio: Eliminación de wireframe triangular interno, trazado limpio de aristas duras y silueta exterior en blanco puro (#ffffff).
  - Dependencias: TASK-01

---

## Fase 3: Estado Reactivo & Componentes UI

- [x] **TASK-03**: Actualizar `useGridState.ts` para soporte de Lineart Blanco.
  - Archivo: `src/composables/useGridState.ts`
  - Criterio: Estado `showObjectLineart` (true) y `lineartOpacity` (0.85).
  - Dependencias: ninguna

- [x] **TASK-04**: Actualizar `ViewControlsToolbar.vue` con botón "Lineart Blanco".
  - Archivo: `src/components/ViewControlsToolbar.vue`
  - Criterio: Botón con icono `PenTool`, etiqueta "Lineart Blanco" y slider de opacidad adaptado.
  - Dependencias: TASK-03

---

## Fase 4: Verificación

- [x] **TASK-05**: Validar compilación TypeScript y calidad visual en navegador.
  - Criterio: Cero errores de tipos, Asaro Head anatómica detallada y lineart blanco nítido en las 6 figuras.
  - Dependencias: TASK-02, TASK-04

---

## Resumen
- Total tareas: 5
- Estimación: 1 sesión de trabajo
