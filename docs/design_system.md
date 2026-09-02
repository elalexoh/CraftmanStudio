# 🎨 Craftsman Studio — Normas de Diseño y Usabilidad (Design System)

Para garantizar consistencia visual y coherencia en toda la suite creativa, todos los componentes (modales, barras de herramientas, botones, paneles flotantes) deben cumplir estrictamente con los siguientes estándares de diseño:

---

## 🏛️ 1. Estructura y Paleta de Componentes

### 📦 Modales y Diálogos
* **Fondo Principal del Panel**: `#ffffff` (Blanco puro de estudio).
* **Fondo del Encabezado y Pie**: `#f8fafc` con borde inferior/superior `#e2e8f0`.
* **Fondo de Bloques y Tarjetas Internas**: `#f8fafc` con borde `#e2e8f0` y radio de `8px`.
* **Backdrop (Fondo Oscuro Desenforcado)**: `rgba(15, 23, 42, 0.6)` con `backdrop-filter: blur(4px)`.
* **Borde y Sombra del Contenedor**: `border-radius: 12px;` y sombra suave `0 10px 30px rgba(0, 0, 0, 0.15)`.

---

## 🔘 2. Botones y Controles Interactivos

### ⚪ Botón Estándar / Neutro (Gris Estudio)
* **Fondo**: `#f8fafc`
* **Borde**: `1px solid #cbd5e1` (Radio `6px`)
* **Texto e Icono**: `#334155` (Slate oscuro)
* **Hover**: Fondo `#f1f5f9`, borde `#94a3b8`, texto `#0f172a`

### 🔵 Botón Primario / Activo (Azul Estudio)
* **Fondo Activo**: `#eff6ff` (Azul muy claro)
* **Borde Activo**: `#93c5fd` (Azul suave)
* **Texto e Icono Activo**: `#1d4ed8` (Azul primario legible)

### 🚀 Botón de Acción Principal (Confirmación / Primario Sólido)
* **Fondo**: `#2563eb`
* **Texto**: `#ffffff`
* **Hover**: `#1d4ed8`

---

## ✍️ 3. Jerarquía Tipográfica

* **Títulos Principales**: `#1e293b`, `font-weight: 700`.
* **Subtítulos / Secciones**: `#475569` / `#64748b`, `font-size: 11px-12px`, `font-weight: 600`.
* **Texto de Cuerpo**: `#334155`, `font-size: 12px-13px`.
* **Texto Secundario / Muted**: `#64748b`, `font-size: 11px`.

---

## 🚫 Prohibiciones Visuales
1. **NO usar fondos negros / oscuros no integrados** en modales (`#1e293b` o `#0f172a` no deben usarse como paneles cuando el resto de la app es `#ffffff`).
2. **NO usar gradientes estridentes o fluorescentes** que no pertenezcan a la paleta neutra + azul estudio.
3. **NO mezclar radios de esquinas**: `4px` para inputs pequeños, `6px` para botones, `8px` para tarjetas internas, `12px` para modales.
