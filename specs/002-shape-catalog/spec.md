# Especificación: 002 - Catálogo de Formas y Asaro Head

**Estado**: Borrador  
**Fecha**: 2026-08-25  

## Problema / Motivación
Los ilustradores necesitan estudiar el comportamiento de la luz y el gradiente de sombras en diferentes tipos de superficies: curvas continuas (esfera, toroide), caras planas y aristas (cubo), transiciones cónicas/cilíndricas (cono, cilindro) y geometrías anatómicas angulares simplificadas (Asaro Head) para comprender la estructura de retratos.

## Objetivo
Implementar un catálogo interactivo de formas 3D con un selector flotante en la interfaz web, permitiendo al usuario cambiar de figura con un solo clic, interactuar rotando el objeto directamente con el ratón/touch y asegurando que todas las formas descansen apoyadas en el plano del suelo con sombra proyectada.

## Usuarios Afectados
- Ilustradores y artistas 2D/3D que estudian volumen y valores tonales sobre diferentes topologías geométricas.

## Requisitos Funcionales
- **RF-01 (Catálogo de Formas)**: Soportar 6 geometrías para estudio:
  1. **Esfera**: Estudio de gradientes continuos y punto especular.
  2. **Cubo**: Estudio de planos duros y valores contrastantes entre caras.
  3. **Cilindro**: Estudio de gradientes cilíndricos horizontales y caras planas en tapas.
  4. **Cono**: Estudio de gradientes cónicos que convergen en vértice.
  5. **Toroide (Dona)**: Estudio de sombras arrojadas sobre la propia geometría y concavidades.
  6. **Asaro Head (Low-Poly)**: Estudio de los planos anatómicos de la cabeza y el rostro.
- **RF-02 (Alineación con el Suelo)**: Cada objeto debe calcular su altura y apoyar su base automáticamente sobre el plano del suelo (`y = -1.5`) para proyectar sombras de contacto realistas.
- **RF-03 (Rotación Interactiva del Objeto)**: Permitir al usuario hacer clic/touch y arrastrar sobre el canvas para rotar el objeto sobre sus ejes (rotación libre en X e Y) con desaceleración / inercia suave.
- **RF-04 (Botonera Flotante)**: Barra de herramientas flotante en la interfaz con iconos representativos para cada forma, indicando visualmente cuál está activa.
- **RF-05 (Transición Limpia)**: Al cambiar de forma, liberar la memoria de la geometría previa (`dispose`) y montar la nueva sin parpadeos ni fugas de memoria.

## Requisitos No Funcionales
- **RNF-01 (Performance)**: Mantener 60 FPS estables durante la interacción de rotación del objeto.
- **RNF-02 (Material Consistente)**: Todas las figuras compartirán el material neutro mate calibrado para estudio de luz.
- **RNF-03 (Responsive & Touch)**: Soporte fluido tanto para eventos de ratón (*mouse drag*) como para pantallas táctiles (*touch drag*).

## User Stories
- **Como ilustrador**, quiero hacer clic en el botón de "Cilindro" o "Asaro Head" para cambiar la figura y rotarla con el ratón, observando cómo cambia la luz en los distintos planos.

## Criterios de Aceptación
- [ ] La botonera flotante muestra los 6 iconos de las formas disponibles.
- [ ] Al seleccionar cualquier forma, la escena 3D cambia la malla activa de forma instantánea.
- [ ] Todas las formas se apoyan tangencialmente sobre el suelo.
- [ ] El usuario puede rotar el objeto arrastrando con el ratón/touch.
- [ ] La Asaro Head muestra claramente los planos del rostro (frente, nariz, pómulos, mandíbula).

## Fuera de Alcance
- Modificación de propiedades del material (color o rugosidad).
- Importación de modelos 3D externos (.obj / .gltf del usuario).
