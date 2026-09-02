# Tareas: 001 - Project Scaffolding y Canvas Reactivo 3D

**Plan base**: plan.md  
**Fecha**: 2026-08-25  
**Estado general**: [x] Completo  

---

## Fase 1: Setup del Proyecto & Tooling

- [x] **TASK-01**: Crear archivos base de configuración (`package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`).
  - Archivo: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
  - Criterio: Archivos creados con scripts de build/dev y alias `@/` configurados.
  - Dependencias: ninguna

- [x] **TASK-02**: Instalar dependencias del proyecto vía npm.
  - Comando: `npm install`
  - Criterio: Carpeta `node_modules` y `package-lock.json` generados sin errores de compatibilidad.
  - Dependencias: TASK-01

---

## Fase 2: Estilos SCSS & Tipos Base

- [x] **TASK-03**: Configurar sistema de estilos modular SCSS.
  - Archivo: `src/styles/_variables.scss`, `src/styles/_reset.scss`, `src/styles/main.scss`
  - Criterio: Estilos base para viewport completo (sin scrollbars), paleta oscura para ilustradores y tipografía cargados.
  - Dependencias: TASK-02

- [x] **TASK-04**: Definir interfaces y tipos para Three.js y SceneManager.
  - Archivo: `src/three/types/scene.ts`
  - Criterio: Interfaces `SceneManagerOptions`, `ISceneEntity`, `LightConfig` tipadas estrictamente.
  - Dependencias: TASK-02

---

## Fase 3: Motor Three.js & Entidades Base

- [x] **TASK-05**: Implementar entidades 3D base (Suelo, Luz puntual inicial, Geometría neutra de prueba).
  - Archivo: `src/three/entities/Ground.ts`, `src/three/entities/Lights.ts`, `src/three/entities/Shapes.ts`
  - Criterio: Suelo con recepción de sombras, luz puntual con emisión de sombras y esfera neutra mate.
  - Dependencias: TASK-04

- [x] **TASK-06**: Implementar `SceneManager.ts` con ciclo de vida, render loop y resize handler.
  - Archivo: `src/three/core/SceneManager.ts`
  - Criterio: Inicialización de WebGLRenderer, PCFSoftShadowMap, Scene, Camera, loop 60 FPS y método `dispose()`.
  - Dependencias: TASK-05

---

## Fase 4: Componentes Vue & Integración UI

- [x] **TASK-07**: Crear componente Vue `SceneCanvas.vue`.
  - Archivo: `src/components/SceneCanvas.vue`
  - Criterio: Canvas montado en `onMounted` y liberado en `onUnmounted` a pantalla completa.
  - Dependencias: TASK-06

- [x] **TASK-08**: Integrar layout principal en `App.vue` y bootstrapping en `main.ts`.
  - Archivo: `src/App.vue`, `src/main.ts`
  - Criterio: App monta `SceneCanvas.vue`, importa `main.scss` y muestra un header/badge mínimo de estado con Lucide Icon.
  - Dependencias: TASK-03, TASK-07

---

## Fase 5: Verificación & Typecheck

- [x] **TASK-09**: Validar compilación TypeScript y ejecución local.
  - Comando: `npm run build`
  - Criterio: Cero errores de tipos y bundle generado con éxito en `dist/`.
  - Dependencias: TASK-08

---

## Resumen
- Total tareas: 9
- Estimación: 1 sesión de trabajo continuo
