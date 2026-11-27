import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Next restauraba el scroll y saltaba al hash por su cuenta; React Router no.
// Al cambiar de ruta subimos arriba, y si la URL trae hash (los enlaces
// "/#identidad" y "/#proceso" del nav y del footer) buscamos ese elemento.
// El reintento existe porque las vistas son lazy: cuando llega la navegación
// el <section id="..."> todavía puede no estar montado.
//
// - Atrás/adelante (POP, incluido el botón "Volver"): se restaura el scroll
//   exacto que había en esa entrada del historial.
// - `key` en las dependencias: pulsar de nuevo un enlace a la sección que ya
//   estaba en la URL (mismo hash) genera una entrada nueva y vuelve a hacer
//   el scroll, aunque el usuario se haya movido con la rueda.
export function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  const navType = useNavigationType();
  const positions = useRef(new Map<string, number>());
  const keyRef = useRef(key);

  useLayoutEffect(() => {
    keyRef.current = key;
  }, [key]);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const onScroll = () => positions.current.set(keyRef.current, window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const saved = navType === "POP" ? positions.current.get(key) : undefined;
    if (saved !== undefined) {
      // Las vistas son lazy: la página puede no tener aún el alto suficiente.
      let raf = 0;
      const start = performance.now();
      const tick = () => {
        window.scrollTo({ top: saved, behavior: "instant" });
        if (Math.abs(window.scrollY - saved) > 2 && performance.now() - start < 2000) raf = requestAnimationFrame(tick);
      };
      tick();
      return () => cancelAnimationFrame(raf);
    }

    if (!hash) {
      window.scrollTo({ top: 0, behavior: "instant" });
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
  }, [pathname, hash, key, navType]);

  return null;
}
