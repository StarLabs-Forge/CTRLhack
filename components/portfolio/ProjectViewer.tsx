import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "../../data/projectCatalog";
import "./ProjectViewer.css";

// Visor ampliado de un proyecto, en un marco de navegador. Solo existe mientras
// el usuario lo pide, así que NUNCA hay más de un <iframe> en la página y
// ninguno se carga antes de hacer clic.
//
//  · project.viewer === "iframe": la app permite incrustarse (se midió su
//    X-Frame-Options / CSP frame-ancestors al capturar) → vista interactiva real.
//    La captura queda debajo como póster: el iframe es transparente mientras
//    carga, así no hay un hueco en blanco. No se espera al evento `load`:
//    páginas con vídeo/streaming (p. ej. CHECK) no lo disparan nunca.
//  · project.viewer === "static": la app NO deja incrustarse → se muestra la
//    captura ampliada. No se intenta el iframe: un bloqueo por X-Frame-Options
//    no es detectable desde aquí y solo dejaría un marco vacío.
//
// Controles: ampliar/reducir · pantalla completa (si el navegador la ofrece) ·
// abrir en pestaña nueva · cerrar (también Escape y clic fuera).
interface ProjectViewerProps {
  project: Project;
  onClose: () => void;
}

export function ProjectViewer({ project, onClose }: ProjectViewerProps) {
  const [large, setLarge] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  // "listo" = el iframe terminó de cargar O pasó el plazo (lo que ocurra primero).
  const [ready, setReady] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const canFullscreen = typeof document !== "undefined" && Boolean(document.fullscreenEnabled);
  const interactive = project.viewer === "iframe" && Boolean(project.appUrl);

  useEffect(() => {
    if (!interactive) return;
    const timer = window.setTimeout(() => setReady(true), 4000);
    return () => window.clearTimeout(timer);
  }, [interactive]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frameRef.current?.requestFullscreen?.().catch(() => undefined);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);

    // Escape cierra SOLO el visor (captura + stopImmediatePropagation): si el
    // modal de detalle está debajo, no se cierra con él. En pantalla completa
    // Escape lo gestiona el navegador (sale de pantalla completa).
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.fullscreenElement) {
        event.stopImmediatePropagation();
        onClose();
        return;
      }
      // trampa de foco mínima: Tab circula dentro del visor
      if (event.key === "Tab" && frameRef.current) {
        const items = frameRef.current.parentElement?.querySelectorAll<HTMLElement>("button, a[href]");
        if (!items?.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown, true);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      if (document.fullscreenElement) void document.exitFullscreen();
      opener?.focus?.();
    };
  }, [onClose]);

  if (!project.appUrl || !project.viewer) return null;
  const host = new URL(project.appUrl).host;

  return createPortal(
    <div className="pviewer-overlay" onClick={onClose}>
      <div
        className={`pviewer${large ? " is-large" : ""}${fullscreen ? " is-fullscreen" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Vista ampliada de ${project.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pviewer-bar">
          <span className="pviewer-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="pviewer-url" title={project.appUrl}>
            {host}
          </span>
          <span className="pviewer-mode">{interactive ? "Interactivo" : "Captura"}</span>

          <div className="pviewer-actions">
            <button
              type="button"
              className="pviewer-btn pviewer-btn--size"
              onClick={() => setLarge((value) => !value)}
              aria-pressed={large}
              aria-label={large ? "Reducir vista" : "Ampliar vista"}
              title={large ? "Reducir" : "Ampliar"}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {large ? (
                  <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </button>
            {canFullscreen && (
              <button
                type="button"
                className="pviewer-btn"
                onClick={toggleFullscreen}
                aria-label={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                title="Pantalla completa"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M8 9h8v6H8z" stroke="currentColor" strokeWidth="1.5" opacity=".6" />
                </svg>
              </button>
            )}
            <a
              className="pviewer-btn"
              href={project.appUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir en una pestaña nueva"
              title="Abrir en una pestaña nueva"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <button ref={closeRef} type="button" className="pviewer-btn" onClick={onClose} aria-label="Cerrar" title="Cerrar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="pviewer-stage" ref={frameRef}>
          {/* la captura es el fondo: poster mientras carga el iframe, o la vista entera si no se puede incrustar */}
          {project.shot && (
            <img className="pviewer-shot" src={project.shot.src} alt={`Captura de ${project.name}`} decoding="async" />
          )}
          {interactive && (
            <iframe
              className={`pviewer-frame${ready ? " is-ready" : ""}`}
              src={project.appUrl}
              title={`${project.name} — vista interactiva`}
              loading="lazy"
              referrerPolicy="no-referrer"
              // sin allow-top-navigation: la app no puede sacar al usuario de CTRLHACK por su cuenta
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              onLoad={() => setReady(true)}
            />
          )}
          {interactive && !ready && <span className="pviewer-loading">Cargando…</span>}
        </div>

        {!interactive && (
          <p className="pviewer-note">
            Esta aplicación no permite mostrarse dentro de otras páginas, así que ves una captura. Para usarla, ábrela en
            una pestaña nueva.
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
