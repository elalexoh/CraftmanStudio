# Plan de Implementación: 002 - Catálogo de Formas y Asaro Head

**Basado en**: specs/002-shape-catalog/spec.md  
**Fecha**: 2026-08-25  

## Stack y Herramientas
- **Three.js**: `BufferGeometry`, `MeshStandardMaterial` con `flatShading: true` (para Asaro Head y planos) y sombreado suave para mallas curvas.
- **Vue 3**: Composition API (`<script setup>`), composables reactivos (`useShapeState.ts`).
- **Iconos**: `lucide-vue-next` (`Circle`, `Square`, `Cylinder`, `Triangle`, `CircleDot`, `Smile` / `User`).
- **Estilos**: SCSS modular.

## Arquitectura
- **Estado Reactivo (`useShapeState.ts`)**: Mantiene la forma seleccionada actualmente (`ShapeType`) sincronizada entre la UI y el motor Three.js.
- **Controlador de Rotación de Objeto (`ObjectRotationController.ts`)**: Captura eventos de puntero (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`) sobre el canvas y aplica rotación al contenedor del objeto con inercia/fricción en el render loop.
- **Generador de Asaro Head (`AsaroHeadGeometry.ts`)**: Geometría low-poly con planos facetados optimizada para estudio de planos anatómicos faciales y de cráneo.
- **ShapesManager (`Shapes.ts`)**: Administra el cambio dinámico de geometrías, cálculo de compensación de altura sobre el suelo y liberación de memoria (`dispose`).
- **UI (`ShapeSelector.vue`)**: Botonera flotante en vidrio (*glassmorphism*) ubicada en la parte inferior o lateral con estados visuales activos.

```
src/
├── components/
│   ├── SceneCanvas.vue
│   └── ShapeSelector.vue                 # [NUEVO] Botonera flotante de formas
├── composables/
│   └── useShapeState.ts                  # [NUEVO] Estado reactivo de forma activa
├── three/
│   ├── controls/
│   │   └── ObjectRotationController.ts   # [NUEVO] Control de arrastre e inercia del objeto
│   ├── core/
│   │   └── SceneManager.ts               # [MODIFICAR] Integrar controlador de rotación
│   ├── entities/
│   │   ├── Ground.ts
│   │   ├── Lights.ts
│   │   └── Shapes.ts                     # [MODIFICAR] Soportar catálogo y cálculo de base
│   └── geometries/
│       └── AsaroHeadGeometry.ts          # [NUEVO] Geometría anatómica de planos faciales
└── types/
    └── scene.ts                          # [MODIFICAR] Tipos de formas disponibles
```

## Archivos a Crear
| Archivo | Propósito |
|---------|-----------|
| `src/composables/useShapeState.ts` | Composable reactivo para comunicar la UI con Three.js |
| `src/three/geometries/AsaroHeadGeometry.ts` | Geometría de cabeza con planos anatómicos facetados |
| `src/three/controls/ObjectRotationController.ts` | Manejo de rotación con ratón/touch con inercia |
| `src/components/ShapeSelector.vue` | Barra de herramientas flotante para selección de formas |

## Archivos a Modificar
| Archivo | Cambio |
|---------|--------|
| `src/three/types/scene.ts` | Añadir tipos `ShapeType = 'sphere' \| 'cube' \| 'cylinder' \| 'cone' \| 'torus' \| 'asaro'` |
| `src/three/entities/Shapes.ts` | Extender para soportar catálogo de geometrías y alineación con el suelo |
| `src/three/core/SceneManager.ts` | Integrar rotación del objeto y método para cambiar de forma |
| `src/components/SceneCanvas.vue` | Conectar `useShapeState` con `SceneManager` |
| `src/App.vue` | Incorporar `ShapeSelector.vue` en el overlay |

## Interfaces / Tipos Clave
```typescript
export type ShapeType = 'sphere' | 'cube' | 'cylinder' | 'cone' | 'torus' | 'asaro';

export interface ShapeDefinition {
  id: ShapeType;
  label: string;
  icon: any;
  description: string;
}
```

## Decisiones de Diseño
- **Alineación con el Suelo**: Cada geometría se traslada verticalmente según su `boundingBox` para que su punto más bajo coincida exactamente con la posición `y = -1.5` del suelo, garantizando contacto visual natural.
- **Inercia de Rotación**: El controlador de rotación acumula velocidad angular durante el arrastre y aplica amortiguación (`damping = 0.92`) para una sensación de rotación suave y precisa.
- **Planos Asaro Head**: Para la Asaro Head se usará `flatShading: true` para que los planos poligonales de frente, nariz y mejillas reflejen la luz con aristas nítidas tal como se requiere para estudio de dibujo.

## Estrategia de Verificación
- Comprobar que al hacer clic en cada botón de la botonera la forma cambia inmediatamente.
- Comprobar que al arrastrar en cualquier dirección la forma gira sobre sí misma y no se desplaza la cámara.
- Comprobar que las 6 formas descansan sobre el plano del suelo y proyectan sombra continua.

## Riesgos Técnicos
- Discrepancias de escala entre primitivas y la Asaro Head (mitigado normalizando el bounding box a una altura estándar de ~2.4 unidades).
