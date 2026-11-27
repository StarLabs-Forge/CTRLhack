import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
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
  const probe = 80 + window.innerHeight * 0.4;
  const first = document.getElementById(HOME_SECTIONS[0]);
  if (!first || first.getBoundingClientRect().top > probe) return "inicio";
  for (const id of HOME_SECTIONS) {
    const rect = document.getElementById(id)?.getBoundingClientRect();
    if (rect && rect.top <= probe && rect.bottom > probe) return id;
  }
  return null;
}

type Theme = "dark" | "light";
const THEME_KEY = "ctrlhack-theme";

// Lee la preferencia guardada por el visitante. Si el navegador bloquea el
// almacenamiento (modo privado, datos bloqueados) se usa el modo oscuro.
function readTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function Navbar() {
  const { pathname, hash } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [spy, setSpy] = useState<Spy>("inicio");
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* sin almacenamiento: el cambio dura solo esta visita */
    }
  }, [theme]);

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
  // React Router no navega si el destino es la URL actual: tras llegar a
  // "/#identidad" y seguir con la rueda hacia otra sección, el hash sigue
  // siendo #identidad y volver a pulsar "Sobre" no hacía nada. En ese caso
  // (misma ruta y mismo hash, o "Inicio" sin hash) scrolleamos a mano.
  const goSection = (id: HomeSection) => (e: MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    if (onHome && hash === `#${id}`) {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  const goTop = (e: MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    if (onHome && !hash) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const sectionCurrent = (id: HomeSection) => (onHome && spy === id ? "location" : undefined);

  // Navegar con solo pasar el ratón: en la Home, si el cursor se queda un
  // momento sobre un enlace, la página baja sola a esa sección. La espera
  // evita saltos al cruzar el menú de paso. Solo con ratón (no táctil) y solo
  // en la Home: en otras páginas pasar el ratón no te saca de donde estás.
  const HOVER_DELAY = 280;
  const hoverTimer = useRef<number | undefined>(undefined);
  const cancelHover = () => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = undefined;
  };
  useEffect(() => cancelHover, []);
  const hoverGo = (target: "inicio" | HomeSection) => ({
    onPointerEnter: (e: PointerEvent<HTMLAnchorElement>) => {
      if (!onHome || e.pointerType !== "mouse" || spy === target) return;
      cancelHover();
      hoverTimer.current = window.setTimeout(() => {
        if (target === "inicio") window.scrollTo({ top: 0, behavior: "smooth" });
        else document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, HOVER_DELAY);
    },
    onPointerLeave: cancelHover,
  });

  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="wrap">
        <Link to="/" className="logo" onClick={goTop}>
          <Logo className="mark" assemble />
          <span className="wordmark" aria-label="CtrlHack">
            <span className="wm-ctrl">Ctrl</span>
            <span className="wm-hack">Hack</span>
          </span>
        </Link>
        <div className={`navlinks${open ? " open" : ""}`}>
          <Link to="/" aria-current={onHome && spy === "inicio" ? "page" : undefined} onClick={goTop} {...hoverGo("inicio")}>
            Inicio
          </Link>
          {/* Anchors a secciones de la Home — funcionan desde cualquier página:
              React Router navega a "/" y <ScrollManager> salta al hash. No pasan
              por aria-current porque no son rutas, son secciones dentro de "/". */}
          <Link to="/#identidad" aria-current={sectionCurrent("identidad")} onClick={goSection("identidad")} {...hoverGo("identidad")}>
            Sobre
          </Link>
          <Link to="/#proceso" aria-current={sectionCurrent("proceso")} onClick={goSection("proceso")} {...hoverGo("proceso")}>
            Proceso
          </Link>
          <Link
            to="/#servicios"
            aria-current={pathname === "/servicios" ? "page" : sectionCurrent("servicios")}
            onClick={goSection("servicios")}
            {...hoverGo("servicios")}
          >
            Servicios
          </Link>
          {/* Portafolio ya no es una ruta propia: es la sección "04 / PORTAFOLIO"
              del Home (ver <ProjectDeck>). /portafolio sigue existiendo como
              redirect de compatibilidad (ver App.tsx) para links viejos. */}
          <Link to="/#proyectos" aria-current={sectionCurrent("proyectos")} onClick={goSection("proyectos")} {...hoverGo("proyectos")}>
            Portafolio
          </Link>
          <button
            type="button"
            className="themetoggle"
            aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </button>
          <Link
            to="/#contacto"
            className="btn"
            aria-current={sectionCurrent("contacto")}
            onClick={goSection("contacto")}
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
