import * as THREE from "three";

// Traza un rectángulo redondeado centrado en el origen sobre un Path/Shape.
function traceRoundedRect(path: THREE.Path, w: number, h: number, r: number) {
  const x = -w / 2;
  const y = -h / 2;
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y);
  path.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  path.lineTo(x + w, y + h - r);
  path.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  path.lineTo(x + r, y + h);
  path.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  path.lineTo(x, y + r);
  path.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
}

export function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  traceRoundedRect(shape, w, h, r);
  return shape;
}

// Pieza metálica biselada, centrada en el origen. Las medidas son las de la
// cara plana: el bisel suma `bevel` por cada lado. El material 0 cubre las
// caras (frente/dorso) y el 1 los costados + bisel (aquí va el filo de cobre).
export function makeSlab(w: number, h: number, r: number, depth: number, bevel: number): THREE.ExtrudeGeometry {
  const geometry = new THREE.ExtrudeGeometry(roundedRectShape(w, h, r), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 14,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

// Marco fino (aro) para la onda de energía que recorre el borde de la pantalla.
export function makeFrameRing(outerW: number, outerH: number, outerR: number, thickness: number): THREE.ShapeGeometry {
  const shape = roundedRectShape(outerW, outerH, outerR);
  const hole = new THREE.Path();
  traceRoundedRect(hole, outerW - thickness * 2, outerH - thickness * 2, Math.max(outerR - thickness, 0.01));
  shape.holes.push(hole);
  return new THREE.ShapeGeometry(shape, 14);
}

// Gradiente radial en canvas (sombra de contacto bajo la base).
export function makeBlobTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(0,0,0,0.85)");
    g.addColorStop(0.5, "rgba(0,0,0,0.38)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}
