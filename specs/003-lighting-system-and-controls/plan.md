# Plan de Implementación: 003 - Sistema de Iluminación y Selección Interactiva

**Basado en**: specs/003-lighting-system-and-controls/spec.md  
**Fecha**: 2026-08-26  

## Stack y Herramientas
- **Three.js**: `Raycaster`, `Vector2`, `Vector3`, `Spherical`, `LineSegments` / `EdgesGeometry` o `BoxHelper` para el contorno de selección (*Selection Outline*).
- **Vue 3**: Composition API, composables reactivos (`useLightingState.ts`, `useSelectionState.ts`).
- **Iconos**: `lucide-vue-next` (`Sun`, `Sliders`, `Eye`, `Move`, `RotateCw`, `Palette`, `Maximize2`, `Minimize2`).
- **Estilos**: SCSS modular y temas oscuros.

## Arquitectura
- **Controlador de Selección (`SelectionController.ts`)**:
  - Utiliza `THREE.Raycaster` para detectar clics en el canvas sobre la figura (`ShapesManager`) o el helper de la luz (`LightsManager`).
  - Sincroniza con `useSelectionState` en Vue.
  - Gestiona el efecto visual de selección (*Selection Highlight/Outline*) en color de acento (#6366f1 o #f59e0b estilo Blender).
- **Cálculo de Coordenadas Esféricas (`useLightingState.ts`)**:
  - Convierte entre coordenadas esféricas `(azimut, elevación, distancia)` y posición cartesiana 3D `(x, y, z)`.
- **Esfera Widget Interactiva (`LightGizmo.vue`)**:
  - Widget interactivo que muestra una esfera 3D/vectorial con el punto de luz proyectado sobre la superficie.
  - Permite arrastrar el puntero sobre la esfera para orientar el vector de luz al instante.
- **Panel de Control de Luz (`LightControlPanel.vue`)**:
  - Panel flotante colapsable con sliders para ajustar Azimut (0°-360°), Elevación (-80° a 80°), Distancia (1 a 15), Intensidad (0 a 100) y Color/Temperatura HEX.

```
src/
├── components/
│   ├── LightControlPanel.vue             # [NUEVO] Panel lateral/flotante con sliders
│   ├── LightGizmo.vue                    # [NUEVO] Widget de esfera interactiva de luz
│   ├── SceneCanvas.vue                   # [MODIFICAR] Integrar raycasting y selección
│   └── ShapeSelector.vue
├── composables/
│   ├── useLightingState.ts               # [NUEVO] Estado reactivo de luz y conversión esférica
│   ├── useSelectionState.ts              # [NUEVO] Estado reactivo del elemento seleccionado
│   └── useShapeState.ts
├── three/
│   ├── controls/
│   │   ├── ObjectRotationController.ts
│   │   └── SelectionController.ts        # [NUEVO] Raycaster y renderizado de outline de selección
│   ├── core/
│   │   └── SceneManager.ts               # [MODIFICAR] Exponer selección y actualización de luz
│   └── entities/
│       ├── Lights.ts                     # [MODIFICAR] Métodos para actualización de parámetros y helper
│       └── Shapes.ts                     # [MODIFICAR] Exponer mesh activo para raycasting y outline
└── types/
    └── scene.ts                          # [MODIFICAR] Tipos de selección y parámetros de luz
```

## Archivos a Crear
| Archivo | Propósito |
|---------|-----------|
| `src/composables/useSelectionState.ts` | Estado reactivo del elemento seleccionado ('shape' \| 'light' \| null) |
| `src/composables/useLightingState.ts` | Estado reactivo de la luz (azimut, elevación, distancia, intensidad, color) |
| `src/three/controls/SelectionController.ts` | Raycaster para selección por clic y manejo visual de outline |
| `src/components/LightGizmo.vue` | Esfera widget interactiva para orientación visual de la luz |
| `src/components/LightControlPanel.vue` | Panel de sliders de precisión para iluminación |

## Archivos a Modificar
| Archivo | Cambio |
|---------|--------|
| `src/three/types/scene.ts` | Añadir tipos `SelectableTarget`, `SphericalLightCoords` |
| `src/three/entities/Lights.ts` | Añadir métodos de actualización de coordenadas esféricas, color e intensidad |
| `src/three/entities/Shapes.ts` | Exponer `getMesh()` para raycaster |
| `src/three/core/SceneManager.ts` | Integrar `SelectionController` y métodos de sincronización |
| `src/components/SceneCanvas.vue` | Conectar controladores y listeners de selección |
| `src/App.vue` | Incorporar `LightGizmo.vue` y `LightControlPanel.vue` en el overlay |

## Interfaces / Tipos Clave
```typescript
export type SelectableTarget = 'shape' | 'light' | null;

export interface SphericalLightState {
  azimuth: number;    // 0 a 360 grados
  elevation: number;  // -80 a 80 grados
  distance: number;   // 1 a 15 unidades
  intensity: number;  // 0 a 100
  color: string;      // Formato Hex '#ffffff'
}
```

## Decisiones de Diseño
- **Coordenadas Esféricas Naturales para Artistas**: El artista piensa en términos de *luz desde la izquierda/derecha* (Azimut) y *luz alta/cenital o rasante* (Elevación), en lugar de manipular valores arbitrarios X/Y/Z en matrices.
- **Selection Outline Limpio**:
  - Para el objeto: Indicador de contorno perimetral en color de acento (#6366f1) que se ajusta a la forma activa.
  - Para la luz: Anillo/halo brillante alrededor de la esferita de la luz con color de foco (#f59e0b).
- **Esfera Gizmo Desacoplada**: El widget de la esfera se renderiza en un canvas 2D/3D optimizado dentro de Vue, manteniendo un rendimiento ultra ligero sin sobrecargar la escena principal.

## Estrategia de Verificación
- Clicar sobre el objeto o sobre la luz en el canvas: el elemento debe seleccionarse y mostrar su contorno.
- Mover los sliders de azimut/elevación: la luz debe orbitar suavemente alrededor del objeto y proyectar la sombra correspondiente.
- Arrastrar en la esfera widget: la dirección de la luz debe actualizarse en tiempo real reflejando el movimiento del puntero.

## Riesgos Técnicos
- Colisión de eventos de arrastre entre la rotación del objeto y la selección por clic (mitigado discriminando entre clic simple y arrastre por umbral de movimiento de píxeles).
