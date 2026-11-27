// Entrada del cursor sobre el componente, normalizada a -1..1 respecto a su
// caja. La escribe ProductShowcase (DOM) y la lee la escena 3D en cada frame.
// `active` es false cuando el cursor sale: la escena vuelve sola a su reposo.
export interface PointerInput {
  x: number;
  y: number;
  active: boolean;
}

// Puntero ya suavizado (amortiguado) que comparten cámara, ordenador y paneles.
export interface Rig {
  x: number;
  y: number;
}
