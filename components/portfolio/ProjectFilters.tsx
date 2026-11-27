import type { KeyboardEvent } from "react";
import type { ProjectFilterId } from "../../data/projectFilters";
import "./ProjectFilters.css";

// Filtros del portafolio (carrusel del Home y /productos). Es un grupo de
// botones de selección única: se navega con las flechas (como un radiogroup) y
// el activo se distingue con el cobre/naranja de marca. Los contadores reflejan
// cuántos proyectos hay en cada vista; un filtro en 0 sigue siendo seleccionable
// y lleva a un mensaje de "sin resultados", no desaparece.
interface FilterItem {
  id: ProjectFilterId;
  label: string;
  count: number;
}

interface ProjectFiltersProps {
  items: FilterItem[];
  value: ProjectFilterId;
  onChange: (id: ProjectFilterId) => void;
  label: string;
  // Texto para lectores de pantalla ("3 proyectos"), anunciado al filtrar.
  status: string;
  // Alinea los filtros a la izquierda (encabezados de página) en vez de centrarlos.
  start?: boolean;
}

export function ProjectFilters({ items, value, onChange, label, status, start = false }: ProjectFiltersProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const current = items.findIndex((item) => item.id === value);
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % items.length;
    if (event.key === "ArrowLeft") next = (current - 1 + items.length) % items.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = items.length - 1;
    onChange(items[next].id);
    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>("button");
    buttons[next]?.focus();
  }

  return (
    <div className={`pfilters${start ? " pfilters--start" : ""}`} role="radiogroup" aria-label={label} onKeyDown={handleKeyDown}>
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className={`pfilter${selected ? " is-selected" : ""}`}
            onClick={() => onChange(item.id)}
          >
            <span className="pfilter-label">{item.label}</span>
            <span className="pfilter-count" aria-hidden="true">
              {item.count}
            </span>
          </button>
        );
      })}
      <span className="sr-only" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}
