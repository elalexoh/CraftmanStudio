# Tareas: 005 - Anillos Gizmo 3D de Rotación

**Plan base**: plan.md  
**Fecha**: 2026-08-26  
**Estado general**: [x] Completo  

---

## Fase 1: Motor 3D & Entidad Gizmo

- [x] **TASK-01**: Implementar entidad 3D `RotationGizmo.ts`.
  - Archivo: `src/three/gizmos/RotationGizmo.ts`
  - Criterio: 3 anillos toroidales ortogonales (Rojo X, Verde Y, Azul Z) con materiales semitransparentes, userData para raycast y método `setPosition()`.
  - Dependencias: ninguna

- [x] **TASK-02**: Actualizar `ObjectRotationController.ts` para rotación axial por anillo y modo fondo.
  - Archivo: `src/three/controls/ObjectRotationController.ts`
  - Criterio: Detección de clic en anillo con raycaster, giro bloqueado al eje elegido (`'x'`, `'y'` o `'z'`) y giro libre/turntable en espacio vacío.
  - Dependencias: TASK-01

- [x] **TASK-03**: Integrar `RotationGizmo` y `resetRotation()` en `SceneManager.ts`.
  - Archivo: `src/three/core/SceneManager.ts`
  - Criterio: Gizmo instanciado y visible solo cuando `selectedTarget === 'shape'`, con sincronización de posición al cambiar de forma y método `resetRotation()`.
  - Dependencias: TASK-01, TASK-02

---

## Fase 2: Componentes Vue & UI

- [x] **TASK-04**: Integrar botón de Reset Rotación en `ViewControlsToolbar.vue` y sincronizar en `SceneCanvas.vue`.
  - Archivo: `src/components/ViewControlsToolbar.vue`, `src/components/SceneCanvas.vue`
  - Criterio: Botón con icono `RotateCcw` que restablece la rotación a (0, 0, 0) al hacer clic.
  - Dependencias: TASK-03

---

## Fase 3: Verificación

- [x] **TASK-05**: Validar compilación TypeScript y funcionamiento en navegador.
  - Criterio: Cero errores de tipos, manipulación individual por anillo X, Y, Z y botón de reset funcionando.
  - Dependencias: TASK-04

---

## Resumen
- Total tareas: 5
- Estimación: 1 sesión de trabajo
