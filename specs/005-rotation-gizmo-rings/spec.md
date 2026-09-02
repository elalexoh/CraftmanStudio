# Especificación: 005 - Anillos Gizmo 3D de Rotación (Estilo Blender)

**Estado**: Borrador  
**Fecha**: 2026-08-26  

## Problema / Motivación
El arrastre libre en 2D sobre la pantalla dificulta aislar giros en un solo eje, provocando inclinaciones involuntarias y dificultando colocar el objeto en vistas y planos específicos (como vista frontal pura, 3/4 o perfil). Los artistas e ilustradores requieren un manipulador visual intuitivo de rotación en 3 ejes (*Rotation Gizmo Rings*) estándar en software 3D como Blender.

## Objetivo
Implementar anillos de rotación 3D (*Rotation Gizmo Rings*) interactivos alrededor del objeto seleccionado, con codificación de color por eje (Rojo = X, Verde = Y, Azul = Z), detección de arrastre por raycasting sobre cada anillo, interacción de giro aislada por eje y botón de reseteo de rotación rápida a (0°, 0°, 0°).

## Usuarios Afectados
- Ilustradores que necesitan calibrar con precisión la orientación espacial y el ángulo de visión de las figuras geométricas y la Asaro Head.

## Requisitos Funcionales
- **RF-01 (Anillos Axiales 3D)**:
  - 🟢 **Anillo Verde (Eje Y)**: Rotación horizontal pura (Yaw / Turntable).
  - 🔴 **Anillo Rojo (Eje X)**: Inclinación frontal / posterior (Pitch).
  - 🔵 **Anillo Azul (Eje Z)**: Inclinación lateral (Roll).
- **RF-02 (Activación Contextual)**:
  - Los anillos gizmo se muestran en el centro del objeto cuando este está seleccionado (`selectedTarget === 'shape'`).
  - Se ocultan automáticamente cuando se selecciona la luz o se deselecciona el objeto.
- **RF-03 (Interacción por Raycasting & Hover Highlight)**:
  - Al pasar el cursor sobre un anillo, este se ilumina (*hover highlight* con mayor grosor/brillo).
  - Al hacer clic y arrastrar sobre un anillo, la rotación queda bloqueada estrictamente a ese eje.
- **RF-04 (Arrastre en Espacio Vacío)**:
  - Hacer clic y arrastrar sobre el fondo del canvas sin tocar los anillos mantiene un giro horizontal suave (Turntable Y) con inercia.
- **RF-05 (Botón de Reseteo)**:
  - Botón "Reset Rotación" en la interfaz para regresar la figura a (0, 0, 0) con un solo clic.

## Requisitos No Funcionales
- **RNF-01 (Performance)**: Mantener 60 FPS estables con cálculo de rotaciones y render loop eficiente.
- **RNF-02 (Estética Limpia)**: Anillos semitransparentes que no tapen las sombras ni el volumen del objeto, con mayor opacidad al interactuar.

## User Stories
- **Como ilustrador**, quiero arrastrar el anillo verde para girar la Asaro Head horizontalmente sin que se incline la cabeza hacia abajo, para ver cómo cambia la luz en los planos de la nariz y los pómulos.

## Criterios de Aceptación
- [ ] Los 3 anillos de rotación (Rojo, Verde, Azul) aparecen centrados en la figura cuando está seleccionada.
- [ ] Al arrastrar un anillo específico, el objeto gira exclusivamente en ese eje.
- [ ] El botón de resetear rotación restablece los ángulos a 0.
- [ ] Al seleccionar la luz, los anillos se ocultan de forma limpia.

## Fuera de Alcance
- Gizmo de escala / redimensionamiento.
- Gizmo de traslación del objeto fuera del centro del escenario.
