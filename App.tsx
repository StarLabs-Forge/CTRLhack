import { Suspense, lazy, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { BackButton } from "./components/layout/BackButton";
import { Footer } from "./components/layout/Footer";
import { ScrollManager } from "./components/layout/ScrollManager";
import { ViewTransitionGate } from "./components/ui/TransitionLink";
import { CubeField } from "./components/effects/CubeField";
import { Loading } from "./views/Loading";
import { BrandLoader, shouldPlayIntro } from "./components/ui/loader/BrandLoader";

// Cada vista se carga bajo demanda: el bundle inicial trae solo la Home, y
// <Loading /> es lo que se ve mientras llega el resto — el mismo papel que
// cumplía app/loading.tsx en Next, ahora explícito como fallback de Suspense.
const HomeView = lazy(() => import("./views/HomeView"));
const ServiciosView = lazy(() => import("./views/ServiciosView"));
const ServicioWebView = lazy(() => import("./views/ServicioWebView"));
const ServicioAppsView = lazy(() => import("./views/ServicioAppsView"));
const ServicioSistemasView = lazy(() => import("./views/ServicioSistemasView"));
const ProductosView = lazy(() => import("./views/ProductosView"));
const PortafolioView = lazy(() => import("./views/PortafolioView"));
const NotFoundView = lazy(() => import("./views/NotFoundView"));

export function App() {
  // Primera visita de la sesión: la intro de marca (BrandLoader) espera la carga
  // real y monta la interfaz al empezar su fundido, para que la animación de
  // entrada del Home se vea de verdad en vez de gastarse bajo el loader.
  const [intro] = useState(shouldPlayIntro);
  const [revealed, setRevealed] = useState(!intro);
  return (
    <>
      {intro && <BrandLoader onReveal={() => setRevealed(true)} />}
      <CubeField />
      <ScrollManager />
      <ViewTransitionGate />
      <Navbar />
      <BackButton />
      {revealed && (
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/servicios" element={<ServiciosView />} />
          <Route path="/servicios/web" element={<ServicioWebView />} />
          <Route path="/servicios/apps" element={<ServicioAppsView />} />
          <Route path="/servicios/sistemas" element={<ServicioSistemasView />} />
          <Route path="/productos" element={<ProductosView />} />
          <Route path="/portafolio" element={<PortafolioView />} />
          {/* Contacto ahora es la sección 06 del Home; /contacto queda como redirect para links viejos */}
          <Route path="/contacto" element={<Navigate to="/#contacto" replace />} />
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </Suspense>
      )}
      {revealed && <Footer />}
    </>
  );
}
