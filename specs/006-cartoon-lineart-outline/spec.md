# Especificación: 006 - Lineart Cartoon Blanco y Asaro Head Anatómica Mejorada

**Estado**: Borrador  
**Fecha**: 2026-08-26  

## Problema / Motivación
La superposición anterior de wireframe triangular generaba ruido visual innecesario en las caras de los objetos en lugar de servir como referencia de dibujo. Para el ilustrador, lo valioso es un **Lineart / Contorno Cartoon limpio de color blanco** que trace el borde de silueta exterior y las aristas reales de los planos (sin diagonales triangulares internas). Además, la geometría anterior de la Asaro Head era excesivamente esquemática y requería mayor fidelidad y detalle en los planos faciales anatómicos reales (frente, pómulos, labios, cuencas, mandíbula y cráneo).

## Objetivo
1. Implementar un sistema de **Lineart Blanco Estilo Cartoon** (silueta exterior nítida + aristas estructurales reales de planos con `EdgesGeometry` y silueta de contorno) reemplazando por completo el wireframe triangular.
2. Construir una geometría de **Asaro Head completa y fiel** con la topología anatómica detallada de planos de cabeza de referencia estándar para artistas.

## Usuarios Afectados
- Ilustradores y retratistas que estudian el entintado (*lineart*), siluetas y planos anatómicos del rostro y figuras 3D.

## Requisitos Funcionales
- **RF-01 (Lineart Blanco Estilo Cartoon)**:
  - Silueta exterior nítida en todas las formas (esfera, cubo, cilindro, cono, toroide y Asaro Head) en color blanco puro (`#ffffff`) o ajustable.
  - Trazado limpio de aristas duras estructurales (sin diagonales internas triangulares) utilizando `EdgesGeometry` con ángulo de umbral calibrado (~24°).
- **RF-02 (Asaro Head Anatómica de Alta Calidad)**:
  - Nueva geometría de Asaro Head con todos los planos faciales y craneales clásicos:
    - Planos de la frente (frontal medio, eminencias frontales, crestas temporales).
    - Órbitas oculares, glabela y arco superciliar.
    - Planos de la nariz (puente, planos laterales, lóbulo nasal, alas y base inferior).
    - Complejo cigomático (pómulos frontales, laterales y arco cigomático).
    - Zona peribucal (filtrum, labio superior/inferior, volumen del mentón y comisuras).
    - Mandíbula, ángulo mandibular, plano submandibular y base del cuello.
  - Sombreado plano facetado (`flatShading: true`) para contrastes nítidos de luz en cada plano.
- **RF-03 (Controles en la UI)**:
  - Toggle en la barra de herramientas: **"Lineart Blanco"** (On/Off).
  - Control de opacidad y grosor del trazo blanco.
- **RF-04 (Eliminación de Wireframe Ruido)**:
  - Eliminar por completo el mallado de líneas triangulares flotantes.

## Requisitos No Funcionales
- **RNF-01 (Performance)**: Mantener 60 FPS estables sin Z-fighting ni caídas de fotogramas.
- **RNF-02 (Calidad Visual)**: Contorno visible con máxima nitidez sobre el fondo oscuro y la iluminación 3D.

## User Stories
- **Como ilustrador**, quiero ver la Asaro Head con planos faciales claros y un lineart blanco exterior para calcar o comprender la estructura anatómica del rostro y la sombra de terminador.

## Criterios de Aceptación
- [ ] La Asaro Head muestra la estructura completa y rica de planos faciales anatómicos.
- [ ] El trazo en todas las figuras es un lineart blanco limpio que bordea la silueta y las aristas reales sin diagonales internas.
- [ ] El botón en la UI permite encender/apagar el lineart blanco y graduar su intensidad.

## Fuera de Alcance
- Texturas de mapas de normales (mantiene geometría poligonal limpia para estudio artístico).
