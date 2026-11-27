import { useEffect, useState, type CSSProperties } from "react";
import type { Stat } from "../../data/team";
import { prefersReducedMotion, useInViewOnce } from "./useInViewOnce";

// Indicador con número que cuenta desde 0 al entrar en pantalla (una sola vez).
// Con movimiento reducido muestra el valor final directamente. El valor real
// siempre está en el texto accesible, no depende de la animación.
export function StatCounter({ stat, index }: { stat: Stat; index: number }) {
  const { ref, seen } = useInViewOnce<HTMLDivElement>(0.6);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!seen) return;
    if (prefersReducedMotion()) {
      setShown(stat.value);
      return;
    }
    const duration = 1100 + index * 140;
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(eased * stat.value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, stat.value, index]);

  return (
    <div className={`member-stat${seen ? " is-on" : ""}`} ref={ref} style={{ "--i": index } as CSSProperties}>
      <span className="member-stat-value" aria-hidden="true">
        {shown}
        {stat.unit && <small>{stat.unit}</small>}
      </span>
      <span className="member-stat-label" aria-hidden="true">
        {stat.label}
      </span>
      <span className="team-sr">
        {stat.value} {stat.unit ?? ""} — {stat.label}
      </span>
    </div>
  );
}
