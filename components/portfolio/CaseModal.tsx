import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CaseStudy } from "../cases/CaseStudy";
import { ClientCase } from "../cases/ClientCase";
import { ProjectPreview } from "./ProjectPreview";
import { ProjectViewer } from "./ProjectViewer";
import type { Project } from "../../data/projectCatalog";
import type { CaseStudy as CaseStudyData } from "../../data/caseStudies";
import type { ClientCase as ClientCaseData } from "../../data/clientCases";
import "./CaseModal.css";

// Ventana con el detalle completo que antes vivía suelto en la página de
// portafolio — ahora solo aparece cuando alguien pide explícitamente "Ver
// más" desde <ProjectCard>. Cierra con Escape, click en el overlay, o el
// botón X; bloquea el scroll del body mientras está abierto.
// Acepta EXACTAMENTE uno de los dos: `caseStudy` (producto propio, formato
// técnico problema/solución/módulos/stack/métricas) o `clientCase` (trabajo
// de cliente, formato liviano qué-pidió/qué-construimos/alcance/tiempo) — lo
// decide quién llama según si el proyecto abierto tiene caseStudySlug o
// clientCaseSlug (ver PortafolioView.tsx).
// `project` (opcional) trae la captura real y el visor: si el proyecto es público
// y tiene captura, el detalle abre con su vista previa y, debajo, la opción de
// vista interactiva ampliada (iframe, o captura ampliada si la app no se deja
// incrustar). Sin `project` el modal se ve igual que antes.
interface CaseModalProps {
  project?: Project;
  caseStudy?: CaseStudyData;
  clientCase?: ClientCaseData;
  onClose: () => void;
}

export function CaseModal({ project, caseStudy, clientCase, onClose }: CaseModalProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const showPreview = Boolean(project && project.shot);
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <>
      {createPortal(
    <div className="case-modal-overlay" onClick={onClose}>
      <div
        className="case-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle del proyecto ${caseStudy?.name ?? clientCase?.name ?? ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="case-modal-close" onClick={onClose} aria-label="Cerrar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <div className="case-modal-scroll">
          {project && showPreview && (
            <div className="case-preview">
              <ProjectPreview project={project} variant="detail" priority />
              <div className="case-preview-actions">
                {project.viewer && (
                  <button type="button" className="btn" onClick={() => setViewerOpen(true)}>
                    {project.viewer === "iframe" ? "Vista interactiva" : "Ver captura ampliada"}
                  </button>
                )}
                {project.appUrl && (
                  <a className="btn-ghost" href={project.appUrl} target="_blank" rel="noopener noreferrer">
                    Ir a la app<span aria-hidden="true"> ↗</span>
                  </a>
                )}
              </div>
            </div>
          )}
          {caseStudy && <CaseStudy caseStudy={caseStudy} />}
          {clientCase && <ClientCase clientCase={clientCase} />}
        </div>
      </div>
    </div>,
    document.body
      )}
      {viewerOpen && project && <ProjectViewer project={project} onClose={() => setViewerOpen(false)} />}
    </>
  );
}
