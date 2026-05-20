# Guía de Estilos — Pokeclicker

---

## 1. Colores

### Colores Primarios

| Token CSS           | Valor     | Uso                                                                      |
| ------------------- | --------- | ------------------------------------------------------------------------ |
| `--color-primary`   | `#b92846` | Borde del header, botones de compra, foco, sidebar admin, nombre jugador |
| `--color-secondary` | `#1a83db` | Valor multiplicador, acentos secundarios                                 |
| `--color-accent`    | `#d9a514` | Dinero, valores por clic, badge de nivel, nav activo                     |

---

### Colores de Interfaz

**Modo Claro:**

| Token CSS      | Valor     | Uso                        |
| -------------- | --------- | -------------------------- |
| `--bg-app`     | `#fcf7f7` | Fondo general de la app    |
| `--bg-card`    | `#ffffff` | Fondo de tarjetas / header |
| `--text-main`  | `#1a1414` | Texto principal            |
| `--text-muted` | `#696161` | Texto secundario / labels  |

**Modo Oscuro:**

| Token CSS      | Valor     | Uso               |
| -------------- | --------- | ----------------- |
| `--bg-app`     | `#070505` | Fondo general     |
| `--bg-card`    | `#151010` | Fondo de tarjetas |
| `--text-main`  | `#f5ecec` | Texto principal   |
| `--text-muted` | `#958d8d` | Texto secundario  |

---

### Colores de Estado

| Token CSS          | Valor     | Uso                                     |
| ------------------ | --------- | --------------------------------------- |
| `--color-success`  | `#5da260` | Capturas exitosas, acciones completadas |
| `--color-error`    | `#b32228` | Validaciones fallidas, estados críticos |
| `--color-disabled` | `#ab9a99` | Elementos deshabilitados                |

---

### Escala de Neutrales

El código usa tokens `--neutral-*` en formato hex. Solo existen los niveles utilizados en la aplicación:

| Token           | Valor hex | Uso                             |
| --------------- | --------- | ------------------------------- |
| `--neutral-50`  | `#fcf7f7` | Fondos muy claros (light)       |
| `--neutral-100` | `#f0e9e9` | Fondos claros                   |
| `--neutral-200` | `#dbd2d1` | Bordes de inputs (light)        |
| `--neutral-300` | `#cac2c1` | Bordes de slots / separadores   |
| `--neutral-700` | `#322c2c` | Texto sobre fondo oscuro        |
| `--neutral-900` | `#0d0a0a` | Fondo dark / textos más oscuros |

---

### Colores de Rareza

#### Badges (indicador circular en tarjetas de Pokémon)

| Rareza     | Color                     | Valor                                       |
| ---------- | ------------------------- | ------------------------------------------- |
| Común      | Verde suave               | `#709c71`                                   |
| Épico      | Púrpura                   | `#9f85e5`                                   |
| Legendario | Gradiente dorado con glow | `linear-gradient(135deg, #d9a514, #dc7b40)` |

#### Tarjetas del Pokédex

| Rareza     | Borde     | Fondo (gradiente)                 |
| ---------- | --------- | --------------------------------- |
| Común      | `#a0aec0` | `#edf2f7 → #f7fafc`               |
| Épico      | `#9f7aea` | `#faf5ff → #f3e8ff`               |
| Legendario | `#ecc94b` | `#fffff0 → #fffacd` + glow dorado |

#### Sobres (Pack Cards)

| Tipo   | Fondo (gradiente)                           | Borde     |
| ------ | ------------------------------------------- | --------- |
| Básico | `linear-gradient(140deg, #eef9ee, #e8f1ec)` | `#88c28a` |
| Épico  | `linear-gradient(140deg, #f6f3ff, #f3eafe)` | `#9b7be9` |

---

## 2. Tipografía

### Familias de Fuentes

| Tipo        | Stack                                                                | Uso                               |
| ----------- | -------------------------------------------------------------------- | --------------------------------- |
| Principal   | `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | Body, UI, navegación              |
| Monoespacio | `"JetBrains Mono", "Courier New", monospace`                         | Dinero, valores numéricos, código |

---

### Escala Tipográfica

Tamaños verificados en los archivos CSS del proyecto:

| Elemento                                  | Tamaño          | Peso    | Letter-spacing      | Fuente |
| ----------------------------------------- | --------------- | ------- | ------------------- | ------ |
| KPI admin (valor grande)                  | 2.8rem          | 800     | -1.5px              | main   |
| Título admin (pageTitle)                  | 2.4rem          | 800     | -0.8px              | main   |
| Dinero (entero)                           | 2.25rem (36px)  | 700     | —                   | mono   |
| Número flotante al clic                   | 2rem (32px)     | 900     | —                   | mono   |
| Título login / heading                    | 32px            | 700     | -0.5px              | main   |
| Nombre del jugador (header)               | 1.75rem (28px)  | 700     | —                   | main   |
| Valor por clic / multiplicador            | 1.5rem (24px)   | 700     | —                   | mono   |
| Logo admin sidebar                        | 1.5rem (24px)   | 800     | 0.5px               | main   |
| Dinero (decimal)                          | 1.25rem (20px)  | 700     | —                   | mono   |
| Input de formulario                       | 16px            | 400     | —                   | main   |
| Subtítulo login                           | 14px (0.875rem) | 400     | —                   | main   |
| Nav item sidebar                          | 0.95rem         | 500/600 | —                   | main   |
| Labels de sección (POR CLIC, ×MULT, etc.) | 0.875rem (14px) | 600     | 0.5px (uppercase)   | main   |
| Label de campo / DINERO / KPI etiqueta    | 0.75rem (12px)  | 600–700 | 0.5–1px (uppercase) | main   |

---

### CSS de Referencia

```css
/* Variables de fuente */
--font-main: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "JetBrains Mono", "Courier New", monospace;

/* Título principal (login) */
font-size: 32px;
font-weight: 700;
line-height: 1.2;
letter-spacing: -0.5px;

/* Label de campo */
font-size: 12px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.5px;

/* Valor monetario */
font-family: var(--font-mono);
font-size: 2.25rem;   /* entero */  |  font-size: 1.25rem; /* decimal */
font-weight: 700;
color: var(--color-accent);

/* Valor por clic / multiplicador */
font-family: var(--font-mono);
font-size: 1.5rem;
font-weight: 700;
color: var(--color-accent);   /* por clic */
color: var(--color-secondary); /* multiplicador */
```

---

## 3. Fotos y Logos

### Logo Principal

| Atributo  | Valor             |
| --------- | ----------------- |
| Nombre    | Pokeclicker Logo  |
| Formato   | PNG 2303×1256 px  |
| Ubicación | `public/logo.png` |

---

### Aplicación del Logo

| Contexto         | Tamaño                               | Detalles                                                                                                                             |
| ---------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Header del juego | 80 px de alto, ancho automático      | Esquina superior izquierda; `width={2303} height={1256}` en Next.js Image para mantener el aspect ratio correcto en el primer render |
| Favicon          | 32 × 32 px (ICO), 192 × 192 px (PNG) | `public/favicon.ico`                                                                                                                 |

---

### Espacio en Blanco (Clearspace)

Reservar alrededor del logo un margen mínimo de:

- **Horizontal**: ancho del logo × 0.5
- **Vertical**: alto del logo × 0.5

---

### Usos Prohibidos del Logo

- No girar ni inclinar el logo.
- No deformar (estirar o aplastar).
- No cambiar los colores corporativos sin autorización.
- No eliminar ningún elemento del logo.
- No colocar sobre fondos sin contraste suficiente.

---

### Fotografías de Fondo

Las imágenes fotográficas se utilizan únicamente como fondos de pantallas de autenticación:

| Archivo             | Ruta             | Uso                     |
| ------------------- | ---------------- | ----------------------- |
| `fondoLogin.jpg`    | `public/fondos/` | Fondo pantalla Login    |
| `fondoRegister.jpg` | `public/fondos/` | Fondo pantalla Registro |

**Criterios de selección de fotografías:**

- Paleta coherente con el tema de la aplicación (oscuras/nebulosas, con profundidad).
- Resolución mínima: 1920 × 1080 px.
- La fotografía ocupa todo el viewport (`cover`, `fixed` en desktop, `scroll` en móvil):

```css
background-image: url("/fondos/fondoLogin.jpg");
background-size: cover;
background-position: center;
background-attachment: fixed; /* scroll en móvil */
```

---

## 4. Iconografía

### Sistema de Iconos

El proyecto no usa ninguna librería de iconos. Todos los iconos son emojis Unicode o caracteres especiales incrustados directamente en el JSX.

---

### Tamaños Estándar

| Contexto          | Font-size | Uso                              |
| ----------------- | --------- | -------------------------------- |
| Botones de header | 1.25rem   | ⚙️ Ajustes, 💾 Guardar, 🚪 Salir |

---

### Iconos por Función

Solo los iconos que aparecen en el código fuente:

| Función         | Icono        | Dónde se usa                           |
| --------------- | ------------ | -------------------------------------- |
| Configuración   | Engranaje ⚙️ | Header juego, nav admin ajustes        |
| Moneda / Dinero | Moneda 💰    | Botones de compra, nav admin economía  |
| Cerrar          | ✕            | Modales (ajustes, Pokédex, expositor)  |
| Confirmar       | ✓            | Formularios de registro, estados admin |
| Volver          | ←            | Página de login                        |

### Indicadores de Rareza

La rareza no usa emojis. Se representa visualmente mediante clases CSS de color en los badges (circulares) y en las tarjetas del Pokédex. Ver valores en la sección **Colores de Rareza**.

---

### Estados de Iconos

```css
/* Normal */
color: var(--text-main);

/* Hover */
color: var(--color-primary);
transform: scale(1.1);
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

/* Deshabilitado */
color: var(--color-disabled);
opacity: 0.5;
cursor: not-allowed;

/* Activo */
color: var(--color-primary);
font-weight: 600;
```

---

## 5. Estructura

### Layouts de la Aplicación

La app tiene tres layouts principales, cada uno con su grid propio:

| Vista                 | Estructura                             |
| --------------------- | -------------------------------------- |
| Juego (`/game`)       | CSS Grid `1fr 350px` (centro + panel)  |
| Admin (`/admin`)      | Sidebar fijo 280px + área de contenido |
| Auth (login/register) | Flexbox centrado, card flotante        |

---

### Layout del Juego

```css
.mainLayout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: var(--spacing-lg); /* 1.5rem */
  padding: var(--spacing-xl); /* 2rem */
  max-width: 1400px;
  margin: 0 auto;
}
```

---

### Breakpoints Responsivos

| Nombre  | Ancho    | Dispositivo |
| ------- | -------- | ----------- |
| Mobile  | ≤ 640 px | Teléfonos   |
| Tablet  | ≤ 768 px | Tablets     |
| Desktop | > 768 px | Ordenadores |

---

### Escala de Espaciado

Los tokens de espaciado se llaman `--spacing-*` (no `--space-*`):

```css
:root {
  --spacing-xs: 0.25rem; /*  4px */
  --spacing-sm: 0.5rem; /*  8px */
  --spacing-md: 1rem; /* 16px */
  --spacing-lg: 1.5rem; /* 24px */
  --spacing-xl: 2rem; /* 32px */
}
```

---

### Anatomía de los Componentes de Layout

#### Header (juego)

- **Fondo**: `var(--bg-card)` — blanco (light) / oscuro (dark)
- **Borde inferior**: `2px solid var(--color-primary)` — línea roja
- **Padding**: `var(--spacing-md) var(--spacing-xl) var(--spacing-md) var(--spacing-sm)` (1rem 2rem 1rem 0.5rem)
- **Sombra**: `0 2px 8px rgba(0, 0, 0, 0.08)`
- **Contenido**: Logo + nombre jugador (izquierda) · Dinero (centro) · Botones acción (derecha)

#### Sidebar Admin

- **Posición**: fixed, izquierda, full-height (100vh)
- **Ancho**: 280px
- **Fondo**: `linear-gradient(180deg, #b92846, #a4273f)` (gradiente rojo)
- **Padding**: 32px 24px
- **Sombra**: `8px 0 24px rgba(231, 76, 60, 0.15)`
- **Nav item activo**: color `var(--color-accent)`, borde izquierdo amarillo

#### Card de Autenticación (login / registro)

- **Ancho máximo**: 420px
- **Padding**: 40px
- **Border-radius**: 16px
- **Fondo**: `#fcf7f7` (light) / `#0d0a0a` (dark)
- **Borde**: `1px solid #dbd2d1`
- **Sombra**: `0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.08), 0 16px 32px rgba(0,0,0,0.06)`
- **Animación de entrada**: `slideUp 400ms cubic-bezier(0.4, 0, 0.2, 1)`

#### Slot de Display (expositor de Pokémon)

- **Border-radius**: 12px
- **Borde**: `3px solid var(--neutral-300)` → `var(--color-primary)` en hover
- **Fondo**: `var(--bg-app)`
- **Hover**: `translateY(-4px) scale(1.05)`, sombra `0 8px 20px rgba(0,0,0,0.15)`

#### Expositor Frame (contenedor del expositor)

- **Border-radius**: 16px
- **Borde**: `3px solid var(--color-primary)`
- **Sombra**: `0 8px 24px rgba(0, 0, 0, 0.12)`

---

### Border Radius

| Valor | Uso                                             |
| ----- | ----------------------------------------------- |
| 4px   | Badge de nivel, elementos muy pequeños          |
| 8px   | Inputs de formulario, botones de header         |
| 12px  | Nav items sidebar, slots de display, mini-cards |
| 16px  | Card de login/registro, expositor frame         |
| 50%   | Badges de rareza (circulares)                   |

---

### Transiciones y Animaciones

El proyecto usa principalmente `cubic-bezier(0.4, 0, 0.2, 1)` (easing Material) para transiciones y animaciones en `game.module.css`. Las duraciones varían según el contexto:

| Duración | Uso                                             |
| -------- | ----------------------------------------------- |
| 0.1s     | Cambios de escala muy rápidos (pokeball activo) |
| 0.2s     | Hover de botones, cambios de estado             |
| 0.3s     | Hover de cards, transiciones de color           |
| 0.6s     | Animaciones de bounce repetitivas               |
| 0.7s     | Efecto float del número al hacer clic           |
| 2s       | Pulso del pokéball (infinito)                   |
| 3s       | Flotación de elementos decorativos (infinito)   |

**Nota**: No todas las transiciones especifican timing function — algunas en `page.module.css` usan solo `transition: 0.2s`.

**Animaciones clave:**

```css
/* Entrada de card de auth */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pulso del Pokémon */
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Número flotante al hacer clic */
@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
  30% {
    opacity: 1;
    transform: translate(-50%, -80%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -150%) scale(0.8);
  }
}
```
