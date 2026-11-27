import { useLocation, useNavigate } from "react-router-dom";
import "./BackButton.css";

// Botón "volver" fijo en la esquina superior izquierda (bajo el Navbar).
// Es position: fixed, así que acompaña al scroll. No aparece en Home.
// Retrocede en el historial (ScrollManager restaura el scroll donde se quedó
// el usuario); si la página se abrió directo, sin historial propio, va al inicio.
export function BackButton() {
  const { pathname, key } = useLocation();
  const navigate = useNavigate();
  if (pathname === "/") return null;

  const goBack = () => {
    // key "default" = primera entrada del historial de esta pestaña
    if (key !== "default") navigate(-1);
    else navigate("/");
  };

  return (
    <button type="button" className="back-btn" onClick={goBack} aria-label="Volver a la página anterior">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M15 5l-7 7 7 7" />
      </svg>
      <span>Volver</span>
    </button>
  );
}
