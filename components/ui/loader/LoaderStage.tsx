import { forwardRef, useId } from "react";
import { Logo } from "../Logo";
import { KeyDefs } from "./KeyDefs";
import { HAIRLINES, JOIN_POINT, PIECES, SEAMS } from "./fractureGeometry";
import "./BrandLoader.css";

// Fases de la secuencia (solo estructura; la lógica vive en useLoaderSequence):
//  loading → las 4 piezas se acercan y se alejan; la barra avanza
//  joined  → encajan, destello en las uniones
//  brand   → aparecen < y >, el imagotipo queda completo
//  exit    → fundido hacia la interfaz
export type LoaderPhase = "loading" | "joined" | "brand" | "exit";

interface LoaderStageProps {
  phase: LoaderPhase;
  /** Sin progreso real (p. ej. el Suspense entre rutas): las piezas laten y la barra desliza. */
  indeterminate?: boolean;
  className?: string;
}

// Escena del loader: tecla fracturada + chevrones + barra. Es PRESENTACIONAL:
// el progreso llega como variable CSS --p (0…1) escrita sobre el nodo raíz
// (por ref, fuera de React) para no re-renderizar 60 veces por segundo.
export const LoaderStage = forwardRef<HTMLDivElement, LoaderStageProps>(function LoaderStage({ phase, indeterminate = false, className = "" }, ref) {
  const p = `bl${useId().replace(/:/g, "")}-`;
  return (
    <div ref={ref} className={`bl-root bl--${phase}${indeterminate ? " bl--indeterminate" : ""} ${className}`.trim()}>
      <KeyDefs p={p} />
      <div className="bl-stage" aria-hidden="true">
        {/* chevrones < > del isotipo oficial: sin tecla, aparecen al final */}
        <Logo className="bl-chevrons" />
        <div className="bl-halo" />

        <div className="bl-key">
          {PIECES.map((piece) => (
            <div
              className={`bl-piece bl-piece--${piece.id}`}
              key={piece.id}
              style={
                {
                  "--dx": piece.dir[0],
                  "--dy": piece.dir[1],
                  "--rot": piece.rot,
                  "--fd": `${piece.floatS}s`,
                  "--fdelay": `${piece.floatDelay}s`,
                  transformOrigin: piece.origin,
                } as React.CSSProperties
              }
            >
              <div className="bl-piece-in">
                <svg viewBox="0 0 1774 887" preserveAspectRatio="xMidYMid meet">
                  <g clipPath={`url(#${p}clip-${piece.id})`}>
                    <use href={`#${p}key`} />
                    {/* borde de fractura: bisel iluminado, contenido dentro de la silueta */}
                    <g className="bl-edge" mask={`url(#${p}silhouette)`} fill="none" strokeLinejoin="miter">
                      <polyline points={piece.edge} stroke="#1a0a03" strokeOpacity=".75" strokeWidth="14" />
                      <polyline points={piece.edge} stroke="#ffc98a" strokeOpacity=".9" strokeWidth="5" />
                    </g>
                  </g>
                </svg>
              </div>
            </div>
          ))}
          {/* tecla íntegra (sin recortes): sustituye a las piezas una vez encajadas, sin costuras de antialiasing */}
          <svg className="bl-whole" viewBox="0 0 1774 887" preserveAspectRatio="xMidYMid meet">
            <use href={`#${p}key`} />
          </svg>
          {/* grietas secundarias, apenas insinuadas */}
          <svg className="bl-hairlines" viewBox="0 0 1774 887" preserveAspectRatio="xMidYMid meet">
            <g mask={`url(#${p}silhouette)`} fill="none" stroke="#1a0a03" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity=".7">
              {HAIRLINES.map((d) => <path key={d} d={d} />)}
            </g>
          </svg>
          {/* destello que recorre las uniones al encajar */}
          <svg className="bl-seams" viewBox="0 0 1774 887" preserveAspectRatio="xMidYMid meet">
            <g mask={`url(#${p}silhouette)`} fill="none" strokeLinecap="round" strokeLinejoin="round">
              {SEAMS.map((d) => <path key={`w${d}`} className="bl-seam bl-seam--wide" d={d} pathLength={1} stroke="#ff9d45" strokeWidth="16" />)}
              {SEAMS.map((d) => <path key={`n${d}`} className="bl-seam bl-seam--core" d={d} pathLength={1} stroke="#fff3dc" strokeWidth="5" />)}
            </g>
          </svg>
          <div className="bl-flash" style={{ left: `${JOIN_POINT.x}%`, top: `${JOIN_POINT.y}%` }} />
        </div>
      </div>

      <div className="bl-meta" aria-hidden="true">
        <div className="bl-bar"><span className="bl-bar-fill" /></div>
        <div className="bl-label">
          <span className="bl-label-a">Initializing</span>
          <span className="bl-label-b">CtrlHack</span>
        </div>
      </div>
    </div>
  );
});
