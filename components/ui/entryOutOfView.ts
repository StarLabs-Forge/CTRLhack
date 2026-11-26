// ¿El elemento observado salió POR COMPLETO del viewport? Se calcula con su caja
// geométrica (boundingClientRect), no con intersectionRatio: un elemento con
// clip-path propio (variante "assemble" de <Reveal>) reporta ratio 0 mientras
// su recorte está cerrado aunque esté en pantalla, y re-armarlo por eso
// provocaba un parpadeo infinito (entra → se recorta → "sale" → entra…).
export function entryOutOfView(entry: IntersectionObserverEntry): boolean {
  const r = entry.boundingClientRect;
  return r.bottom <= 0 || r.top >= window.innerHeight;
}
