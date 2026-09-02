# Plan de Implementación: 005 - Anillos Gizmo 3D de Rotación

**Basado en**: specs/005-rotation-gizmo-rings/spec.md  
**Fecha**: 2026-08-26  

## Stack y Herramientas
- **Three.js**: `TorusGeometry`, `MeshBasicMaterial`, `Raycaster`, `Vector2`, `Vector3`, `Quaternion`, `Matrix4`.
- **Vue 3**: Composition API, composable `useSelectionState`, `useGridState` o nuevo `useRotationState`.
- **Iconos**: `lucide-vue-next` (`RotateCcw`, `CircleDot`, `Orbit`).
- **Estilos**: SCSS modular.

## Arquitectura
- **Entidad Gizmo de Rotación (`RotationGizmo.ts`)**:
  - Contiene 3 toroides delgados centrados en el objeto:
    - **Anillo X (Rojo #ef4444)**: Rotación en eje X (Pitch).
    - **Anillo Y (Verde #22c55e)**: Rotación en eje Y (Yaw / Turntable).
    - **Anillo Z (Azul #3b82f6)**: Rotación en eje Z (Roll).
  - Materiales con `transparent: true, opacity: 0.6, depthTest: false` para visualización limpia siempre por encima de las caras sin tapar la geometría.
  - Sincroniza su posición con el centro de masa de la forma activa.
- **Controlador de Rotación Axil (`ObjectRotationController.ts`)**:
  - Detecta en `pointerdown` si el puntero intersectó un anillo específico (`'x'`, `'y'` o `'z'`).
  - Si se intersectó un anillo: bloquea la rotación calculando el ángulo de giro diferencial sobre ese eje.
  - Si no se intersectó un anillo: aplica el modo de rotación de fondo (Turntable horizontal con inercia suave).
- **Integración con Selección (`SelectionController.ts` y `SceneManager.ts`)**:
  - Los anillos del gizmo solo son visibles si `selectedTarget === 'shape'`.
- **UI (`ViewControlsToolbar.vue`)**:
  - Botón de "Reset Rotación" con icono `RotateCcw` para restablecer ángulos a (0, 0, 0) al instante.

```
src/
├── components/
│   ├── ViewControlsToolbar.vue           # [MODIFICAR] Añadir botón Reset Rotación
│   └── SceneCanvas.vue                   # [MODIFICAR] Sincronizar gizmo
├── three/
│   ├── controls/
│   │   ├── ObjectRotationController.ts   # [MODIFICAR] Manejar rotación axial por anillo
│   │   └── SelectionController.ts
│   ├── core/
│   │   └── SceneManager.ts               # [MODIFICAR] Integrar RotationGizmo
│   └── gizmos/
│       └── RotationGizmo.ts              # [NUEVO] Entidad 3D con los 3 anillos de rotación
```

## Archivos a Crear
| Archivo | Propósito |
|---------|-----------|
| `src/three/gizmos/RotationGizmo.ts` | Entidad 3D con los 3 anillos de rotación (Rojo, Verde, Azul) y hover highlights |

## Archivos a Modificar
| Archivo | Cambio |
|---------|--------|
| `src/three/controls/ObjectRotationController.ts` | Soportar detección y rotación axial por anillo |
| `src/three/core/SceneManager.ts` | Instanciar `RotationGizmo`, sincronizar posición y exponer `resetRotation()` |
| `src/components/ViewControlsToolbar.vue` | Añadir botón de reseteo de rotación |
| `src/components/SceneCanvas.vue` | Exponer método `resetRotation()` |

## Interfaces / Tipos Clave
```typescript
export type GizmoAxis = 'x' | 'y' | 'z' | null;

export interface RotationGizmoOptions {
  radius?: number;
  tubeRadius?: number;
}
```

## Decisiones de Diseño
- **Hit-testing Ampliado**: Los toroides tienen un radio de tubo visualmente delgado (0.02) pero un radio de intersección cómodo para clic fácil con el ratón o dedos táctiles.
- **Render Order Alto**: `renderOrder: 999` y `depthTest: false` para que los anillos se vean como una interfaz de manipulación clara alrededor de cualquier objeto geométrico sin ocluirse.

## Estrategia de Verificación
- Clicar en la esfera/cubo: los anillos rojo, verde y azul aparecen centrados en la figura.
- Arrastrar sobre el anillo verde: el objeto solo gira horizontalmente.
- Arrastrar sobre el anillo rojo: el objeto solo se inclina hacia adelante/atrás.
- Arrastrar sobre el fondo: rotación fluida tipo plato giratorio.
- Clicar en "Reset Rotación": el objeto vuelve a (0, 0, 0).

## Riesgos Técnicos
- Mapeo de movimiento del ratón 2D a rotación en eje 3D (mitigado calculando el producto cruz o ángulo relativo al centro de pantalla del objeto).
