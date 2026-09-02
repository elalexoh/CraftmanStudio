# Tareas: Réplica Integral de Gururi Paint (Lienzo Panorámico 360°)

**Plan base**: plan.md  
**Fecha**: 2026-09-02  
**Estado general**: [/] En progreso (Fase 4 pendiente)

---

## Fase 1: Tipos, Modelos e Internacionalización (i18n)

- [x] **TASK-01**: Definición de tipos e interfaces TypeScript para capas, trazos, herramientas, proyectos e historial.
  - Archivo: `src/types/painting.ts`
  - Criterio: Tipos completos exportados sin errores de compilación.
  - Dependencias: ninguna

- [x] **TASK-02**: Sistema de internacionalización reactivo (i18n) con soporte para Español (default), Inglés y Japonés.
  - Archivos: `src/i18n/translations.ts`, `src/composables/useI18n.ts`
  - Criterio: Función de traducción reactiva `t(key)` y selector de idioma dinámico.
  - Dependencias: TASK-01

---

## Fase 2: Motor Three.js y Lógica de Pintura

- [x] **TASK-03**: Motor Three.js panorámico 360° (`PanoramicEngine`).
  - Archivo: `src/three/PanoramicEngine.ts`
  - Criterio: Esfera invertida, textura equirectangular dinámica, control de cámara Yaw/Pitch, zoom FOV, altura de ojos, retícula de suelo y raycasting UV preciso.
  - Dependencias: TASK-01

- [x] **TASK-04**: Gestor reactivo de capas y composición de texturas.
  - Archivo: `src/composables/useLayers.ts`
  - Criterio: Creación, ordenación, visibilidad, opacidad, borrado y composición continua en canvas maestro.
  - Dependencias: TASK-01

- [x] **TASK-05**: Motor de herramientas de dibujo e historial de trazos.
  - Archivo: `src/composables/usePainting.ts`
  - Criterio: Pluma, goma con cursor 3D, flood fill con soporte de costura continua (wrap-around 360°), cuentagotas y sistema Undo/Redo.
  - Dependencias: TASK-01, TASK-04

- [x] **TASK-06**: Persistencia local (IndexedDB) y exportación/importación de proyectos y PNG.
  - Archivo: `src/composables/useProjectStorage.ts`
  - Criterio: Guardar/cargar archivos `.gururi` / `.json`, exportar PNG en 2K/4K/8K y auto-guardado en navegador.
  - Dependencias: TASK-01, TASK-04, TASK-05

---

## Fase 3: Componentes de Interfaz de Usuario (Vue 3)

- [x] **TASK-07**: Selector de color HSV circular con rueda de tono y caja SV.
  - Archivo: `src/components/ColorPickerWheel.vue`
  - Criterio: Anillo de matiz exterior, recuadro de saturación/valor interior, swatch activo y paleta de recientes.
  - Dependencias: TASK-01, TASK-02

- [x] **TASK-08**: Barra superior de herramientas (`TopToolbar`).
  - Archivo: `src/components/TopToolbar.vue`
  - Criterio: Botones Undo/Redo, selector de resolución, altura de ojos, retícula, selector i18n, guardar/cargar, previsualizar y PNG.
  - Dependencias: TASK-02, TASK-04, TASK-05, TASK-06

- [x] **TASK-09**: Barra lateral de herramientas de dibujo (`DrawingTools`).
  - Archivo: `src/components/DrawingTools.vue`
  - Criterio: Botones de herramientas, slider e inputs de grosor de pluma y selector de color integrado.
  - Dependencias: TASK-02, TASK-05, TASK-07

- [x] **TASK-10**: Panel lateral de capas (`LayerPanel`).
  - Archivo: `src/components/LayerPanel.vue`
  - Criterio: Lista de capas, drag & drop / botones de movimiento, visibilidad, control de opacidad y renombrado en línea.
  - Dependencias: TASK-02, TASK-04

- [x] **TASK-11**: Modales de previsualización 360° y ayuda.
  - Archivos: `src/components/PreviewModal.vue`, `src/components/HelpModal.vue`
  - Criterio: Vista plana equirectangular con ajuste horizontal de costura y guía de atajos/gestos traducida.
  - Dependencias: TASK-02, TASK-04

- [x] **TASK-12**: Navegación móvil y estilos globales.
  - Archivos: `src/components/MobileBottomTabs.vue`, `src/styles/main.scss`
  - Criterio: Adaptación responsiva completa para escritorio, tablet y smartphone.
  - Dependencias: TASK-02

- [x] **TASK-13**: Integración principal en `App.vue` y gestión de atajos de teclado / eventos táctiles.
  - Archivo: `src/App.vue`
  - Criterio: Coordinación de todos los componentes, atajos de teclado (`Space+Drag`, `Z+Drag`, `Ctrl+Z`, `Ctrl+Y`) y gestos multi-touch.
  - Dependencias: TASK-03 a TASK-12

---

## Fase 4: Verificación y Pruebas

- [ ] **TASK-14**: Verificación de compilación, rendimiento de renderizado y suite de pruebas manuales.
  - Criterio: `npm run build` limpio sin errores de tipos TypeScript y funcionalidad 100% operativa.
  - Dependencias: TASK-01 a TASK-13

---

## Resumen
- Total tareas: 14
- Completadas: 13
- Fases completadas: 3 de 4
- Metodología: SDD paso a paso con Token-Saver

