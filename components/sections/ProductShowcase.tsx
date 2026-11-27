import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Logo } from "../ui/Logo";
import { SceneBoundary } from "./showcase3d/SceneBoundary";
import type { PointerInput } from "./showcase3d/types";
import "./ProductShowcase.css";

// Escena 3D del hero (home): un ordenador futurista con el isotipo oficial en
// pantalla, interfaces que emergen de ella y parallax con el cursor.
//
// Three.js + R3F + GSAP viven en su propio chunk (lazy) y solo se piden cuando el
// navegador está ocioso, así que no cuentan para la primera carga del hero.
//
// Fallback (monitor CSS estático con el isotipo) cuando la escena no es adecuada:
//  · prefers-reduced-motion, ahorro de datos, equipo muy limitado o sin WebGL2
//  · el chunk o la escena fallan al montar
//  · la guarda de rendimiento detecta que no se mantiene fluida
const ComputerScene = lazy(() => import("./showcase3d/ComputerScene"));

type Mode = "3d" | "static";

function detectMode(): Mode {
  if (typeof window === "undefined") return "static";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "static";
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return "static";
  if ((nav.deviceMemory ?? 8) <= 1 || (navigator.hardwareConcurrency ?? 8) <= 2) return "static";
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2");
    if (!gl) return "static";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    return "static";
  }
  return "3d";
}

function StaticMonitor() {
  return (
    <div className="sc-static">
      <div className="sc-monitor">
        <div className="sc-screen">
          <Logo className="sc-logo" />
        </div>
        <span className="sc-led" />
      </div>
      <div className="sc-neck" />
      <div className="sc-base" />
      <div className="sc-chip sc-chip--a">
        <span className="sc-chip-dot" />
        Módulo de pagos desplegado
      </div>
      <div className="sc-chip sc-chip--b">
        <span className="sc-chip-label">Mi proyecto</span>
        <span className="sc-chip-value">75%</span>
      </div>
    </div>
  );
}

export function ProductShowcase() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const input = useRef<PointerInput>({ x: 0, y: 0, active: false });
  const [mode, setMode] = useState<Mode>(detectMode);
  const [mountScene, setMountScene] = useState(false);
  const [inView, setInView] = useState(true);
  // Móvil/tablet estrecha = otro dispositivo, otro presupuesto: menos paneles,
  // menos polvo, resolución más baja. Se fija al montar (la escena se reinicia al cambiar).
  const [compact, setCompact] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);

  const fallBack = useCallback(() => setMode("static"), []);

  // Pide el chunk 3D cuando el navegador está libre (o a los 1.2 s como máximo).
  useEffect(() => {
    if (mode !== "3d") return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setMountScene(true), { timeout: 1200 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setMountScene(true), 300);
    return () => window.clearTimeout(id);
  }, [mode]);

  // Fuera de pantalla no se renderiza ni un frame.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.02 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const onChange = () => setCompact(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Si el usuario activa "reducir movimiento" con la página abierta, se apaga el 3D.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => mq.matches && setMode("static");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const handlePointerMove = useMemo(
    () => (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "touch") return; // sin hover fino: solo levitación ambiental
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      input.current.x = Math.max(-1, Math.min(1, nx));
      input.current.y = Math.max(-1, Math.min(1, ny));
      input.current.active = true;
    },
    [],
  );

  // Al salir el cursor todo vuelve suavemente a su posición original.
  const handlePointerLeave = useCallback(() => {
    input.current.x = 0;
    input.current.y = 0;
    input.current.active = false;
  }, []);

  return (
    <div
      className="showcase"
      ref={wrapRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-hidden="true"
    >
      <div className="showcase-glow" />
      {mode === "static" && <StaticMonitor />}
      {mode === "3d" && mountScene && (
        <SceneBoundary onError={fallBack}>
          <Suspense fallback={null}>
            <ComputerScene key={compact ? "compact" : "full"} input={input} active={inView} compact={compact} onFail={fallBack} />
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  );
}
