# Constitución del Proyecto: 3D Shading Reference Web

## Identidad del Proyecto
- **Nombre**: 3D Shading Reference Web (Herramienta de estudio de iluminación para artistas)
- **Descripción**: Aplicación web PWA ligera e interactiva para que ilustradores y artistas estudien valores tonales, iluminación, sombras y formas 3D básicas en tiempo real desde cualquier navegador, sin instalación.
- **Stack tecnológico principal**: Vue 3 (Composition API / `<script setup>`), Three.js, Vite, SCSS, Lucide Icons (`lucide-vue-next`), Vite PWA Plugin (soporte offline 100% client-side).

## Principios de Arquitectura
- **100% Client-Side & Zero-Backend**: Todo el renderizado y estado reside en el cliente. Desplegable estáticamente (Vercel, GitHub Pages, Netlify).
- **Separación de Responsabilidades**:
  - `Renderer / Engine 3D`: Módulo Three.js desacoplado de la UI reactiva de Vue.
  - `State Management`: Estado reactivo simple con Vue Reactivity (`ref`/`reactive` o Pinia liviano) para sincronizar luces, mallas, filtros y configuración.
  - `UI Layer`: Componentes Vue minimalistas y no invasivos para maximizar el área de canvas 3D.
- **Anti-patrones a evitar**:
  - Manipular Three.js directamente dentro del template o acoplar fuertemente la lógica de render al ciclo de vida de los componentes Vue.
  - Bloquear el hilo principal con cálculos pesados durante el loop de animación (`requestAnimationFrame`).

## Estándares de Código
- **Lenguaje & Tipado**: TypeScript / JavaScript moderno (ESNext), Vue 3 `<script setup>`.
- **Estructura de Directorios**:
  - `src/components/`: UI de controles (luces, primitivas, filtros, gizmos).
  - `src/three/`: Configuración del escenario, luces, geometrías (incluida Asaro Head), sombras y shaders/filtros.
  - `src/composables/` o `src/stores/`: Control de estado (iluminación, viewport, modos de visualización).
  - `src/assets/`: Recursos estáticos y geometrías precalculadas.
- **Naming Conventions**: PascalCase para componentes Vue (`LightControl.vue`), camelCase para funciones y composables (`useLighting.ts`).

## Experiencia de Usuario & Requisitos Funcionales
- **Escenario Base**: Inicializa con un objeto básico (ej. esfera), suelo receptor de sombras y 1 luz puntual por defecto.
- **Sistema de Luces Extensible**:
  - Posibilidad de agregar N luces (puntuales, direccionales/sol, ambientales) con color e intensidad individuales.
  - 3 métodos de interacción: Gizmo 3D en pantalla, atajos de teclado + ratón, y sliders numéricos (azimut, elevación, intensidad, color).
- **Catálogo de Formas**: Esfera, Cubo, Cono/Pirámide, Cilindro, Toroide y Cabeza de Planos (Asaro Head).
- **Herramientas de Estudio de Valor**:
  - Modo Escala de Grises (tonal values).
  - Modo Cel-shading / Posterización (bandas de color para lectura de terminador y sombras).
- **UI Minimalista**: Interfaz oculta o replegable para dibujar/hacer capturas sin distracciones.

## Requisitos de Performance & PWA
- **60 FPS estables**: Escenas y geometrías optimizadas para fluidez en cualquier hardware.
- **PWA & Offline First**: Service Worker configurado con caché de recursos para funcionar sin internet una vez cargada la web.
- **Bundle Size**: Carga inicial rápida (< 1MB gzipped excluyendo geometrías).

## Flujo de Trabajo (SDD)
- Todo desarrollo se rige por la metodología Spec-Driven Development (SDD):
  1. Especificación (`spec.md`).
  2. Planificación técnica (`plan.md`).
  3. Desglose de tareas (`tasks.md`).
  4. Implementación controlada paso a paso (`speckit-implement`).
