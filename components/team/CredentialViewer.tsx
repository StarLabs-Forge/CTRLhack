import { useEffect, useRef, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { CATEGORY_LABELS, formatCredentialDate, type Credential } from "../../data/team";

// Visor ampliado de un certificado: imagen original en grande (con su
// proporción), nombre, institución, fecha, código y enlace de verificación.
// Cierra con Escape, la X o tocando fuera; flechas del teclado o deslizar con
// el dedo para pasar al siguiente. Mientras está abierto, la página no se mueve.
interface Props {
  list: Credential[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}

export function CredentialViewer({ list, index, onIndex, onClose }: Props) {
  const c = list[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const go = (d: 1 | -1) => onIndex((index + d + list.length) % list.length);

  useEffect(() => {
    const returnTo = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      returnTo?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onIndex((index + 1) % list.length);
      else if (e.key === "ArrowLeft") onIndex((index - 1 + list.length) % list.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, list.length, onClose, onIndex]);

  // precarga el siguiente para que pasar de uno a otro sea instantáneo
  useEffect(() => {
    const next = list[(index + 1) % list.length];
    const img = new Image();
    img.src = next.image.src;
  }, [index, list]);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y)) go(dx < 0 ? 1 : -1);
  };

  return createPortal(
    <div className="cred-viewer-overlay" onClick={onClose}>
      <div
        className="cred-viewer"
        role="dialog"
        aria-modal="true"
        aria-label={`Certificado: ${c.title}`}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onDown}
        onPointerUp={onUp}
      >
        <button type="button" className="cred-viewer-close" onClick={onClose} aria-label="Cerrar" ref={closeRef}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <figure className="cred-viewer-figure" key={c.id}>
          <img src={c.image.src} width={c.image.width} height={c.image.height} alt={`Certificado ${c.title}, emitido por ${c.issuer}`} decoding="async" draggable={false} />
        </figure>

        <div className="cred-viewer-info">
          <span className="cred-cat">{CATEGORY_LABELS[c.category]}</span>
          <h4>{c.title}</h4>
          <dl>
            <div>
              <dt>Institución</dt>
              <dd>{c.issuer}</dd>
            </div>
            <div>
              <dt>Emisión</dt>
              <dd>
                <time dateTime={c.date}>{formatCredentialDate(c.date)}</time>
              </dd>
            </div>
            {c.code && (
              <div className="cred-viewer-code">
                <dt>Código</dt>
                <dd>{c.code}</dd>
              </div>
            )}
          </dl>
          <div className="cred-viewer-actions">
            {c.verify && (
              <a className="btn" href={c.verify.url} target="_blank" rel="noopener noreferrer">
                {c.verify.label}
                <span aria-hidden="true"> ↗</span>
              </a>
            )}
            <span className="cred-viewer-count" aria-live="polite">
              {index + 1} / {list.length}
            </span>
            <div className="cred-viewer-nav">
              <button type="button" className="creds-arrow" onClick={() => go(-1)} aria-label="Certificado anterior">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" className="creds-arrow" onClick={() => go(1)} aria-label="Certificado siguiente">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
