# Plan de Implementación: 001 - Project Scaffolding y Canvas Reactivo 3D

**Basado en**: specs/001-project-scaffolding/spec.md  
**Fecha**: 2026-08-25  

## Stack y Herramientas
- **Framework & Build**: Vite + Vue 3 (Composition API, `<script setup>`) + TypeScript.
- **Motor 3D**: `three` (^0.170.0+) y `@types/three`.
- **Estilos**: `sass` (SCSS) con variables y temas base en `src/styles/`.
- **Iconografía**: `lucide-vue-next`.
- **Gestor de Paquetes**: `npm`.

## Arquitectura
Se implementa el patrón **Engine Facade / Manager** para Three.js:
- La capa de Three.js está completamente aislada en `src/three/` sin dependencias de Vue.
- `SceneManager.ts` encapsula el `WebGLRenderer`, `Scene`, `PerspectiveCamera`, sombras (*PCFSoftShadowMap*), resize listener y el loop de render (`requestAnimationFrame`).
- El componente `SceneCanvas.vue` actúa únicamente como puente de ciclo de vida (inicializa `SceneManager` en `onMounted` sobre el `<canvas>` y destruye recursos en `onUnmounted`).

```
src/
├── assets/
├── components/
│   └── SceneCanvas.vue          # Componente Vue contenedor del canvas 3D
├── styles/
│   ├── _variables.scss          # Variables SCSS de colores y espaciado
│   ├── _reset.scss              # Reset CSS
│   └── main.scss                # Entrada global de estilos
├── three/
│   ├── core/
│   │   └── SceneManager.ts      # Motor desacoplado Three.js (renderer, loop, cámara, resize)
│   └── entities/
│       ├── Ground.ts            # Plano de suelo receptor de sombras
│       ├── Lights.ts            # Luz puntual de prueba + luz ambiental suave
│       └── Shapes.ts            # Geometría de validación (esfera/cubo)
├── App.vue                      # Layout raíz
└── main.ts                      # Entrada de la aplicación Vue
```

## Archivos a Crear
| Archivo | Propósito |
|---------|-----------|
| `package.json` | Definición de dependencias, scripts de build y desarrollo |
| `vite.config.ts` | Configuración de Vite con plugins de Vue y resolución de alias `@` |
| `tsconfig.json` | Configuración estricta de TypeScript |
| `tsconfig.node.json` | Configuración TypeScript para archivos de configuración |
| `index.html` | Entrada HTML de la SPA con viewport optimizado |
| `src/main.ts` | Inicialización de la app Vue |
| `src/App.vue` | Componente raíz con el viewport y contenedor de controles |
| `src/styles/_variables.scss` | Paleta de colores dark/neutral para ilustradores |
| `src/styles/_reset.scss` | Resets de layout y full-height viewport |
| `src/styles/main.scss` | Importador principal de estilos |
| `src/three/core/SceneManager.ts` | Facade principal del motor 3D, sombras y ciclo de vida |
| `src/three/entities/Ground.ts` | Creación del plano de suelo que recibe sombras |
| `src/three/entities/Lights.ts` | Configuración de la luz puntual y ambiental básica |
| `src/three/entities/Shapes.ts` | Geometría de prueba neutra |
| `src/components/SceneCanvas.vue` | Componente Vue que monta y desmonta el canvas 3D |

## Archivos a Modificar
| Archivo | Cambio |
|---------|--------|
| Ninguno | Proyecto nuevo desde cero |

## Interfaces / Tipos Clave
```typescript
export interface SceneManagerOptions {
  canvas: HTMLCanvasElement;
  antialias?: boolean;
}

export interface ISceneEntity {
  init(scene: THREE.Scene): void;
  update?(delta: number): void;
  dispose(): void;
}
```

## Decisiones de Diseño
- **Material Neutro Mate**: La geometría de validación usará `MeshStandardMaterial` con `roughness: 0.8` y color neutro (#d0d0d0) para una lectura clara de luces y sombras sin brillo excesivo.
- **Shadow Mapping**: Se habilita `THREE.PCFSoftShadowMap` en el renderizador para sombras suaves y realistas adecuadas para el estudio de iluminación.
- **Manejo de Memoria**: `SceneManager` implementa un método `dispose()` explícito para liberar geometrías, materiales y el renderizador WebGL al desmontar el componente.

## Estrategia de Verificación
- **Typecheck & Build**: Ejecutar `npm run build` o `npx vue-tsc --noEmit` para asegurar cero errores de tipos.
- **Validación Visual**: Cargar la aplicación con `npm run dev` y comprobar en el navegador:
  1. Renderizado a pantalla completa sin barras de scroll accidentales.
  2. Presencia de la geometría y sombra arrojada en el suelo.
  3. Redimensionamiento fluido de la ventana.

## Riesgos Técnicos
- Fugas de contexto WebGL si no se limpian adecuadamente los listeners y animaciones en desmontaje (mitigado con patrón `dispose()` en `SceneManager`).
