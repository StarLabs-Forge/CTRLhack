import { forwardRef } from "react";
import { Link, useLocation, type LinkProps } from "react-router-dom";

// <Link> que activa la View Transitions API cuando el clic cambia de página.
// Si solo cambia el hash (ancla dentro de la misma ruta) no hay vista nueva
// que fundir, así que se navega normal y ScrollManager hace el scroll suave.
// En navegadores sin startViewTransition, React Router ignora la prop.
export const TransitionLink = forwardRef<HTMLAnchorElement, LinkProps>(function TransitionLink(
  { to, ...rest },
  ref
) {
  const { pathname } = useLocation();
  const target = typeof to === "string" ? to : to.pathname ?? "";
  const targetPath = target.split("#")[0].split("?")[0];
  const samePage = targetPath === "" || targetPath === pathname;
  return <Link ref={ref} to={to} viewTransition={!samePage} {...rest} />;
});
