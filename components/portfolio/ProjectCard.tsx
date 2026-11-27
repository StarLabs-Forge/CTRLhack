import { ProjectPreview } from "./ProjectPreview";
import { Tag } from "../ui/Tag";
import type { Project } from "../../data/projectCatalog";
import "./ProjectCard.css";

// Unidad repetible del grid de /portafolio. Por defecto solo muestra imagen +
// nombre + una frase para el usuario final + dos botones — el detalle técnico
// completo (problema/solución/módulos/stack/métricas) vive detrás de "Ver más"
// en <CaseModal>, nunca suelto en la card. Los proyectos "soon" se ven
// desaturados, con overlay de candado y ambos botones inactivos.
interface ProjectCardProps {
  project: Project;
  onOpenDetail: (slug: string) => void;
  // La captura de la primera tarjeta visible carga sin diferir.
  priority?: boolean;
}

export function ProjectCard({ project, onOpenDetail, priority = false }: ProjectCardProps) {
  const isSoon = project.status === "soon";
  const isClient = project.kind === "client";
  const canOpenDetail = !isSoon && Boolean(project.caseStudySlug || project.clientCaseSlug);

  return (
    <div className={`pcard${isSoon ? " pcard-soon" : ""}`}>
      <div className="pcard-thumb-wrap">
        <ProjectPreview project={project} priority={priority} />
        {isSoon && (
          <div className="pcard-lock">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <span>Muy pronto</span>
          </div>
        )}
      </div>

      <div className="pcard-body">
        <div className="pcard-head">
          <h3>{project.name}</h3>
          <Tag variant={isSoon ? "beta" : isClient ? "client" : "on"}>{project.statusLabel}</Tag>
        </div>

        <p className="pcard-pitch">
          {isSoon ? "Estamos construyendo esto — todavía no hay nada para mostrar." : project.pitch}
        </p>

        <div className="pcard-actions">
          <button
            type="button"
            className="btn"
            disabled={!canOpenDetail}
            onClick={() => canOpenDetail && onOpenDetail(project.slug)}
          >
            Ver más
          </button>

          {project.appUrl ? (
            <a className="btn-ghost" href={project.appUrl} target="_blank" rel="noopener noreferrer">
              Ir a la app<span className="go-arrow" aria-hidden="true">↗</span>
            </a>
          ) : (
            <button
              type="button"
              className="btn-ghost"
              disabled
              title={isSoon ? "Todavía no está disponible" : "Publicamos el enlace apenas esté disponible"}
            >
              Ir a la app
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
