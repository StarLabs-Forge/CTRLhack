import { useEffect, useRef } from "react";

// Atracción magnética: el elemento se desplaza una fracción de la distancia al
// cursor mientras éste está encima. Escribe --mx/--my y el CSS (.is-magnetic)
// los aplica con la propiedad individual `translate`, que no pisa el `transform`
// del hover. Solo en dispositivos con puntero preciso y hover real (no touch) y
// sin prefers-reduced-motion; en el resto el hook no hace nada.
export function useMagnetic<T extends HTMLElement>(enabled: boolean, strength = 0.22, max = 8) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;

    const clamp = (v: number) => Math.max(-max, Math.min(max, v));
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.setProperty("--mx", `${clamp(dx * strength).toFixed(1)}px`);
      el.style.setProperty("--my", `${clamp(dy * strength).toFixed(1)}px`);
    };
    const reset = () => {
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    };

    el.classList.add("is-magnetic");
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
      el.classList.remove("is-magnetic");
      reset();
    };
  }, [enabled, strength, max]);

  return ref;
}
