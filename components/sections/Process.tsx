import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { entryOutOfView } from "../ui/entryOutOfView";
import { EnergyPulse, type TimelineGeo } from "./process/EnergyPulse";
import { useProcessController } from "./process/ProcessAnimationController";
import { ProcessStep } from "./process/ProcessStep";
import { PROCESS_STEPS, STEP_COUNT } from "./process/processConfig";
import "./Process.css";

// "Cómo trabajamos": cinco etapas con una escena animada cada una, unidas por
// una línea de energía. Un único controlador (ProcessAnimationController) manda
// el recorrido; aquí solo se mide la geometría, se observa la visibilidad y se
// pintan sus estados.
export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLSpanElement | null)[]>([]);
  const [reduced] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [entered, setEntered] = useState(reduced);
  const [geo, setGeo] = useState<TimelineGeo>({ axis: "h", x0: 0, y0: 0, len: 0 });
  const { view, api } = useProcessController(reduced);

  // Visible ≥35 % → arranca/reanuda; fuera por completo → pausa (sin reiniciar).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          setEntered(true);
          api.setVisible(true);
        } else if (entryOutOfView(entry)) api.setVisible(false);
      },
      { threshold: [0, 0.35] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [api, reduced]);

  // Centros de los nodos por layout (offset*, inmune a transform): la energía
  // sigue a la distribución real, horizontal o vertical.
  const measure = useCallback(() => {
    const pts = nodes.current.map((n) => {
      if (!n) return null;
      const step = n.offsetParent as HTMLElement | null;
      return { x: n.offsetLeft + n.offsetWidth / 2 + (step?.offsetLeft ?? 0), y: n.offsetTop + n.offsetHeight / 2 + (step?.offsetTop ?? 0) };
    });
    const a = pts[0];
    const b = pts[STEP_COUNT - 1];
    if (!a || !b) return;
    const axis = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y) ? "h" : "v";
    const next: TimelineGeo = { axis, x0: Math.round(a.x), y0: Math.round(a.y), len: Math.round(axis === "h" ? b.x - a.x : b.y - a.y) };
    setGeo((g) => (g.axis === next.axis && g.x0 === next.x0 && g.y0 === next.y0 && g.len === next.len ? g : next));
  }, []);

  useLayoutEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const cls = ["timeline", entered ? "in" : "", view.hovering || view.source === "user" ? "is-interacting" : "", view.rewinding ? "is-rewinding" : ""].filter(Boolean).join(" ");
  const style = {
    "--x0": `${geo.x0}px`,
    "--y0": `${geo.y0}px`,
    "--len": `${geo.len}px`,
    "--pos": view.pulse / (STEP_COUNT - 1),
    "--travel": `${view.travelMs}ms`,
  } as CSSProperties;

  return (
    <div className="process" data-paused={view.status === "paused"} data-status={view.status}>
      <div className={`timeline ${cls}`.trim()} ref={ref} data-axis={geo.axis} style={style}>
        <EnergyPulse geo={geo} />
        {PROCESS_STEPS.map((step, i) => (
          <ProcessStep
            key={step.num}
            index={i}
            view={view}
            api={api}
            delay={entered ? `${160 + i * 130}ms` : "0ms"}
            ref={(n) => {
              nodes.current[i] = n;
            }}
          />
        ))}
      </div>
    </div>
  );
}
