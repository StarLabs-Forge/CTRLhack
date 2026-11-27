import shots from "./screenshots.json";
import { portfolioProjects, type PortfolioProject } from "./portfolioProjects";

// Catálogo ÚNICO que consume la UI (carrusel, /productos, /portafolio, modal):
// los datos editoriales de portfolioProjects.ts + la captura real de cada
// proyecto, registrada por scripts/capture-screenshots.mjs en screenshots.json.
// Así ninguna vista duplica rutas, fechas ni estados.
export interface ProjectShot {
  src: string; // 1920×1080
  srcSm: string; // 960×540 (tarjetas)
  width: number;
  height: number;
  updatedAt: string; // ISO
  // Medido al capturar (X-Frame-Options / CSP frame-ancestors), no supuesto.
  embeddable: boolean;
}

// Cómo se muestra el visor ampliado de un proyecto:
//  "iframe": la app permite incrustarse → vista interactiva real.
//  "static": hay captura pero la app no se deja incrustar → se amplía la captura.
//  null:     no hay nada público que ampliar (proyecto bloqueado o sin captura).
export type ViewerMode = "iframe" | "static" | null;

export interface Project extends PortfolioProject {
  shot?: ProjectShot;
  viewer: ViewerMode;
}

const manifest = shots as Record<string, ProjectShot>;

// El `?v=` rompe la caché del navegador cuando se actualiza una captura (los
// archivos conservan el mismo nombre para que la ruta sea estable).
function versioned(path: string, updatedAt: string) {
  return `${path}?v=${Date.parse(updatedAt) || 0}`;
}

export const projects: Project[] = portfolioProjects.map((project) => {
  const raw = project.isPublic ? manifest[project.slug] : undefined;
  const shot = raw && { ...raw, src: versioned(raw.src, raw.updatedAt), srcSm: versioned(raw.srcSm, raw.updatedAt) };
  const viewer: ViewerMode = !project.isPublic || !project.appUrl ? null : shot?.embeddable ? "iframe" : shot ? "static" : null;
  return { ...project, shot, viewer };
});
