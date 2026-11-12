import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Next restauraba el scroll y saltaba al hash por su cuenta; React Router no.
// Al cambiar de ruta subimos arriba, y si la URL trae hash (los enlaces
// "/#identidad" y "/#proceso" del nav y del footer) buscamos ese elemento.
// El reintento existe porque las vistas son lazy: cuando llega la navegación
// el <section id="..."> todavía puede no estar montado.
export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    let raf = 0;
    let interrupted = false;
    const onInteraction = () => { interrupted = true; };
    const interactionEvents = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    interactionEvents.forEach(event => window.addEventListener(event, onInteraction, { passive: true }));
    const findTarget = () => {
      const el = document.querySelector(hash);
      if (el) {
        observer.disconnect();
        raf = requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          // Las fuentes pueden cambiar el alto de las secciones anteriores.
          // Reajustamos el ancla mientras el usuario siga esperando el salto.
          void document.fonts.ready.then(() => {
            if (!interrupted) el.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        });
      }
    };
    // Las vistas lazy pueden tardar más de un segundo en montar el destino.
    const observer = new MutationObserver(findTarget);
    observer.observe(document.body, { childList: true, subtree: true });
    findTarget();

    return () => {
      interrupted = true;
      interactionEvents.forEach(event => window.removeEventListener(event, onInteraction));
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [pathname, hash]);

  return null;
}
