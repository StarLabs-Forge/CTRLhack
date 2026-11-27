import { useEffect, useRef, useState, type RefObject } from "react";
import type { LoaderPhase } from "./LoaderStage";

// Tiempos de la secuencia final (ms). Centralizados para ajustarlos en un sitio.
export const LOADER_TIMING = {
  /** Duración mínima visible: que la animación se lea aunque todo esté en caché. 0 = sin mínimo. */
  minMs: 1400,
  /** Encaje + destello antes de que aparezcan los símbolos < >. */
  joinToBrand: 850,
  /** Imagotipo completo en pantalla antes del fundido (incluye la entrada de < >). */
  brandHold: 1500,
  /** Fundido hacia la interfaz. */
  exit: 600,
} as const;

interface Options {
  /** Señales REALES de carga (load, fuentes, chunk de la vista). */
  waitFor: Promise<unknown>[];
  minMs?: number;
  /** Se llama al empezar el fundido: ahí conviene montar la interfaz. */
  onReveal: () => void;
  onDone: () => void;
}

// Progreso = señales reales de carga + un avance simulado natural (asintótico)
// que sostiene la barra mientras llegan. La barra nunca pasa de ~92 % sin que
// todo esté listo; al estarlo, completa y arranca la secuencia final. El valor
// se escribe como --p en el nodo (sin re-render por fotograma).
export function useLoaderSequence(rootRef: RefObject<HTMLElement>, { waitFor, minMs = LOADER_TIMING.minMs, onReveal, onDone }: Options): LoaderPhase {
  const [phase, setPhase] = useState<LoaderPhase>("loading");
  const cb = useRef({ onReveal, onDone });
  cb.current = { onReveal, onDone };

  // 1) progreso
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let done = 0;
    waitFor.forEach((pr) => pr.then(() => void done++, () => void done++));
    const t0 = performance.now();
    let last = t0;
    let shown = 0;
    let raf = 0;
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      const elapsed = now - t0;
      const real = waitFor.length ? done / waitFor.length : 1;
      const ready = real >= 1 && elapsed >= minMs;
      // avance simulado: ~89 % al cumplirse el mínimo, tope 92 % hasta estar listo
      const sim = 1 - Math.exp(-elapsed / Math.max(400, minMs * 0.45));
      const target = ready ? 1 : Math.min(0.92, Math.max(sim * 0.92, real * 0.92));
      shown += (target - shown) * (1 - Math.exp(-dt / (ready ? 110 : 260)));
      if (ready && shown > 0.995) {
        root.style.setProperty("--p", "1");
        setPhase("joined");
        return;
      }
      root.style.setProperty("--p", shown.toFixed(4));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // waitFor es estable (creado una vez por el llamador)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) fases posteriores: un único temporizador a la vez
  useEffect(() => {
    let id: number | undefined;
    if (phase === "joined") id = window.setTimeout(() => setPhase("brand"), LOADER_TIMING.joinToBrand);
    else if (phase === "brand") id = window.setTimeout(() => setPhase("exit"), LOADER_TIMING.brandHold);
    else if (phase === "exit") {
      cb.current.onReveal();
      id = window.setTimeout(() => cb.current.onDone(), LOADER_TIMING.exit);
    }
    return () => window.clearTimeout(id);
  }, [phase]);

  return phase;
}
