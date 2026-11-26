import type { ReactElement } from "react";
import "./SectionArt.css";

// Ilustración geométrica de fondo por sección del Home: rellena los costados y
// bandas que dejan los contenidos con formas del lenguaje de marca (chevrones
// < > del isotipo, cortes diagonales, anillos, circuitos). Cada capa se mueve a
// distinta velocidad con el scroll (SectionArt.css, scroll-driven animations).
// Es puramente decorativo: aria-hidden, sin eventos, detrás del contenido.
export type ArtVariant = "sobre" | "proceso" | "servicios" | "portafolio" | "testimonios";

const Slabs = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 380 190" aria-hidden="true">
    <polygon points="50,0 380,0 330,46 0,46" />
    <polygon points="90,72 380,72 330,118 40,118" />
    <polygon points="130,144 380,144 330,190 80,190" />
  </svg>
);

const Rings = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 400 400" aria-hidden="true">
    <circle cx="200" cy="200" r="190" strokeDasharray="2 9" />
    <circle cx="200" cy="200" r="140" />
    <circle cx="200" cy="200" r="92" strokeDasharray="14 10" />
    <path d="M200 0v22M200 378v22M0 200h22M378 200h22" />
  </svg>
);

const Chevrons = ({ className, inner = true }: { className: string; inner?: boolean }) => (
  <svg className={className} viewBox="0 0 230 270" aria-hidden="true">
    <polyline pathLength={1} points="78,10 10,135 78,260" />
    <polyline pathLength={1} points="152,10 220,135 152,260" />
    {inner && (
      <>
        <polyline pathLength={1} points="104,70 66,135 104,200" opacity=".6" />
        <polyline pathLength={1} points="126,70 164,135 126,200" opacity=".6" />
      </>
    )}
  </svg>
);

const ART: Record<ArtVariant, ReactElement> = {
  sobre: (
    <>
      <Chevrons className="a a-chev" />
      <Slabs className="a a-slabs" />
      <Rings className="a a-rings" />
    </>
  ),
  proceso: (
    <>
      <svg className="a a-circuit" viewBox="0 0 640 150" aria-hidden="true">
        <path pathLength={1} d="M0 75H130L162 40H320L352 110H490L522 75H640" />
        <path pathLength={1} d="M130 75V130H250M352 110V20H430" opacity=".55" />
        <circle cx="130" cy="75" r="5" />
        <circle cx="352" cy="110" r="5" />
        <circle cx="522" cy="75" r="5" />
        <circle cx="250" cy="130" r="4" />
        <circle cx="430" cy="20" r="4" />
      </svg>
      <svg className="a a-stairs" viewBox="0 0 260 180" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((n) => (
          <polygon
            key={n}
            className={`stair stair-${n}`}
            points={`${n * 52},180 ${n * 52},${150 - n * 30} ${n * 52 + 46},${135 - n * 30} ${n * 52 + 46},180`}
          />
        ))}
      </svg>
      <Rings className="a a-rings a-rings-l" />
    </>
  ),
  servicios: (
    <>
      {["tl", "tr", "bl", "br"].map((c) => (
        <svg key={c} className={`a a-corner a-corner-${c}`} viewBox="0 0 70 70" aria-hidden="true">
          <path d="M2 36V2H36M2 20H20" />
        </svg>
      ))}
      <svg className="a a-hex" viewBox="0 0 200 230" aria-hidden="true">
        <polygon pathLength={1} points="100,5 192,58 192,172 100,225 8,172 8,58" />
        <polygon pathLength={1} points="100,50 152,80 152,150 100,180 48,150 48,80" opacity=".6" />
      </svg>
    </>
  ),
  portafolio: (
    <>
      <Rings className="a a-rings a-rings-c" />
      <div className="a-sweep" />
      <Slabs className="a a-slabs a-slabs-r" />
    </>
  ),
  testimonios: (
    <>
      <Slabs className="a a-slabs a-slabs-t" />
      <svg className="a a-dots" viewBox="0 0 280 160" aria-hidden="true">
        {Array.from({ length: 8 * 14 }, (_, n) => (
          <circle key={n} cx={10 + (n % 14) * 20} cy={10 + Math.floor(n / 14) * 20} r="2" />
        ))}
      </svg>
      <Chevrons className="a a-chev a-chev-t" inner={false} />
    </>
  ),
};

export function SectionArt({ variant }: { variant: ArtVariant }) {
  return (
    <div className={`art art--${variant}`} aria-hidden="true">
      {ART[variant]}
    </div>
  );
}
