import { forwardRef, useEffect, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { Link, useLocation, useNavigate, type LinkProps } from "react-router-dom";

// React Router 6 solo soporta la prop `viewTransition` con data routers
// (RouterProvider); con <BrowserRouter> la ignora en silencio. Por eso la
// transición se orquesta aquí: se intercepta el clic, se abre una View
// Transition y su callback devuelve una promesa que <ViewTransitionGate />
// resuelve cuando la ruta nueva ya está pintada (las vistas son lazy y con
// v7_startTransition la UI vieja se mantiene hasta que llega el chunk).
let pendingResolve: (() => void) | null = null;

// Montar una vez dentro del Router (App.tsx).
export function ViewTransitionGate() {
  const { key } = useLocation();
  useEffect(() => {
    if (!pendingResolve) return;
    const resolve = pendingResolve;
    pendingResolve = null;
    // un frame después del commit, para que el snapshot "new" ya tenga la vista
    requestAnimationFrame(() => resolve());
  }, [key]);
  return null;
}

const canTransition = () =>
  typeof document.startViewTransition === "function" &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// <Link> que anima los cambios de página con la View Transitions API.
// Si solo cambia el hash (ancla dentro de la misma ruta) no hay vista nueva
// que fundir: se navega normal y ScrollManager hace el scroll suave.
export const TransitionLink = forwardRef<HTMLAnchorElement, LinkProps>(function TransitionLink(
  { to, onClick, target, ...rest },
  ref
) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const toPath = typeof to === "string" ? to : to.pathname ?? "";
  const targetPath = toPath.split("#")[0].split("?")[0];
  const samePage = targetPath === "" || targetPath === pathname;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      (target && target !== "_self") ||
      samePage ||
      !canTransition()
    ) {
      return; // clic "normal": lo resuelve <Link>
    }
    event.preventDefault();
    document.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          pendingResolve = resolve;
          // tope: si la vista tarda o la navegación se cancela, no dejar la página congelada
          window.setTimeout(() => {
            if (pendingResolve === resolve) {
              pendingResolve = null;
              resolve();
            }
          }, 2500);
          flushSync(() => navigate(to));
        })
    );
  };

  return <Link ref={ref} to={to} target={target} onClick={handleClick} {...rest} />;
});
