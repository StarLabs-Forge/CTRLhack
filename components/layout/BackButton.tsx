import { useLocation } from "react-router-dom";
import { TransitionLink as Link } from "../ui/TransitionLink";
import "./BackButton.css";

// Botón "volver al inicio" fijo en la esquina superior izquierda (bajo el
// Navbar). Es position: fixed, así que acompaña al scroll. No aparece en Home.
export function BackButton() {
  const { pathname } = useLocation();
  if (pathname === "/") return null;
  return (
    <Link to="/" className="back-btn" aria-label="Volver a la página principal">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M15 5l-7 7 7 7" />
      </svg>
      <span>Volver</span>
    </Link>
  );
}
