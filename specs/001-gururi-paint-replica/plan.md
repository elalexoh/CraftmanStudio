# Plan de Implementación: Réplica Integral de Gururi Paint (Lienzo Panorámico 360°)

**Basado en**: spec.md  
**Fecha**: 2026-09-02  
**Directorio**: `specs/001-gururi-paint-replica`

## Stack y Herramientas
- **Framework UI**: Vue 3 (Composition API, `<script setup>`, TypeScript).
- **Motor 3D**: Three.js (Esfera invertida equirectangular, raycasting UV, cámara perspectiva).
- **Iconografía**: Lucide Vue Next (`lucide-vue-next`).
- **Internacionalización (i18n)**: Módulo ligero reactivo de traducciones (`es`, `en`, `ja`).
- **Almacenamiento Local**: IndexedDB wrapper ligero (idb-keyval / nativo) para persistencia instantánea de lienzos y capas.

## Arquitectura
Seguiremos el principio de **Separación Estricta de Responsabilidades**:
1. **Three.js Core Engine (`src/three/`)**: Módulo puro de Three.js encapsulado en una clase/servicio (`PanoramicEngine`) que gestiona la escena 3D, la esfera equirectangular, la textura compuesta por canvas dinámicos, la cámara, el raycasting, la retícula de suelo y el loop de render. No contiene lógica de UI.
2. **Sistema de Pintura y Capas (`src/composables/usePainting.ts`, `src/composables/useLayers.ts`)**:
   - Cada capa tiene su propio `HTMLCanvasElement` offscreen en resolución de trabajo.
   - Canvas compuesto maestro para alimentar la textura Three.js en tiempo real.
   - Algoritmo de flood fill (bucket) con soporte continuo de costura (wrapping en x = 0 y x = width).
   - Motor de historial Undo/Redo con soporte de diferenciales/trazos.
3. **Estado Global Reactivo (`src/composables/useAppState.ts`)**: Gestiona la herramienta activa, color seleccionado, tamaño de trazo, altura de ojos, modo de visualización, visibilidad de retícula y configuración de idioma.
4. **Capa UI Vue 3 (`src/components/`)**: Componentes modulares y limpios:
   - `TopToolbar.vue`: Undo/Redo, tamaño de salida, selector de altura de ojos, toggle de retícula, i18n, guardar/cargar, previsualizar, exportar PNG y ayuda.
   - `DrawingTools.vue`: Selector de herramientas (Pluma, Goma, Bote, Cuentagotas), control de grosor y selector de color HSV (anillo de tono + caja saturación/brillo + recientes).
   - `LayerPanel.vue`: Lista de capas, añadir, eliminar, reordenar, visibilidad, opacidad y renombrado.
   - `PreviewModal.vue`: Modal 360° con deslizador de costura horizontal.
   - `HelpModal.vue`: Guía de atajos y gestos.
   - `MobileBottomTabs.vue`: Barra inferior responsiva para móviles.

## Archivos a Crear / Modificar

| Archivo | Propósito |
|---|---|
| `src/types/painting.ts` | Interfaces TypeScript: `Layer`, `Stroke`, `ToolType`, `ProjectData`, etc. |
| `src/i18n/translations.ts` | Diccionario de traducción para Español (default), Inglés y Japonés. |
| `src/composables/useI18n.ts` | Composable reactivo para traducción y cambio de idioma en caliente. |
| `src/composables/useLayers.ts` | Composable reactivo de gestión de capas y composición de texturas. |
| `src/composables/usePainting.ts` | Motor de herramientas de dibujo (pluma, goma, bucket con costura, eyedropper, undo/redo). |
| `src/composables/useProjectStorage.ts`| Guardado y carga de archivos `.gururi` / `.json` y persistencia IndexedDB. |
| `src/three/PanoramicEngine.ts` | Motor Three.js: esfera panorámica, cámara en primera persona, grid de suelo, raycaster. |
| `src/components/ColorPickerWheel.vue` | Selector de color HSV (anillo de tono exterior + caja SV interior + recientes). |
| `src/components/TopToolbar.vue` | Barra superior con controles de proyecto, tamaño, ojo, grid, exportación e i18n. |
| `src/components/DrawingTools.vue` | Barra lateral con herramientas, grosor y selector de color. |
| `src/components/LayerPanel.vue` | Panel lateral de capas (añadir, reordenar, opacidad, visibilidad, eliminar). |
| `src/components/PreviewModal.vue` | Modal de previsualización plana 2:1 con ajuste de costura horizontal. |
| `src/components/HelpModal.vue` | Modal flotante con guía de controles y atajos. |
| `src/components/MobileBottomTabs.vue` | Navegación inferior optimizada para smartphones y tablets. |
| `src/App.vue` | Orquestación principal de la interfaz y enlace con el viewport Three.js. |
| `src/styles/main.scss` | Estilos base limpios y responsivos. |

## Interfaces Clave
```typescript
export type ToolType = 'pen' | 'eraser' | 'bucket' | 'eyedropper';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export interface StrokePoint {
  x: number;
  y: number;
}

export interface ProjectData {
  version: number;
  width: number;
  height: number;
  eyeHeight: number;
  activeLayerId: string;
  layers: Array<{
    id: string;
    name: string;
    visible: boolean;
    opacity: number;
    imageDataUrl: string;
  }>;
}
```

## Decisiones de Diseño
- **Motor Three.js Desacoplado**: Usar esfera invertida con `MeshBasicMaterial` y mapa de textura (`CanvasTexture`) alimentado por el canvas compuesto offscreen para máximo rendimiento (60 FPS sin lag de UI).
- **Relleno Continuo 360°**: El algoritmo de flood fill se ejecuta sobre un búfer de píxeles unidimensional con detección de desborde horizontal para conectar automáticamente las coordenadas en el meridiano $X=0$ y $X=	ext{width}$.
- **i18n Integrado**: Sistema de traducción ultra-ligero sin dependencias pesadas, reactivo y con tipado estricto de claves.

## Estrategia de Verificación
1. **Verificación de Render y Navegación 3D**: Probar rotación con ratón (`Espacio+Drag`), gestos táctiles y ajuste de altura de ojos.
2. **Verificación de Herramientas**: Dibujar trazos continuos, verificar borrado preciso, probar relleno en los bordes de la costura 360° y muestreo de color con cuentagotas.
3. **Verificación de Capas e Historial**: Añadir capas, reordenar, alternar visibilidad, cambiar opacidad y probar Undo/Redo sucesivos.
4. **Verificación de i18n**: Conmutar entre Español, Inglés y Japonés verificando que todos los textos se actualicen instantáneamente.
5. **Verificación de Exportación / Importación**: Guardar archivo `.gururi`, recargar la página, importar el archivo y verificar que todas las capas y trazos se restablecen idénticos; exportar PNG a 2K y 4K.
