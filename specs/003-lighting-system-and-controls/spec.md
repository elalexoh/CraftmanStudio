# Especificación: 003 - Sistema de Iluminación y Selección Interactiva (Estilo Blender)

**Estado**: Borrador  
**Fecha**: 2026-08-26  

## Problema / Motivación
En herramientas existentes de referencia para ilustradores, cambiar la posición y dirección de la luz es rígido e impreciso. Los ilustradores necesitan una experiencia intuitiva, similar a los estándares de software 3D como Blender: poder seleccionar directamente la luz o el objeto, ver qué elemento está activo con un indicador visual claro (borde / *outline highlight*) y manipular su posición e inclinación mediante una esfera interactiva, sliders numéricos precisos o arrastre directo.

## Objetivo
Implementar un sistema de selección e iluminación interactivo estilo Blender para 1 fuente de luz y el objeto en escena, con detección de selección por clic (con borde/highlight), manipulación mediante esfera widget interactiva, sliders de intensidad/color/posición y transformación fluida.

## Usuarios Afectados
- Ilustradores y dibujantes que necesitan ubicar la luz y el objeto con exactitud para sus referencias de valor y sombras.

## Requisitos Funcionales
- **RF-01 (Selección Directa y Outline)**:
  - Hacer clic sobre el objeto 3D o sobre la fuente de luz en el canvas selecciona dicho elemento.
  - El elemento seleccionado muestra un borde/contorno visual (*selection outline/highlight*) visible y distintivo.
  - La UI refleja claramente qué elemento está seleccionado (Luz u Objeto).
- **RF-02 (Esfera Widget Interactiva de Luz)**:
  - Widget interactivo en pantalla (esfera/domo) que muestra en tiempo real la orientación del vector de luz.
  - El usuario puede hacer clic y arrastrar directamente sobre la esfera widget para apuntar la luz desde cualquier ángulo (azimut y elevación).
- **RF-03 (Manipulación de Posición estilo Blender)**:
  - Cuando la luz está seleccionada: poder cambiar su posición en el espacio 3D (azimut, elevación, distancia/altura y posición libre con arrastre).
  - Cuando el objeto está seleccionado: poder rotarlo y recolocarlo.
- **RF-04 (Panel de Parámetros de Luz)**:
  - Sliders para:
    - **Azimut** (0° a 360°): Rotación horizontal alrededor del objeto.
    - **Elevación** (-80° a 80°): Inclinación vertical (luz cenital, rasante, baja).
    - **Distancia / Radio**: Qué tan cerca o lejos está la luz.
    - **Intensidad**: Brillo de la luz (0 a 100).
    - **Color / Temperatura**: Selector de color o presets cálido/neutro/frío.
- **RF-05 (Sincronización Bidireccional)**:
  - Mover la luz mediante la esfera widget, arrastrar en el canvas o mover los sliders mantiene todos los controles sincronizados instantáneamente.

## Requisitos No Funcionales
- **RNF-01 (Performance)**: Mantener 60 FPS estables durante la manipulación y cálculo dinámico de sombras suaves (*PCFSoftShadowMap*).
- **RNF-02 (Arquitectura Limpia)**: Separar el estado de selección (`useSelectionState`) y de iluminación (`useLightingState`) del motor Three.js.
- **RNF-03 (No Obstructivo)**: El panel de controles de luz debe ser colapsable o plegable para no tapar el área de estudio del artista.

## User Stories
- **Como ilustrador**, quiero hacer clic en la luz, ver su borde de selección y arrastrar la esfera widget para colocar una luz rasante lateral y estudiar el borde del terminador en la esfera.

## Criterios de Aceptación
- [ ] Hacer clic en el objeto o en la luz los selecciona y muestra un borde/highlight distintivo.
- [ ] La esfera widget interactiva refleja y modifica la posición de la luz en tiempo real.
- [ ] Los sliders de azimut, elevación, distancia, intensidad y color actualizan la escena inmediatamente.
- [ ] Las sombras proyectadas en el suelo responden con total suavidad a la nueva posición de la luz.

## Fuera de Alcance
- Múltiples luces simultáneas (acotado a 1 luz activa por ahora según directriz del usuario).
- Presets predefinidos de iluminación (para fases posteriores).

## Dependencias / Riesgos
- Configuración de Raycasting en Three.js con soporte para eventos touch y mouse.
