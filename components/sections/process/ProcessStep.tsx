import { forwardRef, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent, type MouseEvent } from "react";
import { PROCESS_STEPS, PROCESS_TIMING } from "./processConfig";
import type { ProcessApi, ProcessView } from "./ProcessAnimationController";
import { ConstructionScene, ConversationScene, LaunchScene, PlanningScene, TestingScene } from "./scenes/scenes";
import "./scenes/scenes.css";

const SCENES = [ConversationScene, PlanningScene, ConstructionScene, TestingScene, LaunchScene];

interface Props {
  index: number;
  view: ProcessView;
  api: ProcessApi;
  delay: string;
}

// Una etapa: escena animada + nodo + texto. Recibe SOLO el estado ya decidido
// por el controlador; sus únicos efectos propios son el parallax del cursor
// (variables CSS escritas por rAF, sin pasar por React) y reenviar eventos.
export const ProcessStep = forwardRef<HTMLSpanElement, Props>(function ProcessStep({ index, view, api, delay }, nodeRef) {
  const step = PROCESS_STEPS[index];
  const Scene = SCENES[index];
  const el = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const state = view.scenes[index];
  const isActive = view.active === index && view.status !== "idle";

  const setTilt = (x: number, y: number) => {
    el.current?.style.setProperty("--tx", x.toFixed(3));
    el.current?.style.setProperty("--ty", y.toFixed(3));
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || !el.current) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const r = el.current!.getBoundingClientRect();
      setTilt(Math.max(-1, Math.min(1, ((clientX - r.left) / r.width - 0.5) * 2)), Math.max(-1, Math.min(1, ((clientY - r.top) / r.height - 0.5) * 2)));
    });
  };
  const onEnter = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    api.enter(index);
  };
  const onLeave = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    cancelAnimationFrame(raf.current);
    setTilt(0, 0);
    api.leave(index);
  };
  // táctil y teclado: una pulsación reproduce la etapa (el ratón ya lo hizo al entrar)
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const pt = (e.nativeEvent as unknown as { pointerType?: string }).pointerType;
    if (pt === "mouse" || pt === "pen") return;
    api.tap(index);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      api.tap(index);
    }
  };

  const cls = ["timeline-step", isActive ? "is-active" : "", state === "done" ? "is-done" : "", state !== "idle" ? "is-lit" : ""].filter(Boolean).join(" ");

  return (
    <div
      ref={el}
      className={cls}
      style={{
        transitionDelay: delay,
        ["--scene-dur" as string]: `${PROCESS_TIMING.scenes[index]}ms`,
      } as CSSProperties}
      tabIndex={0}
      aria-label={`Paso ${step.num}: ${step.title}. ${step.description}`}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onPointerMove={onMove}
      onClick={onClick}
      onKeyDown={onKey}
      onFocus={(e) => e.currentTarget.matches(":focus-visible") && api.enter(index)}
      onBlur={() => api.leave(index)}
    >
      <div className="step-scene" aria-hidden="true">
        <div className="scene-frame">
          <div className="scene-persp">
            <div className="scene-tilt">
              <Scene key={view.runs[index]} state={state} />
            </div>
          </div>
        </div>
      </div>
      <span className="timeline-node" ref={nodeRef}>
        {step.num}
        {view.arrival > 0 && view.pulse === index && <span className="node-ripple" key={view.arrival} aria-hidden="true" />}
      </span>
      <h3>{step.title}</h3>
      <p>{step.description}</p>
    </div>
  );
});
