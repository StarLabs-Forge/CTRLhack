import { useEffect, useRef, useState } from "react";
import { LoaderStage } from "./LoaderStage";
import { useLoaderSequence } from "./useLoaderSequence";

const SEEN_KEY = "ctrlhack:intro-seen";

// La intro solo se reproduce en la primera visita de la sesión, en la portada
// (sin hash: los enlaces a una sección deben llegar directos), y nunca con
// prefers-reduced-motion. El resto de cargas usan <Loading /> (Suspense).
export function shouldPlayIntro(): boolean {
  if (typeof window === "undefined") return false;
  if (window.location.pathname !== "/" || window.location.hash) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return !sessionStorage.getItem(SEEN_KEY);
  } catch {
    return true;
  }
}

// Señales reales de carga: documento + fuentes + el chunk de la portada (el
// mismo import() que usa React.lazy, así que no se descarga dos veces).
function realLoadSignals(): Promise<unknown>[] {
  const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise<void>((res) => window.addEventListener("load", () => res(), { once: true }));
  const fonts = document.fonts?.ready ?? Promise.resolve();
  return [loaded, fonts, import("../../../views/HomeView")];
}

interface Props {
  /** Se dispara al empezar el fundido: monta la interfaz bajo el loader. */
  onReveal: () => void;
}

export function BrandLoader({ onReveal }: Props) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return <Run onReveal={onReveal} onDone={() => setVisible(false)} />;
}

function Run({ onReveal, onDone }: { onReveal: () => void; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [signals] = useState(realLoadSignals);
  const phase = useLoaderSequence(root, { waitFor: signals, onReveal, onDone });

  // bloquea el scroll mientras dura y marca la sesión como "ya vista"
  useEffect(() => {
    document.documentElement.classList.add("bl-lock");
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* sin storage: solo significa que se repetirá en la próxima carga */
    }
    return () => document.documentElement.classList.remove("bl-lock");
  }, []);

  return (
    <div className={`bl-overlay bl-overlay--${phase}`} role="status" aria-live="polite" aria-label="Cargando CtrlHack">
      <LoaderStage ref={root} phase={phase} />
    </div>
  );
}
