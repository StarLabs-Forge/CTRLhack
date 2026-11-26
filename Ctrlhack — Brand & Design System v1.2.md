# Ctrlhack — Brand & Design System v1.2

> **Changelog v1.1 → v1.2:** la identidad pasa de la paleta cyan/blue/violet/purple y el isotipo "V en cinta" a un sistema **ciberpunk industrial, premium**: superficies mate oscuras, metal cepillado en cobre y luz moderada. El isotipo oficial es ahora **`CtrlHack_03_Cobre_Fiel`** (chevrones `< >` + tecla Ctrl). Este documento **reemplaza a la v1.1** como única fuente de verdad visual. Los tokens viven en `styles/tokens.css`.

---

## 1. Dirección

Innovación, ambición, creatividad, resiliencia y excelencia — sin limitar la marca a "empresa de tecnología". Debe funcionar igual para tecnología, diseño, arte, música y escritura.

- Fondos oscuros, superficies mate, detalles metálicos en cobre.
- Geometría angular: cortes diagonales y esquinas biseladas heredados de los chevrones.
- Luz moderada. **Nada de neón ambiental**: el brillo solo en hover/focus o en un foco único por pantalla.
- Evitar plantillas tecnológicas genéricas (gradientes en todo, glassmorphism azul, terminales falsas).

## 2. Paleta corporativa

| Token | Hex | Rol |
|---|---|---|
| `--copper` | `#B87333` | Cobre oscuro — bordes, énfasis, `--accent-strong` |
| `--glow` | `#FF9D45` | Cobre luminoso — acento activo, enlaces, estado (`--accent`) |
| `--ivory` | `#FFDAB9` | Marfil cálido — acento "cercano" (testimonios, contacto, nombres de casos) |
| `--bronze` | `#78421F` | Bronce oscuro — filetes y planos decorativos (**no** para texto) |
| `--brown` | `#1E0D04` | Marrón profundo — paneles de acento |
| `--obsidian` | `#0B0908` | Negro obsidiana — fondo base (`--bg-950`) |
| `--graphite` | `#2A2A2A` | Grafito — superficie interactiva (`--bg-750`) |
| `--white` | `#F5F0EB` | Blanco cálido — texto principal (`--text-100`) |

**Derivados** (obsidiana→grafito con tinte cálido): `--bg-900 #120E0B`, `--bg-800 #1A1511`, `--line #3A2F27`, `--line-soft #1F1914`, `--text-300 #CFC5BC`, `--text-500 #A1968D`, `--text-600 #8F847A`.
**Estado:** `--ok #7EA888` se conserva (verde semántico de "operativo"; no es color de marca).

### Contraste (WCAG, sobre `--bg-950` / `--bg-800`)
`text-100` 17.5 / 16.0 · `text-300` 11.7 / 10.7 · `text-500` 6.9 / 6.3 · `text-600` 5.4 / 5.0 · `glow` 9.6 / 8.8 · `copper` 5.2 / 4.8 · `ivory` 15.1 / 13.8. Texto obsidiana sobre botón: 5.2 (cobre) a 9.6 (glow). **Todo texto cumple AA (≥ 4.5:1).** `bronze` (2.5:1) no se usa para texto.

### Gradientes
- `--brand-gradient` (cobre → glow → marfil): texto destacado y relleno de botón. Sin tonos oscuros, para mantener contraste.
- `--metal-edge` (bronce → cobre → marfil → cobre → bronce): bordes metálicos en hover. Decorativo.
- `--brush`: textura de metal cepillado a 3.5 % de opacidad, solo en paneles grandes.

## 3. Tipografía
Space Grotesk (títulos y wordmark) · Inter (contenido) · JetBrains Mono (eyebrows, botones, etiquetas, detalle técnico). Escala y espaciado sin cambios respecto a v1.1 (múltiplos de 4).

## 4. Isotipo oficial
Archivo fuente: `CtrlHack_03_Cobre_Fiel.svg` (raíz de `D:\VEXORA`). Proporción **2:1 (viewBox 1774 × 887)**, fondo transparente.

- **Componente:** `components/ui/Logo.tsx` — *generado* desde el SVG oficial; la geometría (28 paths, viewBox) es idéntica. Solo añade clases a los grupos (`sl-chevron`, `sl-key`, `sl-ambient`) para animar el ensamblaje y prefija los ids por instancia (`useId`).
- **Estático:** `public/brand/isotipo.svg` = archivo oficial sin cambios.
- **Favicon:** `public/favicon.svg` = mismo contenido con `viewBox` cuadrado centrado (no se toca la geometría). PNG/ICO (`favicon-16/32/48`, `apple-touch-icon`, `icon-192/512`, `favicon.ico`) generados desde el PNG oficial; los de app llevan fondo obsidiana.
- **Reglas:** dimensionar por **una sola** dimensión (`height` o `width`) y dejar la otra en `auto`; no recolorear, no recortar, no rotar, no añadir sombras propias. A tamaños pequeños (favicon) el isotipo mide ~2:1, por lo que ocupa poco alto: es esperado.
- **Obsoleto:** el isotipo "V en cinta" cyan→púrpura y los PNG de `public/brand/` (`isotipo.png`, `logo-simple-horizontal.png`, `icon.png`) quedan como histórico; no usar en trabajo nuevo.

## 5. Forma
- Cortes diagonales: botones (esquinas arriba-izq / abajo-der, `--cut-sm: 7px`) y tarjetas principales (esquina superior derecha, `--cut: 14px`). El `clip-path` recorta también las sombras exteriores y el borde: el filete diagonal se redibuja con gradientes/`::after` y el realce de hover va **por dentro** (borde metálico, `box-shadow: inset`).
- Marcador de eyebrow en chevron (eco del isotipo).
- `--radius: 3px` / `--radius-lg: 6px` en el resto de elementos.

## 6. Motion
- **Ensamblaje del isotipo** (`Logo assemble`): chevrones entran desde los lados, la tecla cae al centro, la luz se enciende al final (≈ 1.3 s, una sola vez). Usado en navbar, pantalla de carga y 404. En carga, la luz respira suave hasta que llega la vista.
- **Hover del isotipo:** los chevrones se abren ~34 u del viewBox y la tecla se asienta (`translate`/`scale` independientes, no pisan la animación).
- **`Reveal variant="assemble"`:** barrido diagonal inclinado como un corte del isotipo; el recorte vive solo en la animación (`fill: backwards`), no deja `clip-path` residual.
- **Botón:** barrido de luz tipo metal cepillado (desplazamiento del gradiente) en hover.
- **Reduced motion:** `prefers-reduced-motion: reduce` desactiva animaciones del isotipo, `Reveal`, parallax y transiciones (regla global en `tokens.css`); el contenido queda completo y visible.

## 7. Uso del acento cálido
Marfil (`--warm-accent`) **exclusivamente** en testimonios, contacto y nombres reales de casos. Nunca en navegación, CTAs primarios ni estado.

## 8. Ilustraciones de servicios
`assets/cobre/1–4.png`: duotono cobre de las ilustraciones originales (azules, en `assets/1–4.png`, conservadas), con el negro convertido en transparencia.

## 9. Pendiente conocido
- Sin modo claro (la especificación light de v1.1 queda obsoleta; habría que redefinirla en cobre/marfil).
- Los mockups del hero (laptop/teléfono) y las miniaturas de portafolio son CSS genérico: heredan la paleta pero no tienen composición propia de marca.
- Fuentes por CDN de Google; si se quiere privacidad/rendimiento, autoalojarlas.
