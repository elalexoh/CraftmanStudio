# Contexto del Proyecto: 3D Shading Reference Web

## Resumen Ejecutivo
3D Shading Reference Web es una aplicación web interactiva y offline-first (PWA) diseñada para ilustradores y artistas visuales. Permite estudiar la iluminación, el comportamiento de las sombras y el valor tonal sobre geometrías 3D básicas (esfera, cubo, cilindro, cono, toroide y Asaro Head) en tiempo real, solucionando las limitaciones de herramientas existentes (como controles rígidos o necesidad de instalar software pesado).

## Objetivos Clave
1. **Control de Luces Versátil**: Escenario inicial con 1 luz puntual por defecto, extensible a múltiples luces (puntuales, sol/direccionales, ambientales) con manipulación mediante gizmo 3D interactivo, sliders precisos y atajos de teclado/ratón.
2. **Herramientas de Estudio de Valor**: Modos visuales de escala de grises y posterización / cel-shading para identificar terminadores y sombras de forma inmediata.
3. **Plano de Suelo**: Proyección de sombras realista con suelo toggleable.
4. **Portabilidad y Accesibilidad**: 100% estática en el cliente (Vue 3 + Vite + Three.js), ejecutable en cualquier navegador y con soporte PWA offline.

## Arquitectura y Stack
- **Framework**: Vue 3 (`<script setup>`, Composition API)
- **Motor 3D**: Three.js
- **Build Tool**: Vite + Vite PWA Plugin
- **Estilos**: Tailwind CSS (minimalista y no obstructivo)
- **Metodología**: SDD (Spec-Driven Development) con especificaciones en `.specify/`.
