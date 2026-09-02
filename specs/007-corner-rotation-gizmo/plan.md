# Plan de Implementación: 007 - Gizmo de Rotación en Esquina Inferior Derecha

**Basado en**: specs/007-corner-rotation-gizmo/spec.md  
**Fecha**: 2026-08-26  

## Stack y Herramientas
- **Three.js**: Mini escena/canvas de orientación, `BoxGeometry`, `ConeGeometry`, `CylinderGeometry`, `MeshStandardMaterial`, `Raycaster`, `Quaternion`, `Euler`.
- **Vue 3**: Composition API, nuevo composable `useRotationState.ts`.
- **Iconos**: `lucide-vue-next` (`RotateCcw`, `Compass`, `Axis3d`).
- **Estilos**: SCSS con diseño glassmorphism.

## Arquitectura
- **1. Limpieza de Escena Central (`SceneManager.ts` y `ObjectRotationController.ts`)**:
  - Eliminar la entidad `RotationGizmo.ts` del centro de la escena principal.
  - `ObjectRotationController.ts` gestiona la rotación limpia del objeto con inercia y emite la orientación actual a `useRotationState.ts`.
- **2. Composable de Estado de Rotación (`useRotationState.ts`)**:
  - Estado reactivo `rotationEuler = ref({ x: 0, y: 0, z: 0 })`.
  - Métodos `setRotation()`, `rotateAxis(axis, delta)`, `snapToView(axis)` y `resetRotation()`.
- **3. Componente `RotationGizmoWidget.vue` (Bottom-Right)**:
  - Mini canvas 3D (110x110px) montado en la esquina inferior derecha.
  - Renderiza un cubo de orientación con facetas marcadas (Top, Front, Right, etc.) y los 3 ejes coordenados coloreados (X Rojo, Y Verde, Z Azul) con botones de eje.
  - Arrastrar el widget rota la figura principal en vivo; clicar un eje orienta la cámara/objeto a esa vista canónica (0°, 90°, etc.).
- **4. Integración en `App.vue`**:
  - Montar `RotationGizmoWidget.vue` en la esquina inferior derecha.

```
src/
├── components/
│   ├── RotationGizmoWidget.vue           # [NUEVO] Mini widget 3D de navegación en esquina
│   ├── SceneCanvas.vue                   # [MODIFICAR] Sincronizar useRotationState
│   └── ViewControlsToolbar.vue           # [MODIFICAR] Enlazar reset
├── composables/
│   └── useRotationState.ts               # [NUEVO] Composable de rotación compartida
├── three/
│   ├── controls/
│   │   └── ObjectRotationController.ts   # [MODIFICAR] Notificar rotación continua
│   └── core/
│       └── SceneManager.ts               # [MODIFICAR] Remover gizmo central y exponer hooks
```

## Archivos a Crear
| Archivo | Propósito |
|---------|-----------|
| `src/composables/useRotationState.ts` | Estado centralizado de rotación y eventos de orientación |
| `src/components/RotationGizmoWidget.vue` | Widget 3D interactivo en esquina inferior derecha estilo Blender |

## Archivos a Modificar
| Archivo | Cambio |
|---------|--------|
| `src/three/core/SceneManager.ts` | Remover `RotationGizmo` central |
| `src/three/controls/ObjectRotationController.ts` | Notificar cambios de rotación al composable |
| `src/components/SceneCanvas.vue` | Conectar `useRotationState` |
| `src/App.vue` | Renderizar `RotationGizmoWidget` en esquina inferior derecha |

## Interfaces / Tipos Clave
```typescript
export interface RotationEuler {
  x: number;
  y: number;
  z: number;
}
```

## Estrategia de Verificación
- La figura central no tiene ningún elemento gráfico superpuesto.
- El widget de la esquina inferior derecha gira en sincronía exacta con el objeto.
- Arrastrar sobre el widget de esquina permite orientar el objeto con precisión.
- Clic en los ejes X, Y, Z posiciona el objeto en vistas canónicas directas.
- El botón de Reset funciona perfectamente.

## Riesgos Técnicos
- Sincronización entre las dos instancias de Three.js (mitigado compartiendo los valores Euler en el composable reactivo).
