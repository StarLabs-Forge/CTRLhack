import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { ProjectThumb } from "./ProjectThumb";
import { Tag } from "../ui/Tag";
import { CaseModal } from "./CaseModal";
import { portfolioProjects } from "../../data/portfolioProjects";
import { caseStudies } from "../../data/caseStudies";
import { clientCases } from "../../data/clientCases";
import "./ProjectCard.css";
import "./ProjectDeck.css";

// Vitrina "deck" del Home: recorre TODOS los proyectos de CTRLHACK (productos
// propios y trabajos para clientes) en un carrusel 3D tipo glass — es el
// tráiler, no la película. Muestra nombre + una frase + estado, nunca el
// detalle técnico (eso vive en /portafolio, que sigue siendo página propia).
// No filtra por `kind`: a diferencia de /portafolio (que separa "Productos
// propios" de "Trabajos para clientes" en dos secciones) y de /productos
// (que solo muestra kind:"product"), acá todo entra mezclado a propósito —
// es la vitrina general, no el catálogo curado. El nav del header manda
// "Portafolio" acá (sección, no ruta) porque el sitio se presenta como
// landing de una sola página; /portafolio queda para quien pide
// explícitamente profundizar.
// Pendiente a futuro (no implementado): cuando CTRLHACK tenga video propio
// (canal YouTube/TikTok) explicando qué es CHECK, la tarjeta activa podría
// llevar un botón "Ver video" tipo trailer sobre el thumb — dejar espacio
// para eso al tocar este componente de nuevo.
const DRAG_THRESHOLD = 40;
const CARD_STEP = 198; // separación horizontal entre tarjetas (px)

export function ProjectDeck() {
  const count = portfolioProjects.length;
  const [active, setActive] = useState(0);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const openProject = portfolioProjects.find((p) => p.slug === openSlug);
  const openCaseStudy = openProject?.caseStudySlug
    ? caseStudies.find((c) => c.slug === openProject.caseStudySlug)
    : undefined;
  const openClientCase = openProject?.clientCaseSlug
    ? clientCases.find((c) => c.slug === openProject.clientCaseSlug)
    : undefined;
  const shellRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ dragging: false, startX: 0, delta: 0, lastX: 0, lastT: 0, velocity: 0, moved: false });
  // Tilt/glare solo con puntero fino y sin reduced-motion (mismo criterio que useMagnetic).
  const canTilt = useRef(false);
  useEffect(() => {
    canTilt.current =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const goTo = (i: number) => setActive(((i % count) + count) % count);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(active - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(active + 1); }
    };
    shell.addEventListener("keydown", onKeyDown);
    return () => shell.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    // Si el press empieza sobre un link/botón (p.ej. "Ver más"), no capturamos
    // el puntero: setPointerCapture en el shell retarga también el click de
    // compatibilidad, y el botón nunca responde.
    if ((e.target as HTMLElement).closest("a, button")) return;
    drag.current = { dragging: true, startX: e.clientX, delta: 0, lastX: e.clientX, lastT: e.timeStamp, velocity: 0, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.dragging) return;
    d.delta = e.clientX - d.startX;
    // Velocidad suavizada (px/ms) para decidir cuántas tarjetas "lanza" el gesto.
    const dt = e.timeStamp - d.lastT;
    if (dt > 0) d.velocity = d.velocity * 0.6 + ((e.clientX - d.lastX) / dt) * 0.4;
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
    if (Math.abs(d.delta) > 5 && !d.moved) {
      d.moved = true;
      shellRef.current?.classList.add("is-dragging");
    }
    // El carrusel sigue al dedo en vivo; al soltar, el CSS hace el snap con easing.
    shellRef.current?.style.setProperty("--drag", `${d.delta * 0.6}px`);
  };
  const onPointerUp = () => {
    const d = drag.current;
    if (!d.dragging) return;
    d.dragging = false;
    const shell = shellRef.current;
    shell?.classList.remove("is-dragging");
    shell?.style.removeProperty("--drag");
    // Inercia: la distancia proyectada suma el impulso del gesto (≈180ms de velocidad).
    const projected = d.delta + d.velocity * 180;
    let steps = Math.round(-projected / CARD_STEP);
    if (steps === 0 && Math.abs(projected) > DRAG_THRESHOLD) steps = projected > 0 ? -1 : 1;
    steps = Math.max(-2, Math.min(2, steps));
    if (steps !== 0) goTo(active + steps);
  };

  // Tilt 3D + brillo que sigue al cursor, solo en la tarjeta activa.
  const onCardMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!canTilt.current || drag.current.dragging) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--tx", `${((0.5 - y) * 9).toFixed(2)}deg`);
    el.style.setProperty("--ty", `${((x - 0.5) * 11).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
  };
  const resetTilt = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    ["--tx", "--ty", "--gx", "--gy"].forEach((v) => el.style.removeProperty(v));
  };

  return (
    <div className="deck">
      <div
        className="deck-shell"
        ref={shellRef}
        tabIndex={0}
        role="group"
        aria-roledescription="carrusel"
        aria-label="Proyectos CTRLHACK"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="deck-glow"
          style={{ background: `radial-gradient(circle, var(--${portfolioProjects[active].accent}), transparent 65%)` }}
          aria-hidden="true"
        />

        {portfolioProjects.map((project, i) => {
          let offset = i - active;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;
          const abs = Math.abs(offset);
          const isActive = offset === 0;
          const isSoon = project.status === "soon";
          const isClient = project.kind === "client";
          const canOpenDetail = !isSoon && Boolean(project.caseStudySlug || project.clientCaseSlug);

          const style: CSSProperties =
            abs > 2
              ? {
                  opacity: 0,
                  transform: `translate3d(calc(${offset > 0 ? 520 : -520}px + var(--drag, 0px)),0,-400px) scale(.6)`,
                  filter: "blur(6px)",
                  zIndex: 0,
                  pointerEvents: "none",
                }
              : {
                  transform: `translate3d(calc(${offset * CARD_STEP}px + var(--drag, 0px)),0,${-abs * 140}px) rotateX(${
                    isActive ? "var(--tx, 0deg)" : "0deg"
                  }) rotateY(${isActive ? `calc(var(--ty, 0deg) + ${offset * -8}deg)` : `${offset * -8}deg`}) scale(${
                    isActive ? 1 : 0.82 - (abs - 1) * 0.08
                  })`,
                  opacity: Math.max(isActive ? 1 : 0.55 - (abs - 1) * 0.15, 0.15),
                  filter: `blur(${isActive ? 0 : 2 + abs * 1.5}px)`,
                  zIndex: 10 - abs,
                };

          return (
            <div
              key={project.slug}
              className={`deck-card${isActive ? " is-active" : ""}${isSoon ? " pcard-soon" : ""}`}
              style={style}
              aria-hidden={!isActive}
              onClick={() => !isActive && !drag.current.moved && goTo(i)}
              onPointerMove={isActive ? onCardMove : undefined}
              onPointerLeave={isActive ? resetTilt : undefined}
            >
              <div className="pcard-thumb-wrap">
                <ProjectThumb accent={project.accent} name={project.name} />
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

              <div className="deck-card-body">
                <div className="pcard-head">
                  <h3>{project.name}</h3>
                  <Tag variant={isSoon ? "beta" : isClient ? "client" : "on"}>{project.statusLabel}</Tag>
                </div>
                <p className="pcard-pitch">
                  {isSoon ? "Estamos construyendo esto — todavía no hay nada para mostrar." : project.pitch}
                </p>
                <div className="pcard-actions deck-cta">
                  <button
                    type="button"
                    className="btn"
                    tabIndex={isActive ? 0 : -1}
                    disabled={!canOpenDetail}
                    onClick={() => canOpenDetail && setOpenSlug(project.slug)}
                  >
                    Ver más
                  </button>
                  {project.appUrl ? (
                    <a
                      className="btn-ghost"
                      href={project.appUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={isActive ? 0 : -1}
                    >
                      Ir a la app
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="btn-ghost"
                      disabled
                      tabIndex={-1}
                      title={isSoon ? "Todavía no está disponible" : "Publicamos el enlace apenas esté disponible"}
                    >
                      Ir a la app
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="deck-controls">
        <button type="button" className="deck-arrow" aria-label="Proyecto anterior" onClick={() => goTo(active - 1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="deck-ticks">
          {portfolioProjects.map((project, i) => (
            <button
              key={project.slug}
              type="button"
              className={`deck-tick${i === active ? " active" : ""}`}
              style={{ "--tick-color": `var(--${project.accent})` } as CSSProperties}
              aria-label={`Ir a ${project.name}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        <button type="button" className="deck-arrow" aria-label="Siguiente proyecto" onClick={() => goTo(active + 1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      {(openCaseStudy || openClientCase) && (
        <CaseModal caseStudy={openCaseStudy} clientCase={openClientCase} onClose={() => setOpenSlug(null)} />
      )}
    </div>
  );
}
