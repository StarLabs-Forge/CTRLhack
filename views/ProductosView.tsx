import { useState } from "react";
import { Hero } from "../components/sections/Hero";
import { CTABand } from "../components/sections/CTABand";
import { Reveal } from "../components/ui/Reveal";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Meta } from "../components/seo/Meta";
import { ProjectCard } from "../components/portfolio/ProjectCard";
import { CaseModal } from "../components/portfolio/CaseModal";
import { ProjectFilters } from "../components/portfolio/ProjectFilters";
import { projects } from "../data/projectCatalog";
import { EMPTY_MESSAGES, PRODUCT_FILTERS, filterOptions, filterProjects, type ProjectFilterId } from "../data/projectFilters";
import { caseStudies } from "../data/caseStudies";
import "../components/sections/ServiceDetail.css";
import "./styles/PortafolioView.css";

// A diferencia de /servicios/*, esta página no habla de trabajo para
// clientes: es el lado de Ctrlhack que investiga problemas propios y los
// convierte en productos propios. Reutiliza la misma lista y la misma
// <ProjectCard> que /portafolio — agregar un producto nuevo es agregar una
// entrada en data/portfolioProjects.ts, no rediseñar esta página.
export default function ProductosView() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProjectFilterId>("all");

  // Solo kind:"product" — esta página es explícitamente "no es trabajo para
  // clientes" (ver comentario de arriba), así que no puede reusar la lista
  // completa de portfolioProjects sin filtrar, o mostraría encargos de
  // clientes (p. ej. Aura Tumbler) como si fueran ideas propias de CTRLHACK.
  const ownProducts = projects.filter((p) => p.kind === "product");
  // El filtro por estado se aplica DESPUÉS de separar los propios: aquí nunca
  // aparece un proyecto de cliente, filtre lo que filtre.
  const shown = filterProjects(ownProducts, filter);

  const openProject = ownProducts.find((p) => p.slug === openSlug);
  const openCaseStudy = openProject?.caseStudySlug
    ? caseStudies.find((c) => c.slug === openProject.caseStudySlug)
    : undefined;

  const hasProducts = ownProducts.length > 0;
  const status = shown.length === 0 ? EMPTY_MESSAGES[filter] : `${shown.length} ${shown.length === 1 ? "producto" : "productos"}`;

  return (
    <>
      <Meta
        title="Productos propios — CTRLHACK"
        description="Los productos y proyectos que nacen dentro de CTRLHACK, no por encargo de un cliente."
      />
      <div className="page-hero-block">
        <Hero
          eyebrow="CTRLHACK"
          title="Productos que nacen de nuestras propias ideas."
          lead="Nuestras ideas, hechas realidad."
          variant="page"
          paddingBottom={56}
        />

        <section className="tight">
          <div className="wrap">
            <Reveal className="svc-lead">
              <p>
                CTRLHACK no solo construye para otros: también investigamos problemas, planteamos ideas propias,
                diseñamos soluciones y desarrollamos nuestros propios productos tecnológicos. Estos son los proyectos
                que nacen dentro de CTRLHACK — no por encargo de un cliente, sino porque vimos un problema que
                queríamos resolver.
              </p>
            </Reveal>

            <Reveal delay={80} className="section-head">
              <Eyebrow>Nuestros productos</Eyebrow>
              <h2>Lo que estamos construyendo</h2>
            </Reveal>

            <ProjectFilters
              items={filterOptions(ownProducts, PRODUCT_FILTERS)}
              value={filter}
              onChange={setFilter}
              label="Filtrar productos por estado"
              status={status}
              start
            />

            {/* alto mínimo: al filtrar, la página no se encoge de golpe ni salta el scroll */}
            <div className="pgrid-wrap">
              {shown.length > 0 ? (
                <div className="pgrid">
                  {shown.map((project, index) => (
                    <Reveal key={project.slug} index={index}>
                      <ProjectCard project={project} onOpenDetail={setOpenSlug} priority={index === 0} />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <div className="pgrid-empty" role="note">
                  <p>{EMPTY_MESSAGES[filter]}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {openCaseStudy && <CaseModal project={openProject} caseStudy={openCaseStudy} onClose={() => setOpenSlug(null)} />}

      <Reveal>
        <CTABand
          title={hasProducts ? "Conoce nuestros proyectos" : "Estamos construyendo lo que sigue."}
          description={
            hasProducts
              ? "Cada caso completo — el problema, la solución y el estado actual — vive en nuestro portafolio."
              : "Todavía no hay suficiente para mostrar, pero ya estamos trabajando en ello."
          }
          ctaLabel={hasProducts ? "Ver portafolio completo" : "Volver al inicio"}
          ctaHref={hasProducts ? "/portafolio" : "/"}
        />
      </Reveal>
    </>
  );
}
