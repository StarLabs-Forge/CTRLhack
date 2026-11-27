export interface TimelineGeo {
  axis: "h" | "v";
  x0: number;
  y0: number;
  len: number;
}

// Línea de energía: base tenue + relleno cobrizo hasta el nodo alcanzado +
// cabeza luminosa con estela. Todo se mueve con transform (--pos × --len) y
// comparte la misma duración (--travel), que fija el controlador.
export function EnergyPulse({ geo }: { geo: TimelineGeo }) {
  if (geo.len <= 0) return null;
  return (
    <div className="energy" aria-hidden="true">
      <span className="energy-base" />
      <span className="energy-fill" />
      <span className="energy-head" />
    </div>
  );
}
