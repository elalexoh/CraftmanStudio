# Especificación: 004 - Grillas de Perspectiva en Suelo y Objeto (Structure Overlay)

**Estado**: Borrador  
**Fecha**: 2026-08-26  

## Problema / Motivación
Para los ilustradores y artistas, comprender la perspectiva, las líneas de fuga en el plano del suelo y la topología espacial de la forma tridimensional (sección transversal, curvatura y orientación de los planos) es indispensable mientras se analiza la luz y las sombras. Las herramientas existentes solo muestran superficies lisas sin referencias de perspectiva ni guías de contorno estructural.

## Objetivo
Incorporar una cuadrícula de perspectiva sobre el plano del suelo que coexista con las sombras proyectadas y una capa superpuesta (*overlay*) de líneas estructurales / wireframe sutil sobre los objetos 3D, ambas activadas por defecto, con botones de toggle independientes en la UI y control de opacidad ajustable.

## Usuarios Afectados
- Ilustradores y dibujantes que estudian el volumen, la curvatura y la perspectiva cónica de las figuras geométricas.

## Requisitos Funcionales
- **RF-01 (Grilla de Perspectiva del Suelo)**:
  - Cuadrícula de suelo con divisiones principales y secundarias en el nivel `y = -1.5`.
  - Debe integrarse sobre el plano de suelo sin interferir con la recepción de sombras proyectadas (*cast shadows*).
- **RF-02 (Overlay de Líneas Estructurales en Objetos)**:
  - Superposición de líneas de contorno y aristas topológicas (*wireframe overlay*) sobre las 6 formas (esfera, cubo, cilindro, cono, toroide y Asaro Head).
  - Las líneas deben ser semitransparentes y nítidas, permitiendo ver el volumen sombreado por debajo.
- **RF-03 (Toggles Independientes en UI)**:
  - Botón toggle para activar/desactivar la Grilla del Suelo.
  - Botón toggle para activar/desactivar el Wireframe del Objeto.
- **RF-04 (Control de Opacidad)**:
  - Posibilidad de ajustar la intensidad/opacidad de las líneas estructurales del objeto (0% a 100%) para calibrar entre máxima visibilidad de guías o máxima limpieza de sombreado.
- **RF-05 (Estado Inicial)**:
  - Ambas grillas inician activas por defecto (Suelo: ON, Objeto: ON con opacidad calibrada al ~35%).

## Requisitos No Funcionales
- **RNF-01 (Performance)**: Mantener 60 FPS estables sin renderizar geometrías redundantes ni causar parpadeo de profundidad (*Z-fighting*).
- **RNF-02 (Consistencia Estética)**: Líneas en color de contraste neutro y sutil con `depthTest: true` y `polygonOffset` para evitar artefactos visuales.

## User Stories
- **Como ilustrador**, quiero ver la grilla del suelo para entender los puntos de fuga y la grilla sobre la esfera para dibujar correctamente los elipses de sección transversal y la línea del terminador.

## Criterios de Aceptación
- [ ] Al cargar la app, la grilla del suelo y el wireframe de la figura se muestran activos.
- [ ] Al alternar entre formas del catálogo, el wireframe se adapta instantáneamente a la nueva geometría.
- [ ] Los toggles en la UI activan/desactivan cada grilla de forma independiente.
- [ ] El slider de opacidad ajusta la sutileza de las líneas sobre el objeto en tiempo real.

## Fuera de Alcance
- Modificación de la escala o tamaño de las celdas de la grilla del suelo en tiempo de ejecución.
