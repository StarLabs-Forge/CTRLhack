import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { TransitionLink as Link } from "../ui/TransitionLink";
import { Logo } from "../ui/Logo";
import "./Navbar.css";

// Reemplaza el toggle imperativo + nav elevation de /script.js:3-37.
// Misma lógica, expresada como estado de React en vez de manipulación directa del DOM.

// Secciones de la Home que tienen entrada en el menú, en orden de aparición.
// "testimonios" no tiene enlace: ahí no se marca nada.
const HOME_SECTIONS = ["identidad", "proceso", "servicios", "proyectos", "contacto"] as const;
type HomeSection = (typeof HOME_SECTIONS)[number];
type Spy = "inicio" | HomeSection | null;

// Qué parte de la Home está en pantalla. La "línea de lectura" está a ~40% del
// alto del viewport (bajo el nav): la sección que la cruza es la actual. Por
// encima de la primera sección es el hero ("inicio"); más allá de la última
// con enlace (testimonios, footer) no hay ninguna activa.
function readHomeSection(): Spy {
  const probe = 64 + window.innerHeight * 0.4;
  const first = document.getElementById(HOME_SECTIONS[0]);
  if (!first || first.getBoundingClientRect().top > probe) return "inicio";
  for (const id of HOME_SECTIONS) {
    const rect = document.getElementById(id)?.getBoundingClientRect();
    if (rect && rect.top <= probe && rect.bottom > probe) return id;
  }
  return null;
}

export function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [spy, setSpy] = useState<Spy>("inicio");

  useEffect(() => {
    const onHomeRoute = pathname === "/";
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 8);
      setSpy(onHomeRoute ? readHomeSection() : null);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  // "page" = estás en esa ruta; "location" = estás en esa sección de la Home.
  const onHome = pathname === "/";
  const sectionCurrent = (id: HomeSection) => (onHome && spy === id ? "location" : undefined);

  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="wrap">
        <Link to="/" className="logo">
          <Logo className="mark" assemble />
          <span className="wordmark">CTRLHACK</span>
        </Link>
        <div className={`navlinks${open ? " open" : ""}`}>
          <Link to="/" aria-current={onHome && spy === "inicio" ? "page" : undefined} onClick={() => setOpen(false)}>
            Inicio
          </Link>
          {/* Anchors a secciones de la Home — funcionan desde cualquier página:
              React Router navega a "/" y <ScrollManager> salta al hash. No pasan
              por aria-current porque no son rutas, son secciones dentro de "/". */}
          <Link to="/#identidad" aria-current={sectionCurrent("identidad")} onClick={() => setOpen(false)}>
            Sobre
          </Link>
          <Link to="/#proceso" aria-current={sectionCurrent("proceso")} onClick={() => setOpen(false)}>
            Proceso
          </Link>
          <Link
            to="/#servicios"
            aria-current={pathname === "/servicios" ? "page" : sectionCurrent("servicios")}
            onClick={() => setOpen(false)}
          >
            Servicios
          </Link>
          {/* Portafolio ya no es una ruta propia: es la sección "04 / PORTAFOLIO"
              del Home (ver <ProjectDeck>). /portafolio sigue existiendo como
              redirect de compatibilidad (ver App.tsx) para links viejos. */}
          <Link to="/#proyectos" aria-current={sectionCurrent("proyectos")} onClick={() => setOpen(false)}>
            Portafolio
          </Link>
          <Link
            to="/#contacto"
            className="btn"
            aria-current={sectionCurrent("contacto")}
            onClick={() => setOpen(false)}
          >
            Contacto
          </Link>
        </div>
        <button
          className="navtoggle"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "×" : "≡"}
        </button>
      </div>
    </nav>
  );
}
