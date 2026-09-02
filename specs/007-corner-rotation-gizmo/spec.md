# Especificación: 007 - Gizmo de Rotación en Esquina Inferior Derecha (Viewport Navigation Gizmo)

**Estado**: Borrador  
**Fecha**: 2026-08-26  

## Problema / Motivación
Tener los anillos de rotación 3D superpuestos directamente sobre el objeto en el centro de la escena causaba distracción y obstruía el análisis visual de las sombras, los valores tonales y los planos anatómicos de la Asaro Head y demás geometrías. Mover el manipulador de rotación a una esquina de la pantalla (como el *Viewport Navigation Gizmo* de Blender) mantiene el objeto principal 100% limpio y despejado.

## Objetivo
1. Remover los anillos de rotación superpuestos sobre el objeto central.
2. Crear un **Widget de Rotación Interactivo en la esquina inferior derecha (Bottom-Right)** con una mini esfera/cubo de orientación 3D y anillos/ejes de coordenadas (Rojo X, Verde Y, Azul Z).
3. Sincronizar bidireccionalmente la rotación en tiempo real entre el widget de esquina y la figura principal.
4. Mantener la rotación por arrastre libre con inercia sobre el canvas central.

## Usuarios Afectados
- Ilustradores que necesitan observar la figura con máxima pureza visual sin elementos gráficos superpuestos, pero manteniendo control total de orientación espacial.

## Requisitos Funcionales
- **RF-01 (Limpieza de la Escena Central)**:
  - La figura central se renderiza sin anillos ni mallas de gizmo superpuestas sobre su superficie.
- **RF-02 (Widget de Orientación en Esquina Inferior Derecha)**:
  - Componente flotante `RotationGizmoWidget.vue` ubicado en la esquina inferior derecha.
  - Renderiza una mini figura 3D (cubo / esfera de navegación) con los 3 ejes de coordenadas:
    - 🔴 **Eje X (Rojo)**: Arrastre para cabeceo / rotación en X.
    - 🟢 **Eje Y (Verde)**: Arrastre para giro horizontal / rotación en Y.
    - 🔵 **Eje Z (Azul)**: Arrastre para inclinación lateral / rotación en Z.
- **RF-03 (Sincronización en Tiempo Real)**:
  - Cuando el usuario rota el objeto en el canvas central, la mini figura de la esquina replica exactamente la orientación en tiempo real.
  - Cuando el usuario arrastra los ejes o la mini figura de la esquina, el objeto central rota de inmediato.
- **RF-04 (Vistas Rápidas por Clic en Ejes)**:
  - Hacer clic en los extremos de los ejes X, Y o Z orienta suavemente el objeto hacia esa vista ortogonal/canónica (Frontal, Perfil, Cenital).

## Requisitos No Funcionales
- **RNF-01 (Estética y Diseño)**: Panel de vidrio *glassmorphism* compacto, no intrusivo y elegante.
- **RNF-02 (Rendimiento)**: 60 FPS estables sincronizados con el bucle principal de Three.js.

## Criterios de Aceptación
- [ ] La figura en el centro queda completamente libre de anillos superpuestos.
- [ ] El widget en la esquina inferior derecha muestra la orientación 3D y los 3 ejes de color.
- [ ] Arrastrar en el canvas rota la figura central y actualiza el widget en tiempo real.
- [ ] Arrastrar en el widget rota la figura central de forma precisa en el eje seleccionado.

## Fuera de Alcance
- Gizmo de traslación del objeto.
