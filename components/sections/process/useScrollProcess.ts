import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { PROCESS_TIMING as T, STEP_COUNT } from "./processConfig";
import type { ProcessApi, ProcessView, SceneState } from "./ProcessAnimationController";

// Controlador de reproducción para móvil: el scroll del usuario manda, no un
// temporizador. Sustituye (no convive con) al controlador automático de escritorio.
//
// · Una "línea de activación" fija en el viewport (TRIGGER × alto). La energía
//   llega exactamente hasta ella; cuando alcanza un nodo, ese nodo se enciende
//   y su escena se reproduce UNA vez (su propio temporizador la termina aunque
//   el usuario deje de deslizar).
// · Histéresis: un nodo solo se apaga si la línea retrocede MARGIN px por
//   encima de él → pequeños rebotes del scroll no reinician la escena.
// · El scroll nunca se captura: listener pasivo + un rAF por frame; --pos se
//   escribe directo en el DOM (sin re-render por frame).

const TRIGGER = 0.62; // fracción del alto del viewport donde "ocurre" el proceso
const MARGIN = 56; // px de retroceso necesarios para desactivar un nodo
export const SCROLL_TRAVEL_MS = 140; // suavizado corto de la energía (se detiene al parar el scroll)

const blank = (): ProcessView => ({
  active: 0,
  pulse: 0,
  travelMs: SCROLL_TRAVEL_MS,
  status: "idle",
  source: "auto",
  hovering: false,
  rewinding: false,
  scenes: Array(STEP_COUNT).fill("idle"),
  runs: Array(STEP_COUNT).fill(0),
  arrival: 0,
});

export function useScrollProcess(enabled: boolean, timeline: RefObject<HTMLElement>, nodes: RefObject<(HTMLElement | null)[]>) {
  const [view, setView] = useState<ProcessView>(blank);
  const replay = useRef<(i: number) => void>(() => {});

  // API con la misma forma que la de escritorio; el cursor no aplica, el toque repite la escena ya alcanzada.
  const api = useMemo<ProcessApi>(
    () => ({ setVisible() {}, enter() {}, leave() {}, tap: (i) => replay.current(i) }),
    []
  );

  useEffect(() => {
    const tl = timeline.current;
    if (!enabled || !tl) return;

    const N = STEP_COUNT;
    const reached: boolean[] = Array(N).fill(false);
    const scenes: SceneState[] = Array(N).fill("idle");
    const runs: number[] = Array(N).fill(0);
    const timers: (number | null)[] = Array(N).fill(null);
    let arrival = 0;
    let first = true;
    let raf = 0;

    const publish = () => {
      const top = reached.lastIndexOf(true);
      const at = Math.max(top, 0);
      setView({
        active: at,
        pulse: at,
        travelMs: SCROLL_TRAVEL_MS,
        status: top < 0 ? "idle" : scenes.includes("playing") ? "playing" : "complete",
        source: "auto",
        hovering: false,
        rewinding: false,
        scenes: [...scenes],
        runs: [...runs],
        arrival,
      });
    };

    const stop = (i: number) => {
      if (timers[i] !== null) window.clearTimeout(timers[i]!);
      timers[i] = null;
    };
    const play = (i: number) => {
      stop(i);
      scenes[i] = "playing";
      runs[i] += 1; // remonta la escena → arranca desde el principio
      timers[i] = window.setTimeout(() => {
        timers[i] = null;
        if (scenes[i] === "playing") {
          scenes[i] = "done";
          publish();
        }
      }, T.scenes[i]);
    };

    const evaluate = () => {
      raf = 0;
      const ys: number[] = [];
      for (let i = 0; i < N; i++) {
        const n = nodes.current?.[i];
        if (!n) return;
        const r = n.getBoundingClientRect();
        ys.push(r.top + r.height / 2);
      }
      const trigger = window.innerHeight * TRIGGER;
      const span = ys[N - 1] - ys[0];
      const pos = span > 0 ? Math.min(1, Math.max(0, (trigger - ys[0]) / span)) : 0;
      tl.style.setProperty("--pos", pos.toFixed(4));

      let changed = first;
      const lastNow = ys.reduce((a, y, i) => (trigger >= y ? i : a), -1);
      for (let i = 0; i < N; i++) {
        if (!reached[i] && trigger >= ys[i]) {
          reached[i] = true;
          changed = true;
          arrival += 1;
          // carga a mitad de página: lo ya superado queda en su estado final; solo el actual se reproduce
          if (first && i < lastNow) scenes[i] = "done";
          else play(i);
        } else if (reached[i] && trigger < ys[i] - MARGIN) {
          reached[i] = false;
          changed = true;
          stop(i);
          scenes[i] = "idle"; // al volver a alcanzarlo se reproduce de nuevo
        }
      }
      first = false;
      if (changed) publish();
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(evaluate);
    };

    replay.current = (i) => {
      if (!reached[i]) return;
      play(i);
      publish();
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(tl);
    schedule();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      timers.forEach((_, i) => stop(i));
      replay.current = () => {};
      tl.style.removeProperty("--pos");
    };
  }, [enabled, timeline, nodes]);

  return { view, api };
}
