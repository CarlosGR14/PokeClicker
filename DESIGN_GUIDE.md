# Guía de Estilos Visual

## Pokeclicker

**Elaborado por**: Carlos González Rodríguez  
**Fecha de elaboración**: Mayo 2026  
**Versión del documento**: 1.0  
**Última actualización**: 19 de Mayo de 2026

---

## ÍNDICE

1. [Introducción](#introducción)
2. [Temas: Claro y Oscuro](#temas-claro-y-oscuro)
3. [Paleta de Colores](#paleta-de-colores)
4. [Tipografía](#tipografía)
5. [Logos y Branding](#logos-y-branding)
6. [Iconografía](#iconografía)
7. [Estructura y Layout](#estructura-y-layout)

---

## 1. Introducción

La presente guía de estilos visuales establece los estándares gráficos y de diseño para la aplicación **Pokeclicker**. Esta guía asegura coherencia visual, identidad de marca consistente y una experiencia de usuario uniforme en todos los elementos de la interfaz.

La aplicación soporta dos temas: **Claro (Light)** y **Oscuro (Dark)**, con una paleta de colores adaptada para cada uno.

---

## 2. Temas: Claro y Oscuro

### 2.1 Tema Claro (Light)

El tema claro es la interfaz por defecto y proporciona máximo contraste y legibilidad durante el día.

**Características:**

- Fondo: Blanco o gris muy claro
- Texto principal: Gris oscuro (Gray-900)
- Elementos: Colores vibrantes y saturados
- Contraste: Alto (WCAG AAA)

**CSS:**

```css
@media (prefers-color-scheme: light) {
  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #f9fafb;
    --text-primary: #111827;
    --text-secondary: #6b7280;
  }
}
```

### 2.2 Tema Oscuro (Dark)

El tema oscuro reduce la fatiga visual en ambientes con poca luz.

**Características:**

- Fondo: Gris muy oscuro o negro
- Texto principal: Gris muy claro (Gray-50)
- Elementos: Colores desaturados
- Contraste: Optimizado para lectura en oscuridad

**CSS:**

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
  }
}
```

### 2.3 Aplicación de Temas

Los temas se aplican automáticamente según la preferencia del sistema operativo del usuario, o pueden ser seleccionados manualmente en configuración:

```css
/* Almacenar preferencia de tema */
html[data-theme="light"] {
  /* estilos light */
}
html[data-theme="dark"] {
  /* estilos dark */
}
html[data-theme="system"] {
  /* usar prefers-color-scheme */
}
```

---

## 3. Paleta de Colores

### 3.1 Colores Primarios

#### Color Principal: Púrpura Degradado

- **Nombre**: Púrpura Pokeclicker
- **Hex**: `#667eea` → `#764ba2`
- **RGB**: (102, 126, 234) → (118, 75, 162)
- **Uso**: Headers, botones principales, acciones destacadas
- **Aplicación**: Gradiente diagonal de izquierda a derecha

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

#### Color Secundario: Rosa/Magenta

- **Nombre**: Rosa Claro
- **Hex**: `#f093fb`
- **RGB**: (240, 147, 251)
- **Uso**: Acentos, hover states, elementos secundarios
- **Aplicación**: Complemento del gradiente principal

### 3.2 Colores de Rarezas

Los colores de rarezas se aplican a componentes de items y Pokémon según su rareza:

#### Común

- **Hex**: `#6b7280`
- **RGB**: (107, 114, 128)
- **Descripción**: Gris neutro
- **Uso**: Items comunes, background secundario

#### Raro

- **Hex**: `#3b82f6`
- **RGB**: (59, 130, 246)
- **Descripción**: Azul vibrante
- **Uso**: Items raros, elementos de importancia media

#### Épico

- **Hex**: `#a855f7`
- **RGB**: (168, 85, 247)
- **Descripción**: Púrpura brillante
- **Uso**: Items épicos, elementos premium
- **Nota**: Diferenciación clara del gradiente principal

#### Legendario

- **Hex**: `#f59e0b`
- **RGB**: (245, 158, 11)
- **Descripción**: Dorado/Ámbar
- **Uso**: Items legendarios, elementos exclusivos

### 3.3 Colores de Estado

#### Éxito

- **Hex**: `#10b981`
- **RGB**: (16, 185, 129)
- **Uso**: Mensajes de éxito, acciones completadas, capturas exitosas

#### Error

- **Hex**: `#ef4444`
- **RGB**: (239, 68, 68)
- **Uso**: Mensajes de error, validaciones fallidas, estados críticos

#### Advertencia

- **Hex**: `#f59e0b`
- **RGB**: (245, 158, 11)
- **Uso**: Advertencias, información importante, acciones que requieren atención

#### Información

- **Hex**: `#3b82f6`
- **RGB**: (59, 130, 246)
- **Uso**: Mensajes informativos, tooltips, ayuda

### 3.4 Escala de Grises

| Nombre   | Hex       | RGB             | Uso                 |
| -------- | --------- | --------------- | ------------------- |
| Gray-50  | `#f9fafb` | (249, 250, 251) | Fondos muy claros   |
| Gray-100 | `#f3f4f6` | (243, 244, 246) | Fondos claros       |
| Gray-200 | `#e5e7eb` | (229, 231, 235) | Bordes claros       |
| Gray-300 | `#d1d5db` | (209, 213, 219) | Bordes              |
| Gray-400 | `#9ca3af` | (156, 163, 175) | Texto deshabilitado |
| Gray-500 | `#6b7280` | (107, 114, 128) | Texto secundario    |
| Gray-600 | `#4b5563` | (75, 85, 99)    | Texto terciario     |
| Gray-700 | `#374151` | (55, 65, 81)    | Texto principal     |
| Gray-800 | `#1f2937` | (31, 41, 55)    | Texto oscuro        |
| Gray-900 | `#111827` | (17, 24, 39)    | Fondo oscuro        |

### 3.5 Paleta Completa CSS

```css
:root {
  /* Primarios */
  --color-primary: #667eea;
  --color-primary-dark: #764ba2;
  --color-secondary: #f093fb;

  /* Rarezas */
  --color-rarity-common: #6b7280;
  --color-rarity-rare: #3b82f6;
  --color-rarity-epic: #a855f7;
  --color-rarity-legendary: #f59e0b;

  /* Estados */
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  --color-info: #3b82f6;

  /* Escala de grises */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
}
```

---

## 3. Tipografía

### 3.1 Familias de Fuentes

#### Fuente Principal (Sans Serif)

- **Familia**: System Font Stack
- **Stack**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- **Peso por defecto**: 400 (Regular)
- **Pesos disponibles**: 400, 500, 600, 700, 800
- **Uso**: Body text, controles UI, navegación

**CSS:**

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

#### Fuente Monoespacio

- **Familia**: Monospace Stack
- **Stack**: `'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace`
- **Uso**: Código, valores numéricos exactos, datos técnicos

**CSS:**

```css
font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace;
```

### 3.2 Escala de Tipografía

| Nivel        | Tamaño          | Peso | Line Height | Letter Spacing | Uso                 |
| ------------ | --------------- | ---- | ----------- | -------------- | ------------------- |
| Display 1    | 3.5rem (56px)   | 700  | 1.2         | -0.02em        | Títulos principales |
| Display 2    | 2.25rem (36px)  | 700  | 1.3         | -0.01em        | Títulos de sección  |
| Heading 1    | 2rem (32px)     | 700  | 1.25        | -0.01em        | Títulos grandes     |
| Heading 2    | 1.5rem (24px)   | 700  | 1.33        | 0              | Subtítulos          |
| Heading 3    | 1.25rem (20px)  | 600  | 1.4         | 0              | Títulos de card     |
| Body Large   | 1.125rem (18px) | 400  | 1.6         | 0              | Texto prominente    |
| Body Regular | 1rem (16px)     | 400  | 1.6         | 0              | Cuerpo estándar     |
| Body Small   | 0.875rem (14px) | 400  | 1.5         | 0              | Texto secundario    |
| Caption      | 0.75rem (12px)  | 400  | 1.4         | 0              | Etiquetas, ayuda    |
| Code         | 0.875rem (14px) | 400  | 1.6         | 0              | Código y monospace  |

### 3.3 Estilos Tipográficos

#### Títulos (Heading 1)

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
font-size: 2rem;
font-weight: 700;
line-height: 1.25;
letter-spacing: -0.01em;
```

#### Texto Regular

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
font-size: 1rem;
font-weight: 400;
line-height: 1.6;
```

#### Énfasis

```css
font-weight: 600;
letter-spacing: 0;
```

#### Deshabilitado

```css
color: var(--color-gray-400);
opacity: 0.6;
```

---

## 4. Logos y Branding

### 4.1 Definición del Logo

- **Nombre**: Pokeclicker Logo
- **Formato**: SVG (escalable), PNG 512x512px (raster)
- **Variaciones**: Color, blanco (light), oscuro (dark)
- **Ubicación en proyecto**: `public/assets/logos/`

### 4.2 Aplicación del Logo

#### En Header

- **Tamaño**: 48px × 48px
- **Posición**: Esquina superior izquierda
- **Padding**: 1rem
- **Fondo**: Degradado principal
- **Alternativa texto**: "Pokeclicker" en blanco

#### En Favicon

- **Tamaño**: 32x32px (ICO), 192x192px (PNG)
- **Ubicación**: `public/favicon.ico`, `public/manifest.json`

#### En Social Media / Compartir

- **Tamaño**: 1200x630px (OG image)
- **Ubicación**: `public/assets/og-image.png`

### 4.3 Espacio en Blanco (Clearspace)

Mantener espacio mínimo alrededor del logo:

- **Horizontal**: Ancho del logo × 0.5
- **Vertical**: Alto del logo × 0.5

### 4.4 Usos Prohibidos

❌ No girar el logo  
❌ No deformar (estirar/aplastar)  
❌ No cambiar colores sin autorización  
❌ No remover elementos del logo  
❌ No usar sobre fondos que no contraste suficiente

---

## 5. Iconografía

### 5.1 Estilo de Iconos

- **Sistema**: Material Icons o Feather Icons
- **Tamaño base**: 24px × 24px
- **Peso de línea**: 2px
- **Esquinas**: Redondeadas (border-radius: 2px)
- **Color**: Heredar del texto o especificado

### 5.2 Tamaños Estándar

| Uso                  | Tamaño | Context             |
| -------------------- | ------ | ------------------- |
| Íconos de navegación | 24px   | Sidebars, menus     |
| Íconos en botones    | 18px   | Acciones, forms     |
| Íconos grandes       | 48px   | Destacados, modales |
| Íconos muy grandes   | 64px   | Errores, estados    |
| Íconos en badges     | 12px   | Labels, contadores  |

### 5.3 Ejemplos de Iconografía

#### Íconos Funcionales

- ⚙️ Configuración: engranaje
- 🎮 Juego: joystick
- 💰 Dinero: moneda
- 🔒 Seguridad: candado
- ❌ Cerrar: X
- ✓ Aceptar: check
- ⬅️ Atrás: flecha izquierda
- ➡️ Adelante: flecha derecha

#### Íconos de Rarezas

- 🔵 Raro: círculo azul
- 🟣 Épico: círculo púrpura
- ⭐ Legendario: estrella dorada
- ⚫ Común: círculo gris

### 5.4 Estados de Íconos

```css
/* Normal */
color: var(--color-gray-700);

/* Hover */
color: var(--color-primary);
transform: scale(1.1);
transition: all 0.2s ease;

/* Deshabilitado */
color: var(--color-gray-400);
opacity: 0.5;
cursor: not-allowed;

/* Activo */
color: var(--color-primary);
font-weight: 600;
```

---

## 6. Estructura y Layout

### 6.1 Sistema de Grid

- **Tipo**: CSS Grid
- **Columnas**: 12 columnas
- **Ancho máximo**: 1440px
- **Padding lateral**: 1rem (móvil), 2rem (desktop)
- **Brecha (gap)**: 1rem

```css
.container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 1rem;
  gap: 1rem;
}
```

### 6.2 Espaciado (Spacing Scale)

```css
:root {
  /* Espaciado base */
  --space-xs: 0.25rem; /* 4px */
  --space-sm: 0.5rem; /* 8px */
  --space-md: 1rem; /* 16px */
  --space-lg: 1.5rem; /* 24px */
  --space-xl: 2rem; /* 32px */
  --space-2xl: 3rem; /* 48px */
  --space-3xl: 4rem; /* 64px */
}
```

### 6.3 Breakpoints Responsivos

| Nombre  | Ancho          | Uso          |
| ------- | -------------- | ------------ |
| Mobile  | < 640px        | Teléfonos    |
| Tablet  | 640px - 1023px | Tablets      |
| Desktop | ≥ 1024px       | Computadoras |

```css
/* Mobile-first */
.component {
  padding: var(--space-md);
}

/* Tablet */
@media (min-width: 640px) {
  .component {
    padding: var(--space-lg);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .component {
    padding: var(--space-xl);
  }
}
```

### 6.4 Componentes Layout

#### Header

- **Alto**: 64px
- **Fondo**: Degradado principal
- **Padding**: 1rem 2rem
- **Contenido**: Logo, título, menú, usuario

#### Sidebar (Navegación)

- **Ancho**: 240px (desktop), colapsible (mobile)
- **Fondo**: Gray-50
- **Bordes**: 1px solid Gray-200
- **Padding**: 1rem

#### Main Content

- **Padding**: 2rem
- **Fondo**: Blanco (light) / Gray-900 (dark)
- **Ancho máximo**: 1200px

#### Card

- **Padding**: 1.5rem
- **Border Radius**: 0.5rem
- **Box Shadow**: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
- **Borde**: 1px solid Gray-200

#### Footer

- **Alto**: Auto
- **Padding**: 2rem 1rem
- **Fondo**: Gray-900
- **Color texto**: Gray-50

### 6.5 Sombras

```css
:root {
  /* Sombras */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

### 6.6 Border Radius

| Tamaño | Valor   | Uso              |
| ------ | ------- | ---------------- |
| Small  | 0.25rem | Inputs pequeños  |
| Medium | 0.5rem  | Cards, buttons   |
| Large  | 1rem    | Modales grandes  |
| Full   | 999px   | Badges, avatares |

### 6.7 Transiciones y Animaciones

```css
:root {
  /* Transiciones */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}

/* Uso */
.button {
  transition: all var(--transition-normal);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

---

## Resumen Visual

### Paleta de Colores

```
Primarios:     Púrpura #667eea → #764ba2
Secundario:    Rosa #f093fb

Rarezas:
  Común:       Gris #6b7280
  Raro:        Azul #3b82f6
  Épico:       Púrpura #a855f7
  Legendario:  Dorado #f59e0b

Estados:
  Éxito:       Verde #10b981
  Error:       Rojo #ef4444
  Advertencia: Ámbar #f59e0b
  Info:        Azul #3b82f6
```

### Tipografía

```
Principal:   System Font Stack (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto)
Monospace:   'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono'
```

### Estructura

```
Grid:        12 columnas, 1440px máximo
Spacing:     4px, 8px, 16px, 24px, 32px, 48px, 64px
Breakpoints: 640px (tablet), 1024px (desktop)
```

---

**Última actualización**: 19 de Mayo de 2026  
**Próximas revisiones**: Cuando cambien requisitos visuales
