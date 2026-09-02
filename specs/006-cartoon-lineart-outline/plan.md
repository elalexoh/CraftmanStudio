# Plan de Implementación: 006 - Lineart Cartoon Blanco y Asaro Head Anatómica

**Basado en**: specs/006-cartoon-lineart-outline/spec.md  
**Fecha**: 2026-08-26  

## Stack y Herramientas
- **Three.js**: `BufferGeometry`, `EdgesGeometry`, `LineSegments`, `LineBasicMaterial`, `MeshBasicMaterial` con `THREE.BackSide` (Técnica de casco invertido / Inverted Hull) para silueta continua.
- **Vue 3**: Composition API, composable `useGridState.ts` (actualizado a `useLineartState` o adaptado).
- **Iconos**: `lucide-vue-next` (`PenTool`, `Grid`, `RotateCcw`, `SlidersHorizontal`).
- **Estilos**: SCSS modular.

## Arquitectura
- **Nueva Geometría Anatómica Asaro Head (`AsaroHeadGeometry.ts`)**:
  - Modelo con más de 120 facetas anatómicas precisas:
    - Bóveda craneal y plano temporal.
    - Frente dividida en planos central y laterales.
    - Cuencas oculares con profundidad y arco superciliar.
    - Nariz facetada completa (puente, planos laterales, punta facetada y alas).
    - Pómulos (plano frontal, lateral y fosa subcigomática).
    - Labios facetados (filtrum, 3 planos de labio superior, 2 de labio inferior).
    - Mentón poligonal y ángulo mandibular marcado.
    - Cuello con bloques anatómicos base.
- **Sistema de Lineart Blanco Cartoon (`Shapes.ts`)**:
  - **1. Aristas de Planos (`EdgesGeometry`)**: Extrae únicamente aristas con ángulo de separación > 24° (cubo con 12 aristas, tapas de cilindros, vértices de conos y todas las facetas de la Asaro Head), eliminando el 100% de diagonales de triangulación interna.
  - **2. Silueta Exterior Cartoon (`Inverted Hull Outline`)**: Malla perimetral con `THREE.BackSide` y color blanco `#ffffff` que genera un contorno exterior continuo y orgánico para esferas, toroides y siluetas curvas desde cualquier ángulo de cámara.
  - **3. Material de Línea**: `LineBasicMaterial` en blanco puro (`#ffffff`) con control de opacidad y `depthTest: true`.
- **UI & Composable (`ViewControlsToolbar.vue` & `useGridState.ts`)**:
  - Renombrar control a **"Lineart Blanco"** con icono de pluma (`PenTool`) y control de opacidad (calibrado al 85% por defecto).

```
src/
├── components/
│   ├── ViewControlsToolbar.vue           # [MODIFICAR] Actualizar a "Lineart Blanco"
│   └── SceneCanvas.vue                   # [MODIFICAR] Sincronizar lineart
├── composables/
│   └── useGridState.ts                   # [MODIFICAR] Renombrar/adaptar a showLineart
├── three/
│   ├── entities/
│   │   └── Shapes.ts                     # [MODIFICAR] Implementar EdgesGeometry + Inverted Hull blanco
│   └── geometries/
│       └── AsaroHeadGeometry.ts          # [REESCRIBIR] Topología anatómica completa y rica
```

## Archivos a Crear
| Archivo | Propósito |
|---------|-----------|
| Ninguno | Modificación de archivos existentes |

## Archivos a Modificar
| Archivo | Cambio |
|---------|--------|
| `src/three/geometries/AsaroHeadGeometry.ts` | Construcción poligonal anatómica completa de la cabeza con planos estándar de Bell/Asaro |
| `src/three/entities/Shapes.ts` | Reemplazar WireframeGeometry por EdgesGeometry + Silueta Backside en color blanco |
| `src/composables/useGridState.ts` | Actualizar estado a `showLineart` y opacidad por defecto a `0.85` |
| `src/components/ViewControlsToolbar.vue` | Reemplazar botón por "Lineart Blanco" con icono `PenTool` |

## Interfaces / Tipos Clave
```typescript
export interface LineartSettings {
  showGroundGrid: boolean;
  showLineart: boolean;
  lineartOpacity: number; // 0.0 a 1.0 (default 0.85)
}
```

## Decisiones de Diseño
- **Eliminación Total de Diagonales**: `EdgesGeometry(geometry, 24)` garantiza que las caras planas de cubos o cilindros no muestren líneas diagonales de triangulación interna, manteniendo una estética de dibujo 2D/3D limpia.
- **Tinta Blanca de Alto Contraste**: Color blanco puro `#ffffff` sobre el tema oscuro para máxima legibilidad artística de las aristas.

## Estrategia de Verificación
- Cargar la Asaro Head: deben verse todos los planos anatómicos de la cara y el cráneo con sombreado plano y aristas blancas nítidas.
- Probar Esfera, Cubo y Cilindro: solo deben tener su contorno exterior y aristas reales, sin ninguna grilla de malla interna.
- Activar/desactivar y ajustar opacidad con el botón "Lineart Blanco".

## Riesgos Técnicos
- Complejidad en la topología de la Asaro Head (mitigado con un mapeo simétrico indexado de vértices y caras anatómicas).
