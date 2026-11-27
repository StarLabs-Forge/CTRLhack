# Ctrlhack — Estudio de Ingeniería de Producto

Sitio web de **Ctrlhack**, un estudio especializado en diseño y construcción de software real para negocios reales. Arquitectura, MVP y operación en producción.

## 🚀 Tecnología

- **Framework**: [Vite](https://vitejs.dev/) + [React](https://react.dev/) 18.3
- **Lenguaje**: TypeScript 5.5
- **Enrutamiento**: React Router v6
- **Estilos**: CSS modular con tokens de diseño
- **Build Tool**: Vite 5.4
- **3D del hero**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) 8 + [GSAP](https://gsap.com/) (chunk aparte, carga diferida)
- **Herramientas de desarrollo**: `playwright-core` y `sharp` (solo para generar capturas; no entran al bundle)

## 📁 Estructura del Proyecto

```
.
├── components/              # Componentes reutilizables
│   ├── layout/             # Navbar, Footer, ScrollManager
│   ├── sections/           # Secciones de página (Hero, Services, Process, etc)
│   │   └── showcase3d/     # Escena 3D del hero (ordenador, paneles, shaders, timeline)
│   ├── ui/                 # Componentes base (Button, Logo, Tag, etc)
│   ├── cases/              # Componentes para casos de estudio
│   ├── testimonials/       # Testimonios
│   ├── portfolio/          # Portafolio: ProjectDeck, ProjectCard, ProjectPreview,
│   │                       #   ProjectFilters, ProjectViewer, CaseModal
│   ├── effects/            # Efectos visuales (parallax, scroll effects)
│   └── seo/                # Meta tags y SEO
├── views/                  # Vistas principales (páginas de la app)
│   ├── HomeView.tsx        # Página de inicio
│   ├── ServiciosView.tsx   # Página de servicios
│   ├── ServicioWebView.tsx # Detalle de servicio (también Apps y Sistemas)
│   ├── PortafolioView.tsx  # Página de portafolio
│   ├── ProductosView.tsx   # Productos propios, con filtros por estado
│   ├── NotFoundView.tsx    # Página 404
│   └── Loading.tsx         # Fallback de carga
├── data/                   # Datos estáticos y constantes
│   ├── socials.ts          # Enlaces de redes sociales
│   ├── serviceDetails.ts   # Contenido de /servicios/web, /apps y /sistemas
│   ├── portfolioProjects.ts # Proyectos (fuente única: URL, estado, origen, visibilidad)
│   ├── projectCatalog.ts   # Une cada proyecto con su captura (lo que consume la UI)
│   ├── projectFilters.ts   # Lógica de los filtros del portafolio
│   └── screenshots.json    # Registro de capturas (lo escribe `npm run shots`)
├── scripts/
│   └── capture-screenshots.mjs # Genera las capturas reales (Playwright + WebP)
├── public/screenshots/     # Capturas WebP de los proyectos públicos
├── styles/                 # Estilos globales
│   ├── globals.css         # Estilos base
│   ├── tokens.css          # Tokens de diseño (colores, tipografía, etc)
│   └── *View.css           # Estilos específicos por vista
├── App.tsx                 # Componente raíz con routing
├── main.tsx                # Punto de entrada
├── index.html              # HTML principal
└── vite.config.ts          # Configuración de Vite
```

## 🏗️ Características Principales

### Code Splitting Automático
Las vistas se cargan bajo demanda usando `React.lazy()` y `Suspense`, reduciendo el bundle inicial:

```tsx
const HomeView = lazy(() => import("./views/HomeView"));
```

### Alias de Rutas
Se utiliza el alias `@/` para importes absolutos:

```tsx
import { Navbar } from "@/components/layout/Navbar";
```

### Tokens de Diseño
Sistema centralizado de diseño en `styles/tokens.css` con variables CSS para colores, tipografía y espaciado.

### Hero 3D con fallback
El hero muestra un ordenador 3D con el isotipo oficial (`public/brand/isotipo.svg`), interfaces que
emergen de la pantalla y parallax con el cursor. Se carga solo cuando el navegador está libre y se
pausa fuera de pantalla. Cae a un monitor CSS estático con `prefers-reduced-motion`, ahorro de datos,
equipos limitados, sin WebGL2 o si no se mantiene fluido.

### Páginas de servicio
`/servicios/web|apps|sistemas` comparten `ServiceDetail`: intro en piezas cortas junto a la imagen de
marca, y tarjetas con ilustración SVG animada (`ServiceArt`). Todo el movimiento se apaga con
`prefers-reduced-motion`.

### Componentes Modulares
Cada componente es independiente y reutilizable, siguiendo el patrón de carpetas por funcionalidad.

## 🛠️ Desarrollo

### Requisitos
- Node.js 18+ (22.6+ para `npm run shots`, que lee los datos TypeScript directamente)
- npm o yarn

### Instalación

```bash
npm install
```

### Servidor de Desarrollo

```bash
npm run dev
```

El servidor iniciará en `http://localhost:5173` con hot module replacement (HMR).

### Build para Producción

```bash
npm run build
```

Ejecuta la verificación de tipos (`tsc --noEmit`) y construye el proyecto optimizado en la carpeta `dist/`.

### Preview de Build

```bash
npm run preview
```

Previsualiza la build de producción localmente.

## 🖼️ Capturas del portafolio

Las tarjetas de proyecto muestran **capturas reales** de cada sitio. Se generan en
desarrollo y se versionan en el repo (el sitio solo sirve archivos estáticos).

```bash
npm run shots                  # todos los proyectos públicos
npm run shots -- check kolla   # solo esos (actualización individual)
npm run shots -- --list        # qué se capturaría, sin tocar nada
```

- **Fuente única:** las URLs salen de `data/portfolioProjects.ts` (`appUrl`). Solo se
  capturan proyectos con `isPublic: true`; los demás no se tocan nunca.
- **Salida:** `public/screenshots/<slug>.webp` (1920×1080) y `<slug>-960.webp`
  (tarjetas), más `data/screenshots.json` (ruta, fecha y si la app admite iframe).
- **Si una página falla** se conserva la última captura válida y su registro.
- Requiere Chrome o Edge instalado (o `CHROME_PATH`). Nuevo proyecto público: añadirlo
  a `portfolioProjects.ts` con `isPublic: true` + `appUrl` y correr `npm run shots -- <slug>`.
- **Estado de filtrado:** cada proyecto declara `stage` (`active` / `building` / `planned`)
  y `kind` (`product` / `client`). `building` no se asigna sin respaldo en los datos.

## 📋 Verificación de Tipos

El proyecto está configurado con `strict: true` en TypeScript. Antes de hacer commit, asegúrate de que no hay errores de tipo:

```bash
npx tsc --noEmit
```

## 🌐 Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Página de inicio |
| `/servicios` | Servicios ofrecidos |
| `/portafolio` | Proyectos completados |
| `/contacto` | Formulario de contacto |
| `*` | Página 404 (no encontrada) |

## 🎨 Diseño y Estilos

El proyecto usa un sistema de diseño basado en tokens CSS:

- **Tipografía**: Space Grotesk (títulos), Inter (cuerpo), JetBrains Mono (código)
- **Colores**: Definidos en `tokens.css`
- **Spacing**: Escala consistente en `tokens.css`

Las fuentes se cargan desde Google Fonts en `index.html`.

## 📱 SEO y Meta Tags

La carpeta `components/seo/` contiene el componente `Meta` que gestiona los meta tags de las páginas.

## 🚀 Deploy en Vercel

El proyecto está optimizado para desplegar en Vercel. Ver [`VERCEL_DEPLOYMENT_RULES.md`](./VERCEL_DEPLOYMENT_RULES.md) para los requisitos y mejores prácticas.

## 📝 Convenciones de Código

- **TypeScript Strict**: Todo el código es type-safe
- **Naming**: camelCase para variables/funciones, PascalCase para componentes
- **Estructura**: Componentes pequeños y enfocados
- **Imports**: Preferir rutas relativas en una carpeta, rutas absolutas (@/) entre carpetas

## 📄 Licencia

Todos los derechos reservados © Ctrlhack
