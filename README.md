# 🎨 Craftsman Studio

**Craftsman Studio** es una suite creativa web moderna de grado profesional para ilustración 2D, dibujo panorámico equirectangular 360° en tiempo real y estudio de sombreado / referencia anatómica 3D.

---

## 🚀 Características Principales

### 🌐 1. Lienzo Panorámico 360° Equirectangular en Tiempo Real
* **Motor 3D Nativo (Three.js)**: Dibuja directamente sobre la esfera equirectangular 360° en tiempo real con proyección matemática sin distorsiones.
* **Resolución Completa y Múltiples Capas**: Soporte para resoluciones de 2048px, 4096px y 8192px con sistema completo de capas (opacidad, visibilidad, reordenamiento).
* **Previsualización Panorámica 360°**: Visualizador interactivo 360° con ajuste de costura (`Seam Offset`) y exportación instantánea en formato PNG de alta fidelidad.

### 📐 2. Reglas Guía Asistidas para 360°
* **Regla Vertical**: Bloqueo de azimut y longitud para dibujar columnas, paredes y estructuras verticales puras.
* **Regla Horizontal**: Proyección continua que sigue la curvatura esférica de latitud para techos, suelos y líneas de horizonte.
* **Regla Radial (Perspectiva)**: Guías de perspectiva hacia puntos de fuga centrales.
* **Guías Visuales 3D**: Renderizado en cian luminoso proyectado en el espacio 3D.

### 🪢 3. Lazo de Selección Libre y Máscaras
* **Selección Vectorial en 3D**: Contorno libre de alto contraste (negro y cian neón) con relleno translúcido dinámico.
* **Máscara de Recorte**: Limita el área de pintura, borrado y rellenado estrictamente a la selección.
* **Inversión y Edición Rápida**: Atajos `Ctrl + D` (Deseleccionar), `Ctrl + Shift + I` (Invertir) y `Supr` (Limpiar selección con soporte completo para `Ctrl + Z`).

### 💡 4. Estudio de Referencia y Sombreado 3D
* **Catálogo Anatómico y Primitivas**: Cabeza Asaro, Maniquí Anatómico, Esferas, Cilindros y Formas Geométricas.
* **Iluminación Personalizable**: Posición de luz direccional, luz de relleno, intensidad y color.
* **Gizmos Interactivos**: Control orbital y widgets de rotación 3D.

### ⌨️ 5. Ergonomía y Atajos de Teclado (Estilo MediBang / Clip Studio)
* **Atajos Totalmente Personalizables**: Modal de configuración para reasignar cualquier comando con detección en vivo y persistencia local.
* **Ajuste Dinámico de Pincel**: Mantén `Ctrl + Alt` y arrastra el ratón horizontalmente con feedback visual circular y numérico en tiempo real.
* **Cuentagotas Continuo**: Mantén `Alt` para muestreo de color en vivo sobre el lienzo.

---

## 🛠️ Stack Tecnológico
* **Framework**: [Vue 3](https://vuejs.org/) + Composition API & `<script setup>`
* **Motor 3D**: [Three.js](https://threejs.org/)
* **Tipado**: [TypeScript](https://www.typescriptlang.org/)
* **Iconos**: [Lucide Vue Next](https://lucide.dev/)
* **Estilos**: SCSS modular
* **Empaquetador**: [Vite](https://vitejs.dev/)

---

## 📦 Instalación y Desarrollo

```bash
# 1. Clonar el repositorio
git clone git@github.com:elalexoh/CraftmanStudio.git
cd CraftmanStudio

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Compilar para producción
npm run build
```

---

## 👨‍💻 Desarrollador
Creado y desarrollado por **Deeply Oku**.
* 🌐 [👺 Portafolio Web](https://deeply-portfolio.netlify.app/)
* 💼 Desarrollador Full-Stack, Arquitectura Web & 3D Interactivo.

---

## 🙏 Agradecimientos & Inspiración
El módulo de dibujo panorámico 360° de Craftsman Studio está inspirado en la excelente herramienta web [**ぐるりペイント (Gururi Paint)**](https://tools.neco-sara.com/tools/gururi-paint/) creada por [neco-sara](https://tools.neco-sara.com/).

---

## 📄 Licencia
Este proyecto está bajo la Licencia MIT.
