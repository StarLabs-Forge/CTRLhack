// Contenido de las interfaces flotantes, dibujado en canvas 2D y subido como
// textura. Cada panel declara `sig`: una firma barata de lo que se vería en este
// instante; solo se redibuja (y se sube la textura) cuando la firma cambia.

export interface Tokens {
  bg900: string;
  bg800: string;
  line: string;
  lineSoft: string;
  t100: string;
  t300: string;
  t500: string;
  t600: string;
  glow: string;
  copper: string;
  ivory: string;
  ok: string;
  display: string;
  mono: string;
  body: string;
}

// Los colores y fuentes salen de tokens.css (única fuente de verdad visual).
export function readTokens(): Tokens {
  const cs = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    bg900: get("--bg-900", "#120e0b"),
    bg800: get("--bg-800", "#1a1511"),
    line: get("--line", "#3a2f27"),
    lineSoft: get("--line-soft", "#1f1914"),
    t100: get("--text-100", "#f5f0eb"),
    t300: get("--text-300", "#cfc5bc"),
    t500: get("--text-500", "#a1968d"),
    t600: get("--text-600", "#8f847a"),
    glow: get("--glow", "#ff9d45"),
    copper: get("--copper", "#b87333"),
    ivory: get("--ivory", "#ffdab9"),
    ok: get("--ok", "#7ea888"),
    display: get("--display", '"Space Grotesk", sans-serif'),
    mono: get("--mono", '"JetBrains Mono", monospace'),
    body: get("--body", "Inter, sans-serif"),
  };
}

export interface ArtState {
  t: number; // segundos desde que el panel apareció
  p: number; // progreso de emergencia 0..1 (lineal)
  k: Tokens;
}

export type Art = (ctx: CanvasRenderingContext2D, w: number, h: number, s: ArtState) => void;

const easeOut = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

// Tarjeta de cristal oscuro: translúcida, brillo superior, borde de cobre fino y
// esquina superior derecha cortada en diagonal (como las tarjetas de la marca).
function frame(ctx: CanvasRenderingContext2D, w: number, h: number, cut = 22) {
  const r = 8;
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(1, 1);
  const iw = w - 2;
  const ih = h - 2;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(iw - cut, 0);
  ctx.lineTo(iw, cut);
  ctx.lineTo(iw, ih - r);
  ctx.quadraticCurveTo(iw, ih, iw - r, ih);
  ctx.lineTo(r, ih);
  ctx.quadraticCurveTo(0, ih, 0, ih - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();

  const body = ctx.createLinearGradient(0, 0, 0, ih);
  body.addColorStop(0, "rgba(30,24,19,0.90)");
  body.addColorStop(1, "rgba(14,10,8,0.88)");
  ctx.fillStyle = body;
  ctx.fill();

  ctx.save();
  ctx.clip();
  const sheen = ctx.createLinearGradient(0, 0, iw * 0.7, ih * 0.55);
  sheen.addColorStop(0, "rgba(255,240,225,0.10)");
  sheen.addColorStop(0.5, "rgba(255,240,225,0.02)");
  sheen.addColorStop(1, "rgba(255,240,225,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, iw, ih);
  ctx.restore();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,157,69,0.30)";
  ctx.stroke();

  // filete diagonal más vivo sobre el corte
  const edge = ctx.createLinearGradient(iw - cut, 0, iw, cut);
  edge.addColorStop(0, "rgba(255,218,185,0.9)");
  edge.addColorStop(1, "rgba(255,157,69,0.9)");
  ctx.beginPath();
  ctx.moveTo(iw - cut, 0);
  ctx.lineTo(iw, cut);
  ctx.strokeStyle = edge;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();
}

function title(ctx: CanvasRenderingContext2D, s: ArtState, text: string, x = 26, y = 40, size = 19) {
  ctx.font = `500 ${size}px ${s.k.mono}`;
  ctx.fillStyle = s.k.t500;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, x, y);
}

// ---------------------------------------------------------------------------
// 1 · Resumen del proyecto (mismos datos que el panel anterior)
// ---------------------------------------------------------------------------
export const drawStats: Art = (ctx, w, h, s) => {
  frame(ctx, w, h);
  title(ctx, s, "Panel del proyecto");
  const e = easeOut(s.p);
  const cells: Array<{ label: string; value: string; ok?: boolean }> = [
    { label: "Progreso", value: `${Math.round(82 * e)}%` },
    { label: "Entregas", value: `${Math.round(12 * e)}` },
    { label: "Estado", value: "Activo", ok: true },
  ];
  const gap = 12;
  const cw = (w - 26 * 2 - gap * 2) / 3;
  cells.forEach((c, i) => {
    const x = 26 + i * (cw + gap);
    const y = 66;
    const ch = h - y - 28;
    ctx.fillStyle = "rgba(255,255,255,0.025)";
    ctx.fillRect(x, y, cw, ch);
    ctx.strokeStyle = "rgba(255,157,69,0.16)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 0.75, y + 0.75, cw - 1.5, ch - 1.5);
    ctx.font = `400 15px ${s.k.body}`;
    ctx.fillStyle = s.k.t500;
    ctx.fillText(c.label, x + 14, y + 30);
    ctx.font = `600 ${c.ok ? 30 : 38}px ${s.k.display}`;
    ctx.fillStyle = c.ok ? s.k.ok : s.k.t100;
    ctx.fillText(c.value, x + 14, y + ch - 20);
  });
};
export const sigStats = (s: ArtState) => Math.round(s.p * 36);

// ---------------------------------------------------------------------------
// 2 · Gráfico de entregas: línea viva que se desplaza muy despacio
// ---------------------------------------------------------------------------
export const drawChart: Art = (ctx, w, h, s) => {
  frame(ctx, w, h);
  title(ctx, s, "Entregas · 30 días");
  ctx.font = `600 22px ${s.k.display}`;
  ctx.fillStyle = s.k.ok;
  ctx.textAlign = "right";
  ctx.fillText("+18%", w - 46, 40);
  ctx.textAlign = "left";

  const padX = 28;
  const top = 74;
  const bottom = h - 34;
  const n = 26;
  ctx.strokeStyle = "rgba(255,218,185,0.07)";
  ctx.lineWidth = 1;
  for (let g = 0; g < 4; g++) {
    const y = top + ((bottom - top) * g) / 3;
    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(w - padX, y);
    ctx.stroke();
  }

  const pts: Array<[number, number]> = [];
  const reveal = easeOut(s.p) * (n - 1);
  for (let i = 0; i < n; i++) {
    if (i > reveal + 0.001) break;
    const v = 0.38 + (i / n) * 0.28 + 0.16 * Math.sin(i * 0.62 + s.t * 0.7) + 0.08 * Math.sin(i * 1.7 - s.t * 0.5);
    const x = padX + ((w - padX * 2) * i) / (n - 1);
    const y = bottom - Math.min(0.96, Math.max(0.05, v)) * (bottom - top);
    pts.push([x, y]);
  }
  if (pts.length < 2) return;

  const path = new Path2D();
  path.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    path.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
  }
  const last = pts[pts.length - 1];
  path.lineTo(last[0], last[1]);

  const area = new Path2D(path);
  area.lineTo(last[0], bottom);
  area.lineTo(pts[0][0], bottom);
  area.closePath();
  const fill = ctx.createLinearGradient(0, top, 0, bottom);
  fill.addColorStop(0, "rgba(255,157,69,0.30)");
  fill.addColorStop(1, "rgba(255,157,69,0)");
  ctx.fillStyle = fill;
  ctx.fill(area);

  const stroke = ctx.createLinearGradient(padX, 0, w - padX, 0);
  stroke.addColorStop(0, s.k.copper);
  stroke.addColorStop(1, s.k.glow);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke(path);

  ctx.save();
  ctx.shadowColor = s.k.glow;
  ctx.shadowBlur = 14;
  ctx.fillStyle = s.k.ivory;
  ctx.beginPath();
  ctx.arc(last[0], last[1], 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};
export const sigChart = (s: ArtState) => Math.floor(s.t * 10);

// ---------------------------------------------------------------------------
// 3 · Fragmento de código que se "escribe" una vez y luego solo parpadea el cursor
// ---------------------------------------------------------------------------
type Tok = [string, "kw" | "id" | "fn" | "pn" | "str" | "prop" | "cm" | "ok"];
const CODE: Tok[][] = [
  [["const ", "kw"], ["app ", "id"], ["= ", "pn"], ["await ", "kw"], ["ctrlhack", "id"], [".build", "fn"], ["({", "pn"]],
  [["  idea", "prop"], [": ", "pn"], ['"tu proyecto"', "str"], [",", "pn"]],
  [["  stack", "prop"], [": [", "pn"], ['"web"', "str"], [", ", "pn"], ['"app"', "str"], [", ", "pn"], ['"sistema"', "str"], ["],", "pn"]],
  [["});", "pn"]],
  [["", "pn"]],
  [["await ", "kw"], ["app", "id"], [".deploy", "fn"], ["(", "pn"], ['"producción"', "str"], [");", "pn"]],
  [["// ✓ en línea", "ok"]],
];
const CODE_CHARS = CODE.reduce((sum, line) => sum + line.reduce((n, [t]) => n + t.length, 0), 0);
const TYPE_SPEED = 32; // caracteres por segundo
const TYPE_DELAY = 0.5;

function typedChars(s: ArtState) {
  return Math.min(CODE_CHARS, Math.max(0, Math.floor((s.t - TYPE_DELAY) * TYPE_SPEED)));
}

export const drawCode: Art = (ctx, w, h, s) => {
  frame(ctx, w, h);
  // puntos de ventana, igual que el panel anterior
  ctx.fillStyle = s.k.line;
  [0, 1, 2].forEach((i) => {
    ctx.beginPath();
    ctx.arc(32 + i * 16, 34, 4.5, 0, Math.PI * 2);
    ctx.fill();
  });
  title(ctx, s, "ctrlhack.ts", 104, 40, 17);

  const colors: Record<Tok[1], string> = {
    kw: s.k.glow,
    id: s.k.t100,
    fn: s.k.ivory,
    pn: s.k.t500,
    str: s.k.ivory,
    prop: s.k.t300,
    cm: s.k.t600,
    ok: s.k.ok,
  };
  ctx.font = `500 20px ${s.k.mono}`;
  ctx.textBaseline = "alphabetic";
  const adv = ctx.measureText("M").width;
  const lineH = 31;
  const x0 = 30;
  const y0 = 84;
  let remaining = typedChars(s);
  let cx = x0;
  let cy = y0;
  const done = remaining >= CODE_CHARS;
  for (let li = 0; li < CODE.length && remaining >= 0; li++) {
    cx = x0;
    cy = y0 + li * lineH;
    for (const [text, kind] of CODE[li]) {
      const take = Math.min(text.length, remaining);
      if (take > 0) {
        ctx.fillStyle = colors[kind];
        ctx.fillText(text.slice(0, take), cx, cy);
      }
      cx += take * adv;
      remaining -= take;
      if (take < text.length) {
        remaining = -1;
        break;
      }
    }
    if (remaining < 0) break;
  }
  // cursor de bloque: fijo mientras escribe, parpadea al terminar
  const blinkOn = !done || Math.floor(s.t * 1.9) % 2 === 0;
  if (blinkOn) {
    ctx.fillStyle = s.k.glow;
    ctx.fillRect(cx + 2, cy - 17, 10, 22);
  }
};
export const sigCode = (s: ArtState) => typedChars(s) * 2 + (Math.floor(s.t * 1.9) % 2);

// ---------------------------------------------------------------------------
// 4 · Indicador circular "Mi proyecto 75%"
// ---------------------------------------------------------------------------
export const drawRing: Art = (ctx, w, h, s) => {
  frame(ctx, w, h, 20);
  title(ctx, s, "Mi proyecto", 24, 38, 17);
  const cx = w / 2;
  const cy = h / 2 + 8;
  const r = Math.min(w, h) * 0.27;
  const e = easeOut(s.p);
  ctx.lineWidth = 15;
  ctx.lineCap = "round";
  ctx.strokeStyle = s.k.lineSoft;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  const start = -Math.PI / 2;
  const end = start + Math.PI * 2 * 0.75 * e;
  if (e > 0.01) {
    const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    g.addColorStop(0, s.k.glow);
    g.addColorStop(1, s.k.copper);
    ctx.strokeStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, end);
    ctx.stroke();
  }
  ctx.textAlign = "center";
  ctx.fillStyle = s.k.t100;
  ctx.font = `600 ${Math.round(r * 0.62)}px ${s.k.display}`;
  ctx.fillText(`${Math.round(75 * e)}%`, cx, cy + r * 0.22);
  ctx.font = `400 16px ${s.k.body}`;
  ctx.fillStyle = s.k.t500;
  ctx.fillText("Tareas al día", cx, h - 26);
  ctx.textAlign = "left";
};
export const sigRing = (s: ArtState) => Math.round(s.p * 40);

// ---------------------------------------------------------------------------
// 5 · Aviso de despliegue (chip)
// ---------------------------------------------------------------------------
export const drawChip: Art = (ctx, w, h, s) => {
  frame(ctx, w, h, 16);
  const e = easeOut(s.p);
  const cy = h / 2;
  ctx.fillStyle = "rgba(126,168,136,0.18)";
  ctx.beginPath();
  ctx.arc(40, cy, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = s.k.ok;
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(32, cy + 1);
  ctx.lineTo(38, cy + 7);
  ctx.lineTo(49, cy - 6);
  ctx.globalAlpha = e;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.font = `500 21px ${s.k.body}`;
  ctx.fillStyle = s.k.t100;
  ctx.textBaseline = "middle";
  ctx.fillText("Módulo de pagos desplegado", 72, cy + 1);
  ctx.textBaseline = "alphabetic";
};
export const sigChip = (s: ArtState) => Math.round(s.p * 20);
