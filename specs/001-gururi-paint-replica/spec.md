# Especificación: Réplica Integral de Gururi Paint (Lienzo Panorámico 360°) con i18n y Persistencia

**Estado**: Aprobado  
**Fecha**: 2026-09-02  
**Directorio**: `specs/001-gururi-paint-replica`

## Problema / Motivación
Artistas conceptuales, ilustradores de fondos y animadores necesitan crear bocetos y referencias panorámicas equirectangulares de 360° de forma ágil directamente en el navegador, sin depender de software pesado de modelado 3D. Las herramientas existentes como Gururi Paint ofrecen una gran experiencia pero carecen de soporte multilenguaje (solo japonés), persistencia automática ante cierres accidentales y robustez en la importación de proyectos.

## Objetivo
Replicar fielmente el 100% del comportamiento, herramientas de dibujo e interacciones 3D de Gururi Paint, incorporando un sistema de internacionalización (i18n) completo (Español por defecto, Inglés y Japonés), persistencia automática de sesión en el navegador y compatibilidad garantizada con archivos de proyecto `.gururi` y exportación PNG en alta resolución.

## Usuarios Afectados
- Ilustradores y dibujantes de fondos (Background Artists) que diseñan escenarios 360°.
- Artistas conceptuales y de storyboard que componen perspectivas esféricas inmersivas.
- Desarrolladores de videojuegos y creadores de contenido VR/skyboxes.

## Requisitos Funcionales

- **RF-01 (Entorno 3D y Navegación Esférica)**:
  - Renderizado inmersivo en Three.js proyectando las capas de dibujo sobre una esfera invertida equirectangular.
  - Rotación libre de cámara (Yaw y Pitch) mediante `Espacio + Arrastre` en escritorio o arrastre con 2 dedos en dispositivos táctiles.
  - Zoom de campo de visión (FOV) mediante `Z + Arrastre vertical` en escritorio o gesto de pellizco (*pinch*) en dispositivos táctiles.
  - Control de altura de ojos (*Eye Height*) ajustable entre 0.5 m y 30 m con botones de paso `+` / `−`, slider interactivo y campo numérico directo.
  - Guía visual de suelo con retícula (*Ground Grid*) y horizonte activable/desactivable mediante toggle.

- **RF-02 (Herramientas de Dibujo e Interacción)**:
  - **Pluma (Pen)**: Trazo suave en tiempo real mediante raycasting sobre la esfera con mapeo UV equirectangular.
  - **Goma (Eraser)**: Borrado sobre la capa activa con cursor interactivo que indica el radio exacto de borrado en el espacio 3D.
  - **Bote de Pintura (Flood Fill / Bucket)**: Relleno de áreas contiguas con algoritmo de expansión que maneja automáticamente la costura horizontal (wrap-around 360° sin discontinuidades).
  - **Cuentagotas (Eyedropper)**: Muestreo preciso del color compuesto o de la capa activa bajo el cursor.
  - **Ajuste de Grosor**: Tamaño de trazo configurable de 1 a 50 px con slider, botones incrementales `+` / `−` e input numérico.

- **RF-03 (Selector de Color Avanzado)**:
  - Selector de color circular con anillo exterior de tono (Hue) y recuadro central de saturación y brillo (SV Box).
  - Indicador visual del color activo (*Color Swatch*).
  - Historial de colores recientes utilizados (almacenamiento dinámico de las últimas muestras).
  - Soporte de fallback con selector nativo de color.

- **RF-04 (Gestor de Capas)**:
  - Creación, duplicación y eliminación de capas.
  - Reordenación de capas hacia arriba (`↑`), hacia abajo (`↓`) y mediante arrastrar y soltar (*drag & drop*).
  - Visibilidad individual por capa (toggle Mostrar / Ocultar) y control de opacidad (0% a 100%).
  - Renombrado de capas en línea (doble clic / pulsación prolongada).
  - Composición en tiempo real de todas las capas activas sobre la textura de Three.js.

- **RF-05 (Historial y Deshacer/Rehacer)**:
  - Sistema de Undo (`Ctrl + Z` / Botón) y Redo (`Ctrl + Y` / Botón).
  - Gestión eficiente de memoria y rendimiento registrando diferenciales/trazos por bloques (tiles o stroke diffs) para evitar sobrecarga de RAM.

- **RF-06 (Previsualización 360° y Ajuste de Costura)**:
  - Modal/Panel de vista previa plana equirectangular (relación de aspecto 2:1).
  - Marcador de costura (*Seam Handle*) deslizable horizontalmente para rotar el punto de unión y corte de la imagen 360°.

- **RF-07 (Exportación e Importación de Proyectos y Gráficos)**:
  - Exportación de imagen final en formato PNG con selector de resolución: `2048 × 1024`, `4096 × 2048` (predeterminada) y `8192 × 4096`.
  - Guardado de proyecto en archivo `.gururi` / `.json` incluyendo capas, opacidades, nombres, trazos y metadatos de cámara.
  - Carga e importación validada de archivos `.gururi` y `.json` con reconstrucción inmediata de capas y canvas.

- **RF-08 (Internacionalización - i18n)**:
  - Soporte completo y conmutable en caliente para 3 idiomas: **Español** (predeterminado), **Inglés** y **Japonés**.
  - Traducción de todos los botones, tooltips, paneles de ayuda, modales y etiquetas.
  - Selector accesible de idioma en la barra de herramientas superior / menú de ajustes.

- **RF-09 (Soporte Móvil y Responsivo)**:
  - Barra de navegación inferior móvil con pestañas: `Dibujo`, `Capas` y `Ajustes`.
  - Adaptación de modales de color y menús contextuales para interacción táctil fluida.
  - Gestos táctiles diferenciados (1 dedo dibuja, 2 dedos rotan, pellizco hace zoom).

- **RF-10 (Persistencia Local Automática)**:
  - Guardado automático en `IndexedDB` / `localStorage` del estado del proyecto para restaurar automáticamente la sesión tras recargar la página.

- **RF-11 (Panel de Ayuda y Accesibilidad)**:
  - Modal de ayuda con guía visual de atajos de teclado y gestos táctiles.

## Requisitos No Funcionales
- **RNF-01 (Rendimiento)**: 60 FPS estables durante el trazo de dibujo y la rotación orbital 3D en navegadores modernos.
- **RNF-02 (Arquitectura 100% Cliente)**: Cero backend; ejecución autónoma, compatible con modo PWA y despliegue estático.
- **RNF-03 (Modularidad y Tipado)**: Implementación en Vue 3 (Composition API / `<script setup>`), TypeScript estricto y Three.js desacoplado.
- **RNF-04 (Compatibilidad)**: Compatible con Chrome, Edge, Safari, Firefox y navegadores móviles en iOS/Android.

## User Stories
1. **Como artista conceptual**, quiero rotar mi vista esférica con gestos intuitivos y dibujar con pluma y goma para componer un escenario panorámico natural sin distorsiones.
2. **Como ilustrador**, quiero rellenar áreas contiguas con el bote de pintura asegurando que no queden cortes visibles en la costura de 360°.
3. **Como usuario hispanohablante/angloparlante**, quiero seleccionar mi idioma preferido (Español/Inglés/Japonés) para comprender todos los controles y atajos.
4. **Como creador de contenido**, quiero exportar mi ilustración en formato PNG a resolución 4K/8K para usarla directamente como textura de entorno en Unreal Engine, Blender o Unity.
5. **Como usuario móvil**, quiero usar gestos táctiles naturales (1 dedo pintar, 2 dedos rotar) y acceder a paneles optimizados para dibujar cómodamente en mi tablet o smartphone.

## Criterios de Aceptación
- [ ] La esfera 3D permite navegación en 360° con rotación (`Espacio + Drag` / 2 dedos) y zoom FOV (`Z + Drag` / pellizco).
- [ ] Las 4 herramientas básicas (Pluma, Goma, Bote de pintura con wrap continuo, Cuentagotas) funcionan con precisión milimétrica sobre las capas.
- [ ] El selector de color HSV (anillo + recuadro) actualiza el color activo y registra colores recientes.
- [ ] El gestor de capas permite añadir, eliminar, reordenar (incluyendo drag & drop), renombrar, cambiar opacidad y ocultar capas.
- [ ] Deshacer (`Ctrl+Z`) y Rehacer (`Ctrl+Y`) revierten y restauran trazos y acciones correctamente.
- [ ] El panel de previsualización 2:1 muestra la imagen plana y permite ajustar el desplazamiento de la costura.
- [ ] La exportación a PNG genera resoluciones 2K, 4K y 8K según la elección del usuario.
- [ ] El guardado y carga de archivos `.gururi` preserva íntegramente las capas y dibujos.
- [ ] El selector de idiomas permite alternar entre Español (default), Inglés y Japonés en tiempo real.
- [ ] La sesión se guarda y recupera automáticamente en el almacenamiento local.

## Fuera de Alcance
- Iluminación dinámica compleja o shaders PBR (el enfoque es el lienzo de pintura y referencia panorámica equirectangular).
- Modelado de mallas 3D personalizadas dentro del lienzo (se centra en la proyección de la esfera de dibujo y la retícula guía).

## Dependencias / Riesgos
- **Rendimiento en 8K**: La generación y manipulación de texturas de `8192 × 4096` en dispositivos con GPU integrada puede requerir optimización de renderizado offscreen / Canvas 2D asíncrono.
- **Precisión del Raycasting en los polos**: El mapeo UV en los polos superior e inferior de la esfera requiere compensación trigonométrica para evitar artefactos de estiramiento al dibujar.
