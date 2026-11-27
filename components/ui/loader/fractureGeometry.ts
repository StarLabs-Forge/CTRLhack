// Geometría de la fractura de la tecla Ctrl (lienzo 1774 × 887, el mismo del
// isotipo oficial, así que todo coincide con los chevrones al milímetro).
//
// Dos grietas se cruzan cerca del centro de la tecla:
//  · horizontal, por debajo de las letras (así "Ctrl" nunca se corta a lo largo);
//  · vertical, en el hueco entre la "C" y la "t".
// Cada grieta es una polilínea angulosa — irregular pero geométrica, no vidrio
// roto. Las cuatro piezas COMPARTEN exactamente los mismos vértices, por eso
// encajan sin holgura al unirse.
type Pt = readonly [number, number];

const C: Pt = [848, 492];
// grieta vertical (de arriba hacia el centro y del centro hacia abajo)
const VT: Pt[] = [[828, 190], [866, 262], [838, 318], [851, 372], [844, 430]];
const VB: Pt[] = [[872, 545], [838, 590], [866, 636], [842, 700]];
// grieta horizontal (de la izquierda al centro y del centro a la derecha)
const HL: Pt[] = [[430, 470], [560, 500], [640, 478], [730, 512], [790, 488]];
const HR: Pt[] = [[910, 520], [975, 486], [1050, 522], [1130, 494], [1210, 516], [1320, 486]];

const pts = (a: readonly Pt[]) => a.map((p) => p.join(",")).join(" ");
const rev = <T,>(a: readonly T[]) => [...a].reverse();

const TL_CORNER: Pt = [430, 190];
const TR_CORNER: Pt = [1320, 190];
const BL_CORNER: Pt = [430, 700];
const BR_CORNER: Pt = [1320, 700];

export interface FracturePiece {
  id: "tl" | "tr" | "bl" | "br";
  /** dirección de alejamiento respecto al centro */
  dir: readonly [number, number];
  /** giro relativo (grados por unidad de separación) */
  rot: number;
  /** origen de rotación, en % del lienzo */
  origin: string;
  /** periodo y desfase de la flotación: cada pieza respira a su ritmo */
  floatS: number;
  floatDelay: number;
  /** recorte (polígono cerrado) */
  polygon: string;
  /** solo los bordes de fractura (para el bisel luminoso) */
  edge: string;
}

export const PIECES: FracturePiece[] = [
  {
    id: "tl", dir: [-1, -1], rot: -3, origin: "36% 42%", floatS: 2.7, floatDelay: 0,
    polygon: pts([TL_CORNER, ...VT.slice(0, 5), C, ...rev(HL), ]),
    edge: pts([...VT, C, ...rev(HL)]),
  },
  {
    id: "tr", dir: [1, -1], rot: 2.5, origin: "62% 42%", floatS: 3.1, floatDelay: -0.9,
    polygon: pts([VT[0], TR_CORNER, HR[5], HR[4], HR[3], HR[2], HR[1], HR[0], C, ...rev(VT).slice(0, 5)].slice(0)),
    edge: pts([...VT, C, ...HR]),
  },
  {
    id: "bl", dir: [-1, 1], rot: 2, origin: "36% 62%", floatS: 2.9, floatDelay: -1.7,
    polygon: pts([...HL, C, ...VB, BL_CORNER]),
    edge: pts([...HL, C, ...VB]),
  },
  {
    id: "br", dir: [1, 1], rot: -2.5, origin: "62% 62%", floatS: 3.3, floatDelay: -0.4,
    polygon: pts([C, ...HR, BR_CORNER, ...rev(VB)]),
    edge: pts([...rev(VB), C, ...HR]),
  },
];

// Red completa de grietas: para el destello que recorre las uniones al encajar.
export const SEAMS = [`M${pts([...HL, C, ...HR]).replace(/ /g, " L")}`, `M${pts([...VT, C, ...VB]).replace(/ /g, " L")}`];

// Grietas secundarias sutiles (hairlines) que refuerzan la sensación de rotura.
export const HAIRLINES = [
  "M640,478 L618,440 L626,414",
  "M1050,522 L1066,556 L1058,580",
  "M866,262 L902,250 L930,262",
  "M790,488 L760,462",
];

// Centro de la unión, en % del lienzo (origen del destello).
export const JOIN_POINT = { x: (C[0] / 1774) * 100, y: (C[1] / 887) * 100 };
