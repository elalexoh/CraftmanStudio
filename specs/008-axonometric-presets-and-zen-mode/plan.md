# Plan de Implementación: Presets Axonométricos, Control Preciso de Inclinación y Modo Zen

**Basado en**: `specs/008-axonometric-presets-and-zen-mode/spec.md`  
**Fecha**: 2026-09-02  
**Feature**: `specs/008-axonometric-presets-and-zen-mode`

## Stack y Herramientas
- **Framework**: Vue 3 (Composition API / `<script setup>`, TypeScript).
- **Motor 3D**: Three.js (Cámaras, Euler rotations, Quaternions, Canvas Texture 360°).
- **Iconos**: Lucide Vue Next (`lucide-vue-next`).
- **Animación**: Interpolación suave por frame (damping / lerp en loop de render).

## Arquitectura
- **Patrón Composable & Reactive State**:
  - `useCameraPresets.ts`: Gestiona el preset activo, ángulos numéricos bidireccionales (\(yaw, pitch, roll\) en grados), bookmarks de cámara (slots 1-4) y control de snap angular.
  - `useZenMode.ts`: Gestiona el estado de inmersión Zen (`isZenMode`), listener global de `Tab` y emisión de notificaciones HUD discretas (toast temporal).
- **Integración con PanoramicEngine y SceneManager**:
  - `PanoramicEngine` implementa métodos de actualización angular precisa (`setCameraRotationDeg(yaw, pitch, roll)`), interpolación suave y snapping de 15° al orbitar con `Shift`.
  - Grillas axonométricas especializadas (isométrica, dimétrica, oblicua) generadas en shader / wireframe para superponerse con fidelidad matemática.

## Archivos a Crear
| Archivo | Propósito |
|---------|-----------|
| `src/composables/useCameraPresets.ts` | Estado reactivo de presets axonométricos, ángulos exactos, bookmarks y snap angular. |
| `src/composables/useZenMode.ts` | Control del Modo Zen (inmersión), detección de atajo `Tab` y notificaciones HUD breves. |
| `src/components/CameraPresetsPanel.vue` | Panel colapsable con selector de proyecciones, sliders e inputs numéricos en grados y slots de bookmarks. |
| `src/components/ZenHudToast.vue` | Micro-indicador HUD minimalista y no intrusivo con fade-out automático para cambios en modo Zen. |

## Archivos a Modificar
| Archivo | Cambio |
|---------|--------|
| `src/three/PanoramicEngine.ts` | Añadir control de rotación de cámara por ángulos Euler precisos, soporte de snap de 15° con `Shift` y grilla axonométrica. |
| `src/composables/useHotkeys.ts` | Añadir mapeo de tecla `Tab` para Modo Zen y teclas rápidas de bookmarks. |
| `src/components/DrawingTools.vue` / `src/components/ViewControlsToolbar.vue` | Integrar botón de acceso rápido al panel de presets/inclinación. |
| `src/App.vue` | Integrar `CameraPresetsPanel`, `ZenHudToast` y aplicar clases de visibilidad para Modo Zen. |

## Interfaces / Tipos Nuevos
```typescript
export type AxonometricPreset = 'free' | 'isometric' | 'dimetric' | 'cavalier' | 'military';

export interface CameraOrientation {
  yaw: number;       // Azimut en grados [0, 360)
  pitch: number;     // Elevación en grados [-90, +90]
  roll: number;      // Inclinación lateral en grados [-180, +180]
}

export interface CameraBookmark {
  id: number;
  label: string;
  preset: AxonometricPreset;
  orientation: CameraOrientation;
  eyeHeight?: number;
}
```

## Decisiones de Diseño
1. **Sincronización Bidireccional de Grados**: La interacción en el canvas 3D actualiza los inputs de `CameraPresetsPanel` a 60 FPS mediante `requestAnimationFrame` sin reactividad innecesaria, y los cambios en los inputs numéricos o sliders se aplican de inmediato al `PanoramicEngine`.
2. **Atajo `Tab` no invasivo**: Si el usuario está escribiendo dentro de un `HTMLInputElement` o `HTMLTextAreaElement`, el atajo `Tab` se ignora para permitir la navegación nativa de formularios. En el canvas o UI general, conmuta el Modo Zen.
3. **Modo Zen con CSS Transition**: En lugar de destruir componentes Vue, se utiliza una clase contenedora `.zen-mode-active` con `opacity: 0` y `pointer-events: none` y transición suave de 200ms para garantizar transiciones fluidas y sin pérdida de estado.
4. **Interpolación Suave (Lerp/Slerp)**: Al seleccionar un preset (ej. Isométrica), la cámara transiciona suavemente hacia la orientación objetivo en vez de un salto brusco.

## Estrategia de Testing y Verificación
- Verificación manual en navegador de cada preset (Isométrica, Dimétrica, Caballera, Militar, Modo Libre).
- Prueba de inputs numéricos y sliders de Yaw/Pitch/Roll y su sincronización bidireccional.
- Verificación del atajo `Tab` (Modo Zen) y toast discreto.
- Comprobación de que no haya errores de compilación (`npm run build`).

## Riesgos Técnicos
- **Gimbal Lock en polos**: Controlado limitando el pitch a \([-89.9^\circ, +89.9^\circ]\) en modo esférico o mediante Quaternions.
