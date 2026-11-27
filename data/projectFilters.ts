import type { PortfolioProject } from "./portfolioProjects";

// Filtros de portafolio. Estado (fase) y origen son propiedades independientes:
// "De clientes" filtra por ORIGEN (kind), no es una fase de desarrollo — un
// proyecto de cliente puede estar activo, en proceso o planificado.
export type ProjectFilterId = "all" | "active" | "building" | "planned" | "client";

export interface ProjectFilterOption {
  id: ProjectFilterId;
  label: string;
}

export const FILTER_LABELS: Record<ProjectFilterId, string> = {
  all: "Todos",
  active: "Activos",
  building: "En proceso",
  planned: "Planificados",
  client: "De clientes",
};

// Carrusel del Home: todo el portafolio (propios + clientes).
export const DECK_FILTERS: ProjectFilterId[] = ["all", "active", "building", "planned", "client"];
// /productos: solo productos propios, así que sin "De clientes".
export const PRODUCT_FILTERS: ProjectFilterId[] = ["all", "active", "building", "planned"];

export function matchesFilter(project: Pick<PortfolioProject, "stage" | "kind">, filter: ProjectFilterId): boolean {
  switch (filter) {
    case "all":
      return true;
    case "client":
      return project.kind === "client";
    default:
      return project.stage === filter;
  }
}

export function filterProjects<T extends Pick<PortfolioProject, "stage" | "kind">>(list: T[], filter: ProjectFilterId): T[] {
  return list.filter((project) => matchesFilter(project, filter));
}

export function filterOptions<T extends Pick<PortfolioProject, "stage" | "kind">>(
  list: T[],
  ids: ProjectFilterId[],
): Array<ProjectFilterOption & { count: number }> {
  return ids.map((id) => ({ id, label: FILTER_LABELS[id], count: filterProjects(list, id).length }));
}

// Mensaje de "sin resultados" coherente con cada filtro.
export const EMPTY_MESSAGES: Record<ProjectFilterId, string> = {
  all: "Todavía no hay proyectos para mostrar.",
  active: "Todavía no hay proyectos activos en esta vista.",
  building: "Ahora mismo no hay proyectos en desarrollo activo. Cuando haya uno, aparecerá aquí.",
  planned: "No hay proyectos planificados en esta vista.",
  client: "Todavía no hay proyectos de clientes para mostrar.",
};
