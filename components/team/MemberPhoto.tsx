import { useRef, type PointerEvent } from "react";
import type { TeamMember } from "../../data/team";
import { prefersReducedMotion } from "./useInViewOnce";

// Retrato del integrante integrado al fondo: marco con los cortes diagonales
// del isotipo, luz cobre detrás, líneas tecnológicas y un barrido de luz al
// aparecer. La foto se muestra tal cual (sin filtros sobre la persona): solo
// el borde inferior se funde con el fondo. En escritorio se inclina apenas
// siguiendo al cursor.
export function MemberPhoto({ member }: { member: TeamMember }) {
  const ref = useRef<HTMLElement>(null);
  const raf = useRef(0);
  const { photo } = member;

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || prefersReducedMotion()) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (clientX - r.left) / r.width - 0.5;
      const y = (clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--ry", `${(x * 7).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${(-y * 5).toFixed(2)}deg`);
      el.style.setProperty("--lx", `${((x + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty("--ly", `${((y + 0.5) * 100).toFixed(1)}%`);
    });
  };
  const onLeave = () => {
    cancelAnimationFrame(raf.current);
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <figure className="member-photo" ref={ref} onPointerMove={onMove} onPointerLeave={onLeave}>
      <span className="member-photo-glow" aria-hidden="true" />
      <div className="member-photo-frame">
        <img
          src={photo.srcSm}
          srcSet={`${photo.srcSm} 600w, ${photo.src} ${photo.width}w`}
          sizes="(max-width: 860px) 82vw, 440px"
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
        />
        <span className="member-photo-light" aria-hidden="true" />
        <span className="member-photo-scan" aria-hidden="true" />
      </div>
      {/* esquinas y trazos de circuito alrededor del retrato */}
      <svg className="member-photo-lines" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true">
        <path d="M2 18 V2 H18" />
        <path d="M82 148 H98 V132" />
        <path d="M98 30 H92 L88 34 V58" />
        <path d="M2 112 H8 L12 108 V84" />
        <circle cx="88" cy="60" r="1.4" />
        <circle cx="12" cy="82" r="1.4" />
      </svg>
      <figcaption className="member-photo-tag">
        <span>CTRLHACK</span>
        <i aria-hidden="true" />
        <span>Equipo</span>
      </figcaption>
    </figure>
  );
}
