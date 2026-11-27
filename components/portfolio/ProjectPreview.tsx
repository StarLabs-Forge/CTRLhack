import { useState } from "react";
import type { Project } from "../../data/projectCatalog";
import "./ProjectPreview.css";

// Vista previa de un proyecto dentro del marco de ventana de navegador (barra
// con puntos, bordes, esquinas). Reemplaza al mockup abstracto de letra + líneas
// que había antes: ahora muestra la CAPTURA REAL del proyecto y es el único
// componente que la dibuja, así carrusel, grid, /productos, /portafolio y el
// detalle reutilizan exactamente la misma imagen.
//
// Tres estados, ninguno inventa una interfaz:
//  · con captura  → la imagen llena todo el cuerpo (object-fit: cover, alineada
//                   arriba: sin deformarse y sin márgenes)
//  · bloqueado    → proyecto sin versión pública ("Muy pronto"): fondo con el
//                   color del proyecto y textura, sin ninguna pantalla falsa. El
//                   candado lo pone quien lo usa (.pcard-lock).
//  · pendiente    → proyecto público sin captura (o que no cargó): aviso neutro.
//
// variant "card": alto fijo (carrusel y grids) · "detail": 16:9 completo (modal).
interface ProjectPreviewProps {
  project: Project;
  variant?: "card" | "detail";
  // Solo la tarjeta enfocada del carrusel (o la primera visible): carga ya.
  priority?: boolean;
}

export function ProjectPreview({ project, variant = "card", priority = false }: ProjectPreviewProps) {
  const [failed, setFailed] = useState(false);
  const shot = failed ? undefined : project.shot;
  const locked = project.status === "soon";
  const state = shot ? "shot" : locked ? "locked" : "pending";
  const sizes = variant === "detail" ? "(max-width: 900px) 92vw, 820px" : "(max-width: 560px) 240px, 304px";

  return (
    <div className={`pthumb pthumb--${variant} pthumb--${state} accent-${project.accent}`}>
      <div className="pthumb-bar" aria-hidden="true">
        <span className="pthumb-dot" />
        <span className="pthumb-dot" />
        <span className="pthumb-dot" />
        {variant === "detail" && project.appUrl && shot && (
          <span className="pthumb-url">{new URL(project.appUrl).host}</span>
        )}
      </div>
      <div className="pthumb-body">
        {shot ? (
          <img
            className="pthumb-img"
            src={shot.srcSm}
            srcSet={`${shot.srcSm} 960w, ${shot.src} 1920w`}
            sizes={sizes}
            width={shot.width}
            height={shot.height}
            alt={`Captura de ${project.name}`}
            loading={priority ? "eager" : "lazy"}
            // React 18 no reconoce `fetchPriority`: va en minúsculas para que llegue al DOM
            {...{ fetchpriority: priority ? "high" : "auto" }}
            decoding="async"
            draggable={false}
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="pthumb-note" aria-hidden="true">
            {state === "pending" ? "Vista previa pendiente" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
