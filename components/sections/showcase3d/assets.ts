import * as THREE from "three";

// Isotipo oficial → textura. Se rasteriza desde public/brand/isotipo.svg (el
// archivo oficial, sin tocar su geometría). Lo único que se añade es width/height
// al <svg> para que el navegador lo rasterice a tamaño completo (sin ellos
// Safari lo dibuja a 300×150 y se ve borroso). Proporción 2:1 respetada.
export async function loadLogoTexture(width: number, maxAnisotropy: number): Promise<THREE.CanvasTexture> {
  const height = width / 2;
  const res = await fetch("/brand/isotipo.svg");
  if (!res.ok) throw new Error("isotipo.svg no disponible");
  const svg = (await res.text()).replace("<svg ", `<svg width="${width}" height="${height}" `);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("no se pudo rasterizar el isotipo"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d no disponible");
    ctx.drawImage(img, 0, 0, width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, maxAnisotropy);
    return texture;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Textura 1×1 transparente mientras llega el isotipo.
export function makePlaceholderTexture(): THREE.DataTexture {
  const tex = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
  tex.needsUpdate = true;
  return tex;
}

// Los paneles dibujan texto en canvas: hay que esperar a las fuentes de marca
// (cargadas por <link> en index.html) o saldría la tipografía de respaldo.
let fontsPromise: Promise<void> | null = null;
export function loadBrandFonts(): Promise<void> {
  if (!fontsPromise) {
    const loads = Promise.all([
      document.fonts.load('600 40px "Poppins"'),
      document.fonts.load('500 20px "JetBrains Mono"'),
      document.fonts.load('500 20px "Poppins"'),
    ]).then(() => undefined);
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, 2500));
    fontsPromise = Promise.race([loads, timeout]).catch(() => undefined);
  }
  return fontsPromise;
}
