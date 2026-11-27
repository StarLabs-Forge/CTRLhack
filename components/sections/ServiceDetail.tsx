import { useRef, type CSSProperties, type PointerEvent } from "react";
import { Eyebrow } from "../ui/Eyebrow";
import { Reveal } from "../ui/Reveal";
import { KineticTitle } from "../ui/KineticTitle";
import { ServiceArt } from "./ServiceArt";
import type { ServiceDetail as ServiceDetailData, ServiceFeature } from "../../data/serviceDetails";
import imgWeb from "../../assets/cobre/1.png";
import imgApps from "../../assets/cobre/2.png";
import imgSistemas from "../../assets/cobre/3.png";
import "./ServiceDetail.css";

// Cuerpo compartido por las 3 páginas de /servicios/* (Web, Apps, Sistemas).
// El texto cambia por props (data/serviceDetails.ts); estructura y estilo no.
//
//  1 · Intro en dos columnas: el texto va partido en piezas cortas (enunciado,
//      desarrollo, nota) y a su lado la imagen de marca del servicio con los
//      "tipos de proyecto" flotando alrededor.
//  2 · Características: tarjetas con su propia ilustración animada en vez de
//      celdas de solo texto.
//
// Todo el movimiento cuelga de <Reveal> (.reveal.in): solo corre con el bloque
// en pantalla y no existe con prefers-reduced-motion.
const SERVICE_IMAGES: Record<ServiceDetailData["id"], string> = {
  web: imgWeb,
  apps: imgApps,
  sistemas: imgSistemas,
};

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface ServiceDetailProps {
  detail: ServiceDetailData;
}

// Parallax por capas: el cursor mueve imagen, anillos y etiquetas a distinta
// profundidad (variables CSS --tx/--ty en -1..1); al salir, todo vuelve solo.
function ServiceVisual({ detail }: ServiceDetailProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--tx", (((event.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3));
    el.style.setProperty("--ty", (((event.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3));
  }

  function handleLeave() {
    ref.current?.style.setProperty("--tx", "0");
    ref.current?.style.setProperty("--ty", "0");
  }

  return (
    <Reveal variant="scale" delay={120} className="svc-visual-reveal">
      <div className="svc-visual" ref={ref} onPointerMove={handleMove} onPointerLeave={handleLeave}>
        <span className="svc-v-glow" aria-hidden="true" />
        <svg className="svc-v-rings" viewBox="0 0 400 400" aria-hidden="true">
          <circle className="ring-a" cx="200" cy="200" r="186" />
          <circle className="ring-b" cx="200" cy="200" r="140" />
          <path className="ring-c" d="M200 2v18M200 380v18M2 200h18M380 200h18" />
        </svg>
        <div className="svc-v-scroll">
          <div className="svc-v-tilt">
            <img className="svc-v-img" src={SERVICE_IMAGES[detail.id]} alt="" loading="eager" />
          </div>
        </div>

        <div className="svc-examples">
          <Eyebrow>{detail.examplesLabel}</Eyebrow>
          <ul className="svc-examples-list">
            {detail.examples.map((example, index) => (
              <li className="svc-example" key={example} style={{ "--i": index } as CSSProperties}>
                <span>{example}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  );
}

// Tarjeta con luz que sigue al cursor e inclinación leve (mismo gesto que las
// tarjetas de /servicios). Solo mouse y sin reduced-motion.
function FeatureCard({ feature, index }: { feature: ServiceFeature; index: number }) {
  const ref = useRef<HTMLElement>(null);

  function handleMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse" || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    el.style.setProperty("--rx", `${((0.5 - py) * 5).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((px - 0.5) * 5).toFixed(2)}deg`);
  }

  function handleLeave() {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  }

  return (
    <Reveal index={index}>
      <article className="svc-card" ref={ref} onPointerMove={handleMove} onPointerLeave={handleLeave}>
        <span className="svc-card-spot" aria-hidden="true" />
        <span className="svc-card-num" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="svc-art">
          <ServiceArt id={feature.art} />
        </div>
        <h3>{feature.title}</h3>
        <p>{feature.description}</p>
      </article>
    </Reveal>
  );
}

export function ServiceDetail({ detail }: ServiceDetailProps) {
  return (
    <>
      <section className="tight svc-intro">
        <div className="wrap svc-stage">
          <div className="svc-copy">
            <Reveal>
              <p className="svc-statement">{detail.statement}</p>
            </Reveal>
            <Reveal delay={90}>
              <p className="svc-story">{detail.story}</p>
            </Reveal>
            <Reveal delay={180}>
              <p className="svc-note">{detail.note}</p>
            </Reveal>
          </div>
          <ServiceVisual detail={detail} />
        </div>
      </section>

      <section className="tight svc-block">
        <div className="wrap">
          <Reveal className="section-head">
            <Eyebrow>{detail.featuresLabel}</Eyebrow>
            <h2 className="kinetic">
              <KineticTitle lines={["¿Qué incluye trabajar con nosotros?"]} />
            </h2>
          </Reveal>

          <div className="svc-features">
            {detail.features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
