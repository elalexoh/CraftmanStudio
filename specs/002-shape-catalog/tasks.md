# Tareas: 002 - Catálogo de Formas y Asaro Head

**Plan base**: plan.md  
**Fecha**: 2026-08-25  
**Estado general**: [x] Completo  

---

## Fase 1: Tipos & Estado Reactivo

- [x] **TASK-01**: Actualizar tipos para soportar catálogo de geometrías.
  - Archivo: `src/three/types/scene.ts`
  - Criterio: Tipo `ShapeType` y metadatos de formas definidos.
  - Dependencias: ninguna

- [x] **TASK-02**: Crear composable reactivo `useShapeState`.
  - Archivo: `src/composables/useShapeState.ts`
  - Criterio: Estado reactivo de la forma actual y métodos de selección disponibles para la UI y el motor.
  - Dependencias: TASK-01

---

## Fase 2: Geometrías & Motor 3D

- [x] **TASK-03**: Implementar geometría facetada de la Asaro Head.
  - Archivo: `src/three/geometries/AsaroHeadGeometry.ts`
  - Criterio: Malla facetada de cráneo y rostro con planos de frente, nariz, pómulos y mandíbula listos para flat shading.
  - Dependencias: TASK-01

- [x] **TASK-04**: Implementar controlador de rotación del objeto con inercia.
  - Archivo: `src/three/controls/ObjectRotationController.ts`
  - Criterio: Rotación suave en 2 ejes mediante eventos de puntero (mouse/touch) y amortiguación por inercia en el loop.
  - Dependencias: TASK-01

- [x] **TASK-05**: Actualizar `ShapesManager` para catálogo completo y alineación al suelo.
  - Archivo: `src/three/entities/Shapes.ts`
  - Criterio: Métodos para generar y cambiar entre Esfera, Cubo, Cilindro, Cono, Toroide y Asaro Head apoyados en `y = -1.5`.
  - Dependencias: TASK-03

- [x] **TASK-06**: Integrar rotación y cambio de forma en `SceneManager`.
  - Archivo: `src/three/core/SceneManager.ts`
  - Criterio: `SceneManager` expone `setShape(type: ShapeType)` y actualiza el controlador de rotación en cada frame.
  - Dependencias: TASK-04, TASK-05

---

## Fase 3: Componentes Vue & Integración UI

- [x] **TASK-07**: Crear componente flotante `ShapeSelector.vue`.
  - Archivo: `src/components/ShapeSelector.vue`
  - Criterio: Botonera en panel de vidrio con iconos de Lucide y estado activo sincronizado con `useShapeState`.
  - Dependencias: TASK-02

- [x] **TASK-08**: Integrar selector y sincronización en `SceneCanvas.vue` y `App.vue`.
  - Archivo: `src/components/SceneCanvas.vue`, `src/App.vue`
  - Criterio: Al hacer clic en un botón de la UI, la forma 3D cambia instantáneamente en pantalla.
  - Dependencias: TASK-06, TASK-07

---

## Fase 4: Verificación

- [x] **TASK-09**: Validar que no hay errores de compilación TypeScript y verificar funcionalidad.
  - Comando: Verificación manual / compilación de tipos
  - Criterio: Cero errores y las 6 formas rotables sobre el suelo.
  - Dependencias: TASK-08

---

## Resumen
- Total tareas: 9
- Estimación: 1 sesión de trabajo
