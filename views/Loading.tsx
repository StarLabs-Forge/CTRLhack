import { LoaderStage } from "../components/ui/loader/LoaderStage";
import "./styles/Loading.css";

// Fallback de <Suspense> en App.tsx mientras carga el chunk de una vista (las
// navegaciones tras la primera visita). Misma escena que la intro de marca, en
// modo sin progreso real: las piezas laten hacia el centro y la barra desliza.
// La secuencia completa (encaje + < >) vive en <BrandLoader />, que sí conoce
// el progreso real de la primera carga.
export function Loading() {
  return (
    <div className="loading-screen" role="status" aria-live="polite" aria-label="Cargando">
      <LoaderStage phase="loading" indeterminate />
    </div>
  );
}
