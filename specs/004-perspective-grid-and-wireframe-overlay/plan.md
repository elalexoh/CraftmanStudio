# Plan de Implementación: 004 - Grillas de Perspectiva en Suelo y Objeto

**Basado en**: specs/004-perspective-grid-and-wireframe-overlay/spec.md  
**Fecha**: 2026-08-26  

## Stack y Herramientas
- **Three.js**: `GridHelper`, `WireframeGeometry` / `EdgesGeometry`, `LineSegments`, `LineBasicMaterial` con transparencia y `polygonOffset`.
- **Vue 3**: Composition API, composable reactivo (`useGridState.ts`).
- **Iconos**: `lucide-vue-next` (`Grid`, `Boxes`, `Layers`, `Eye`, `EyeOff`).
- **Estilos**: SCSS modular.

## Arquitectura
- **Grilla de Suelo (`Ground.ts`)**:
  - Se añade un `THREE.GridHelper` de 30x30 divisiones en `y = -1.498` con colores sutiles de cuadrícula (eje principal #4f46e5 / #3f3f46 y líneas secundarias #27272a) sobre el plano receptor de sombras.
- **Overlay de Estructura de Objeto (`Shapes.ts`)**:
  - `ShapesManager` genera un `THREE.LineSegments` a partir de `THREE.WireframeGeometry` de la forma activa.
  - Usa `LineBasicMaterial` con `transparent: true`, `opacity: 0.35` y color #818cf8 / #a1a1aa.
  - Para evitar z-fighting, los materiales de malla base configuran `polygonOffset: true`, `polygonOffsetFactor: 1`, `polygonOffsetUnits: 1`.
- **Estado Reactivo (`useGridState.ts`)**:
  - Controla `showGroundGrid` (boolean, default `true`), `showObjectWireframe` (boolean, default `true`) y `wireframeOpacity` (number, default `0.35`).
- **Barra de Herramientas de Vista (`ViewControlsToolbar.vue`)**:
  - Componente flotante minimalista con botones toggle para la grilla de suelo y wireframe de objeto, además de un slider compacto de opacidad.

```
src/
├── components/
│   ├── ViewControlsToolbar.vue           # [NUEVO] Botonera flotante de controles de visualización
│   ├── SceneCanvas.vue                   # [MODIFICAR] Conectar useGridState con SceneManager
│   └── App.vue                           # [MODIFICAR] Montar ViewControlsToolbar
├── composables/
│   └── useGridState.ts                   # [NUEVO] Estado reactivo para grillas y wireframe
├── three/
│   ├── core/
│   │   └── SceneManager.ts               # [MODIFICAR] Métodos para conmutar grilla y wireframe
│   └── entities/
│       ├── Ground.ts                     # [MODIFICAR] Añadir GridHelper integrado
│       └── Shapes.ts                     # [MODIFICAR] Añadir capa de LineSegments / Wireframe
└── types/
    └── scene.ts                          # [MODIFICAR] Tipos de configuración de grillas
```

## Archivos a Crear
| Archivo | Propósito |
|---------|-----------|
| `src/composables/useGridState.ts` | Estado reactivo de grilla de suelo, wireframe y opacidad |
| `src/components/ViewControlsToolbar.vue` | Barra de herramientas con toggles y slider de opacidad |

## Archivos a Modificar
| Archivo | Cambio |
|---------|--------|
| `src/three/entities/Ground.ts` | Integrar `GridHelper` con toggle `setGridVisible()` |
| `src/three/entities/Shapes.ts` | Integrar `LineSegments` wireframe overlay, `setWireframeVisible()` y `setWireframeOpacity()` |
| `src/three/core/SceneManager.ts` | Exponer métodos delegados hacia `Ground` y `Shapes` |
| `src/components/SceneCanvas.vue` | Sincronizar reactivamente `useGridState` con `SceneManager` |
| `src/App.vue` | Posicionar `ViewControlsToolbar.vue` en el overlay |

## Interfaces / Tipos Clave
```typescript
export interface GridSettings {
  showGroundGrid: boolean;
  showObjectWireframe: boolean;
  wireframeOpacity: number; // 0.0 a 1.0
}
```

## Decisiones de Diseño
- **Prevención de Z-Fighting**: Se utiliza `polygonOffset` en los materiales de malla para desplazar el búfer de profundidad hacia atrás respecto a las líneas de wireframe, garantizando contornos nítidos sin parpadeos ni cortes.
- **Wireframe Dinámico**: Cada vez que el usuario selecciona una nueva forma (ej. pasar de Esfera a Toroide o Asaro Head), el `ShapesManager` regenera instantáneamente el `WireframeGeometry` correspondiente.

## Estrategia de Verificación
- Cargar la app: la grilla del suelo y el wireframe de la esfera deben estar visibles de inmediato.
- Cambiar entre las 6 formas: el wireframe debe cambiar correctamente en cada forma.
- Probar los botones de toggle: la grilla del suelo y el wireframe del objeto deben encender/apagar de forma instantánea e independiente.
- Mover el slider de opacidad: el wireframe debe hacerse más suave o más marcado en tiempo real.

## Riesgos Técnicos
- Densidad poligonal excesiva en wireframe (mitigado usando resoluciones geométricas optimizadas para estudio).
