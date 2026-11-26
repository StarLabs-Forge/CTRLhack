import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// Fade-up genérico al entrar en viewport. Sin JS (o con prefers-reduced-motion)
// el contenido nunca lleva la clase "reveal" y queda completamente visible —
// el movimiento es una mejora progresiva, no un requisito para ver el contenido.
//
// variant: "up" (default, fade + sube) · "fade" (solo opacidad, para texto
// largo o bloques que no deben "viajar") · "scale" (crece desde 0.94, para
// medios y tarjetas destacadas) · "assemble" (barrido diagonal, como un corte
// del isotipo: para bloques de contenido que "se arman" al entrar).
// index: posición dentro de un grupo de hermanos. El retraso es index × --stagger
// con tope en --stagger-max (tokens.css), así la fila 4 de un grid no espera
// medio segundo extra. `delay` (ms) sigue existiendo para casos puntuales y
// tiene prioridad sobre index.
interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  index?: number;
  variant?: "up" | "fade" | "scale" | "assemble";
}

export function Reveal({ children, className, delay = 0, index, variant = "up" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    setArmed(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const classes = [armed ? "reveal" : "", armed && variant !== "up" ? `reveal--${variant}` : "", visible ? "in" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  const style: CSSProperties | undefined =
    delay || index !== undefined
      ? ({ ...(delay ? { transitionDelay: `${delay}ms` } : null), ...(index !== undefined ? { "--reveal-i": index } : null) } as CSSProperties)
      : undefined;

  return (
    <div ref={ref} className={classes || undefined} style={style}>
      {children}
    </div>
  );
}
