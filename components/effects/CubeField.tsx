import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { SceneBoundary } from "../sections/showcase3d/SceneBoundary";
import "./CubeField.css";

// Fondo 3D de cubos para todo el sitio (ver cubefield/CubeFieldScene).
// Three.js ya viaja en el chunk del hero; esta escena se pide cuando el
// navegador está ocioso para no competir con la primera carga.
//
// No se monta (queda el fondo de color de siempre) cuando:
//  · el visitante pidió menos movimiento, o activó ahorro de datos
//  · el equipo es muy limitado o no hay WebGL2
//  · la escena falla al montar, pierde el contexto o no llega a ~24 fps
const CubeFieldScene = lazy(() => import("./cubefield/CubeFieldScene"));

const COMPACT_QUERY = "(max-width: 760px)";

function canRender3D(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if ((nav.deviceMemory ?? 8) <= 1 || (navigator.hardwareConcurrency ?? 8) <= 2) return false;
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    return false;
  }
  return true;
}

export function CubeField() {
  const [enabled, setEnabled] = useState(false);
  const [failed, setFailed] = useState(false);
  const [compact, setCompact] = useState(
    () => typeof window !== "undefined" && window.matchMedia(COMPACT_QUERY).matches,
  );

  // Arranca cuando la página ya cargó y el navegador está ocioso: así no compite
  // con la primera carga (textos, imágenes y la escena 3D del inicio).
  useEffect(() => {
    if (failed || !canRender3D()) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number | undefined;
    let timerId: number | undefined;
    const start = () => setEnabled(true);
    const schedule = () => {
      if (w.requestIdleCallback) idleId = w.requestIdleCallback(start, { timeout: 2500 });
      else timerId = window.setTimeout(start, 1200);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, [failed]);

  useEffect(() => {
    const mq = window.matchMedia(COMPACT_QUERY);
    const on = () => setCompact(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const fail = useCallback(() => {
    setFailed(true);
    setEnabled(false);
  }, []);

  return (
    <div className="cubefield" aria-hidden="true">
      {enabled && !failed && (
        <SceneBoundary onError={fail}>
          <Suspense fallback={null}>
            <CubeFieldScene key={compact ? "compact" : "full"} compact={compact} onFail={fail} />
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  );
}
