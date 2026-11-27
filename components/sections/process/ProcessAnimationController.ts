import { useEffect, useRef, useState } from "react";
import { PROCESS_TIMING as T, STEP_COUNT } from "./processConfig";

export type SceneState = "idle" | "playing" | "done";
/** idle: sin arrancar · transition: la energía viaja / el nodo se enciende ·
 *  playing: una escena se reproduce · complete: escena(s) terminada(s) en espera ·
 *  paused: sección fuera de pantalla. */
export type ProcessStatus = "idle" | "transition" | "playing" | "complete" | "paused";
export type ProcessSource = "auto" | "user";

export interface ProcessView {
  active: number;
  pulse: number; // índice del nodo donde está la energía
  travelMs: number;
  status: ProcessStatus;
  source: ProcessSource;
  hovering: boolean;
  rewinding: boolean;
  scenes: SceneState[];
  runs: number[]; // contador por escena: cambia → la escena se remonta y reinicia
  arrival: number; // contador: cambia cada vez que la energía llega a un nodo
}

export interface ProcessApi {
  setVisible(v: boolean): void;
  enter(i: number): void;
  leave(i: number): void;
  tap(i: number): void;
}

const initial = (reduced: boolean): ProcessView => ({
  active: reduced ? STEP_COUNT - 1 : 0,
  pulse: reduced ? STEP_COUNT - 1 : 0,
  travelMs: 0,
  status: reduced ? "complete" : "idle",
  source: "auto",
  hovering: false,
  rewinding: false,
  scenes: Array(STEP_COUNT).fill(reduced ? "done" : "idle"),
  runs: Array(STEP_COUNT).fill(0),
  arrival: 0,
});

// Máquina de estados única. Hay UN solo temporizador vivo a la vez (`after`
// siempre cancela el anterior): imposible que dos etapas se desincronicen, y
// un cambio rápido de etapa cancela la transición previa por construcción.
function createController(set: (fn: (v: ProcessView) => ProcessView) => void, reduced: boolean) {
  let timer: number | null = null;
  let started = false;
  let visible = false;
  let hovering = false;
  let mode: ProcessStatus = reduced ? "complete" : "idle";
  let source: ProcessSource = "auto";
  let active = 0;
  let pulse = 0;
  let playStart = 0;
  let remaining = 0;

  const patch = (p: Partial<ProcessView>) => set((v) => ({ ...v, ...p }));
  const clear = () => {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
  };
  const after = (ms: number, fn: () => void) => {
    clear();
    timer = window.setTimeout(() => {
      timer = null;
      fn();
    }, ms);
  };
  const setMode = (m: ProcessStatus) => {
    mode = m;
    patch({ status: m });
  };
  const setScene = (i: number, s: SceneState, bumpRun = false) =>
    set((v) => ({
      ...v,
      scenes: v.scenes.map((x, k) => (k === i ? s : x)),
      runs: bumpRun ? v.runs.map((x, k) => (k === i ? x + 1 : x)) : v.runs,
    }));

  function goTo(i: number, src: ProcessSource) {
    clear();
    // una escena a medias que se cancela salta a su último cuadro (nunca queda "playing" huérfana)
    set((v) => (v.scenes.some((s, k) => s === "playing" && k !== i) ? { ...v, scenes: v.scenes.map((s, k) => (s === "playing" && k !== i ? ("done" as SceneState) : s)) } : v));
    active = i;
    source = src;
    const dist = Math.abs(i - pulse);
    const travel = dist === 0 ? 0 : Math.min(T.travelMax, T.travelMin + (dist - 1) * T.travelPerExtraStep);
    pulse = i;
    mode = "transition";
    patch({ active: i, pulse: i, travelMs: travel, status: "transition", source: src });
    after(travel, () => {
      set((v) => ({ ...v, arrival: v.arrival + 1 })); // expansión circular en el nodo
      after(T.nodeActivate, () => play(i));
    });
  }

  function play(i: number) {
    setScene(i, "playing", true);
    setMode("playing");
    playStart = performance.now();
    remaining = T.scenes[i];
    after(remaining, () => finish(i));
  }

  function finish(i: number) {
    setScene(i, "done");
    if (hovering) {
      setMode("complete"); // el cursor sigue dentro: se queda en su resultado
      return;
    }
    next(i);
  }

  function next(i: number) {
    if (i < STEP_COUNT - 1) {
      goTo(i + 1, "auto");
      return;
    }
    source = "auto";
    mode = "complete";
    patch({ status: "complete", source: "auto" });
    after(T.hold, rewind);
  }

  // Reinicio suave: atenúa escenas, la energía retrocede, se limpian y arranca de nuevo.
  function rewind() {
    pulse = 0;
    mode = "transition";
    patch({ rewinding: true, pulse: 0, travelMs: T.rewind, status: "transition", hovering: false });
    after(T.rewind / 2, () => {
      set((v) => ({ ...v, scenes: v.scenes.map(() => "idle" as SceneState) }));
      after(T.rewind / 2, () => {
        patch({ rewinding: false });
        goTo(0, "auto");
      });
    });
  }

  return {
    setVisible(v: boolean) {
      if (reduced || v === visible) return;
      visible = v;
      if (!v) {
        if (!started) return;
        if (mode === "playing") remaining = Math.max(0, remaining - (performance.now() - playStart));
        clear();
        patch({ status: "paused" });
        return;
      }
      if (!started) {
        started = true;
        goTo(0, "auto");
        return;
      }
      // reanudar según dónde se pausó
      if (mode === "playing") {
        playStart = performance.now();
        patch({ status: "playing" });
        after(remaining, () => finish(active));
      } else if (mode === "complete") {
        patch({ status: "complete" });
        if (active === STEP_COUNT - 1 && !hovering) after(T.hold / 2, rewind);
        else if (!hovering) after(T.resumeAfterLeave, () => next(active));
      } else {
        goTo(active, source);
      }
    },
    enter(i: number) {
      if (reduced || !started) return;
      hovering = true;
      patch({ hovering: true });
      // misma escena ya en curso: solo pasa a ser "del usuario", sin reiniciarla
      if (i === active && (mode === "playing" || mode === "transition")) {
        source = "user";
        patch({ source: "user" });
        return;
      }
      if (i === active && mode === "complete" && source === "user") return;
      goTo(i, "user");
    },
    leave(i: number) {
      if (!hovering) return;
      hovering = false;
      patch({ hovering: false });
      if (mode === "complete" && source === "user" && i === active && visible) {
        after(T.resumeAfterLeave, () => next(active));
      }
    },
    tap(i: number) {
      if (reduced || !started) return;
      hovering = false;
      patch({ hovering: false });
      goTo(i, "user");
    },
    dispose() {
      clear();
      started = false;
      visible = false;
      hovering = false;
    },
  };
}

export function useProcessController(reduced: boolean): { view: ProcessView; api: ProcessApi } {
  const [view, setView] = useState<ProcessView>(() => initial(reduced));
  const ctl = useRef<ReturnType<typeof createController>>();
  if (!ctl.current) ctl.current = createController(setView, reduced);
  useEffect(() => () => ctl.current?.dispose(), []);
  return { view, api: ctl.current as ProcessApi };
}
