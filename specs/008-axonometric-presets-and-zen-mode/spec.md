# Especificación: Presets Axonométricos, Control Preciso de Inclinación y Modo Zen

**Estado**: Borrador  
**Fecha**: 2026-09-02  
**Feature**: `specs/008-axonometric-presets-and-zen-mode`

## Problema / Motivación
Los ilustradores y artistas técnicos necesitan proyectar y estudiar iluminación y formas bajo convenciones de perspectiva axonométrica estandarizadas (Isométrica, Dimétrica, Caballera, Militar) con grillas guía que coincidan exactamente con sus ángulos de fuga/proyección. Asimismo, se requiere ajuste milimétrico y por grados en la orientación de cámara sin perder fluidez visual, y un modo inmersivo ("Modo Zen") que despeje la pantalla al 100% para dibujar o evaluar la obra sin distracciones de la interfaz.

## Objetivo
Proporcionar un sistema completo de proyecciones e inclinaciones axonométricas preconfiguradas, un modo libre con control por gizmo e inputs numéricos colapsables de alta precisión (con snap opcional a 15°/45° y bookmarks de cámara), grillas axonométricas adaptables y un Modo Zen activable mediante `Tab` que oculte toda la UI.

## Usuarios Afectados
- Ilustradores, artistas de concepto y dibujantes técnicos que utilizan el visor 3D y el lienzo 360°/perspectiva.

## Requisitos Funcionales
- **RF-01 (Presets Axonométricos)**:
  - Botones de selección rápida para proyecciones estándar:
    - **Isométrica** (rotación Y: 45°, elevación/pitch: ~35.264° / \( \arctan(1/\sqrt{2}) \)).
    - **Dimétrica** (proporción simétrica dimétrica estándar).
    - **Caballera** (eje frontal ortogonal, ángulo oblicuo a 45°).
    - **Militar / Planométrica** (planta superior a 45°/45°, proyección cenital oblicua).
    - **Modo Libre** (órbita esférica y rotación continua sin restricciones).
- **RF-02 (Grilla Axonométrica Adaptable)**:
  - Visualización y toggle de grilla de guías alineada con la proyección activa (isométrica, oblicua o cartesiana standard).
- **RF-03 (Control Preciso de Inclinación en Modo Libre)**:
  - Panel colapsable con controles numéricos (inputs y sliders) para rotación precisa en grados:
    - Azimut / Yaw (\(0^\circ\) a \(360^\circ\)).
    - Elevación / Pitch (\(-90^\circ\) a \(+90^\circ\)).
    - Inclinación / Roll (\(-180^\circ\) a \(+180^\circ\)).
  - Soporte de gizmo visual de orientación (interactivo por ejes o esferas de rotación).
  - Bloqueo/Snap de giro a incrementos de 15° al mantener pulsada la tecla `Shift`.
- **RF-04 (Camera Bookmarks / Slots Rápidos)**:
  - Capacidad de guardar y recuperar vistas rápidas de cámara favoritas mediante atajos o mini-botones.
- **RF-05 (Modo Zen / Inmersivo)**:
  - Toggle mediante la tecla `Tab` que oculta instantáneamente toda la interfaz flotante (barras de herramientas, paneles de dibujo, selectores de formas, controles de luz), dejando únicamente el lienzo.
  - Al pulsar `Tab` nuevamente, la interfaz se restaura a su estado previo exacto.
  - Micro-indicador HUD temporal (toast/badge discreto con fade-out) si se cambia de herramienta o pincel vía atajos de teclado mientras se está en Modo Zen.

## Requisitos No Funcionales
- **RNF-01 (Performance & 60 FPS)**: Las transiciones de cámara y proyecciones deben interpolarse suavemente (lerp/slerp o Tween) manteniendo 60 FPS sin tirones.
- **RNF-02 (Arquitectura Limpia y Desacoplada)**: Sincronización mediante composables reactivos (`useCameraPresets.ts` / `useZenMode.ts`), sin ensuciar el loop de Three.js.
- **RNF-03 (Compatibilidad de Entrada)**: El atajo `Tab` debe evitar el blur accidental en inputs de texto cuando no se esté editando un campo numérico.

## User Stories
- **US-01**: Como ilustrador, quiero cambiar instantáneamente a vista isométrica o militar con un clic para tener la referencia exacta de dibujo técnico.
- **US-02**: Como artista, quiero escribir exactamente "30° de elevación y 45° de azimut" en un panel colapsable para replicar ángulos de luz y cámara exactos de un storyboard.
- **US-03**: Como dibujante, quiero presionar `Tab` para ocultar todos los paneles y concentrarme al 100% en el lienzo con mi tableta gráfica.

## Criterios de Aceptación
- [ ] Presets Isométrica, Dimétrica, Caballera, Militar y Modo Libre funcionales e intercambiables con 1 clic.
- [ ] Grilla axonométrica que se actualiza o activa según la proyección seleccionada.
- [ ] Panel colapsable con inputs numéricos bidireccionales (cambiar el input mueve la cámara; rotar la cámara actualiza los inputs en tiempo real).
- [ ] Atajo `Tab` conmuta el Modo Zen ocultando/mostrando toda la UI.
- [ ] Orbitado con `Shift` realiza snap en incrementos angulares de 15°.
- [ ] Sin regresiones en el sistema de dibujo ortogonal, luces ni controles 3D existentes.

## Fuera de Alcance
- Modificación del pipeline de shaders PBR del motor 3D principal.
- Exportador de modelos 3D a formatos CAD externos (STEP/IGES).

## Dependencias / Riesgos
- Configuración de cámara ortográfica vs perspectiva en Three.js al conmutar entre proyecciones axonométricas y modo libre estándar.
