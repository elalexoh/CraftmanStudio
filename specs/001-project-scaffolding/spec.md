# Especificación: 001 - Project Scaffolding y Canvas Reactivo 3D

**Estado**: Borrador  
**Fecha**: 2026-08-25  

## Problema / Motivación
Para iniciar el desarrollo de la herramienta de referencia de iluminación 3D para ilustradores, se requiere un entorno de desarrollo moderno, estructurado, fuertemente tipado y de alto rendimiento. Necesitamos la base de la aplicación configurada con Vue 3, Vite, TypeScript, soporte para estilos modulares en SCSS, iconos listos para la interfaz y un ciclo de vida desacoplado para Three.js.

## Objetivo
Inicializar la estructura del proyecto web con Vite, Vue 3, TypeScript, SCSS, Lucide Icons y Three.js, dejando un lienzo (*canvas*) reactivo mínimo en ejecución con render loop, manejo de resize de ventana, y una escena básica de validación (esfera/cubo y luz puntual con sombra).

## Usuarios Afectados
- Ilustradores y artistas visuales (usuarios finales de la aplicación).
- Desarrolladores del proyecto que implementarán los módulos de iluminación y geometrías.

## Requisitos Funcionales
- **RF-01**: Inicialización del proyecto con Vite + Vue 3 (`<script setup>`) + TypeScript.
- **RF-02**: Configuración y soporte para estilos con SCSS (variables, mixins y estructura base).
- **RF-03**: Integración de `lucide-vue-next` para la iconografía de la UI.
- **RF-04**: Integración de `three` y `@types/three` con un componente de Canvas desacoplado y reactivo (`SceneCanvas.vue`).
- **RF-05**: Escena base 3D de prueba con render loop continuo (60 FPS), cámara en perspectiva, suelo con sombras habilitadas, 1 luz puntual y 1 geometría de prueba (esfera/cubo).
- **RF-06**: Adaptabilidad responsiva del canvas ante redimensionamiento de la ventana (*resize handler*).

## Requisitos No Funcionales
- **RNF-01 (Performance)**: Render loop eficiente con Three.js sin fugas de memoria (*cleanup* en `onUnmounted`).
- **RNF-02 (Arquitectura Limpia)**: Lógica 3D encapsulada en composables/módulos (`src/three/`) separada del template visual de Vue.
- **RNF-03 (Gestor de Paquetes)**: Uso exclusivo de `npm` para la gestión de dependencias.

## User Stories
- **Como desarrollador/usuario**, quiero abrir la aplicación en el navegador local y ver un canvas 3D fluido a pantalla completa con una geometría iluminada para confirmar que el motor y la UI funcionan correctamente.

## Criterios de Aceptación
- [ ] El proyecto compila y se ejecuta localmente mediante `npm run dev` sin advertencias ni errores de TypeScript.
- [ ] El canvas de Three.js ocupa el viewport completo o el contenedor designado y responde a cambios de tamaño de ventana sin distorsión de aspect ratio.
- [ ] Se renderiza una malla de prueba con sombras proyectadas sobre un plano de suelo.
- [ ] La estructura de directorios sigue los estándares de la constitución (`src/components/`, `src/three/`, `src/styles/`).
- [ ] Lucide Icons y SCSS están listos para ser utilizados por los componentes de la interfaz.

## Fuera de Alcance
- Controles avanzados de múltiples luces (se implementarán en features posteriores).
- Selector de catálogo completo de mallas y Asaro Head (feature posterior).
- Modos de postprocesado como Cel-shading / Escala de grises (feature posterior).
- Configuración final de PWA offline y Service Worker (se configurará en un hito dedicado).

## Dependencias / Riesgos
- Configuración de types de Three.js en entorno TypeScript estricto.
