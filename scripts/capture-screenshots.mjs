// Genera las capturas reales de los proyectos del portafolio.
//
//   npm run shots                 → todos los proyectos públicos
//   npm run shots -- check kolla  → solo esos (actualización individual)
//   npm run shots -- --list       → qué se capturaría, sin tocar nada
//
// Las capturas se hacen UNA vez (aquí, en desarrollo) y se versionan en el repo:
// el sitio solo sirve archivos estáticos, nadie genera capturas al visitarlo.
//
// Reglas:
//  · Solo proyectos con `isPublic: true` y `appUrl` en data/portfolioProjects.ts
//    (la única fuente de URLs: no hay una lista paralela aquí). Nunca se captura
//    nada privado ni se navega a una URL que no esté en esa lista.
//  · 1920×1080, sin sesión ni cookies, con movimiento reducido para que las
//    animaciones de entrada no dejen la captura a medias.
//  · Salida: public/screenshots/<slug>.webp (1920) y <slug>-960.webp (tarjetas),
//    más data/screenshots.json con ruta, medidas y fecha.
//  · Si una página falla, NO se toca su captura anterior ni su registro: se
//    conserva la última válida.
//  · También detecta si la página permite incrustarse (X-Frame-Options /
//    CSP frame-ancestors) para decidir entre visor interactivo o captura estática.
//
// Requiere Chrome o Edge instalado (playwright-core no descarga navegadores).
// Otro navegador: CHROME_PATH="C:\ruta\al\chrome.exe" npm run shots
import { chromium } from "playwright-core";
import sharp from "sharp";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { portfolioProjects } from "../data/portfolioProjects.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "screenshots");
const MANIFEST = join(ROOT, "data", "screenshots.json");
const VIEWPORT = { width: 1920, height: 1080 };
const NAV_TIMEOUT = 45_000;

const args = process.argv.slice(2);
const listOnly = args.includes("--list");
const wanted = args.filter((a) => !a.startsWith("--"));

const targets = portfolioProjects.filter((p) => p.isPublic && p.appUrl);
const unknown = wanted.filter((slug) => !portfolioProjects.some((p) => p.slug === slug));
const notPublic = wanted.filter((slug) => portfolioProjects.some((p) => p.slug === slug && !targets.includes(p)));
if (unknown.length) fail(`Proyecto(s) inexistente(s): ${unknown.join(", ")}`);
if (notPublic.length) fail(`No son públicos o no tienen URL (no se capturan): ${notPublic.join(", ")}`);
const queue = wanted.length ? targets.filter((p) => wanted.includes(p.slug)) : targets;

if (listOnly) {
  for (const p of queue) console.log(`${p.slug.padEnd(14)} ${p.appUrl}`);
  process.exit(0);
}
if (!queue.length) fail("No hay proyectos públicos con URL para capturar.");

const manifest = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, "utf8")) : {};
await mkdir(OUT_DIR, { recursive: true });

const browser = await launch();
const results = [];
for (const project of queue) {
  process.stdout.write(`· ${project.slug.padEnd(14)} ${project.appUrl} … `);
  try {
    const shot = await capture(browser, project);
    manifest[project.slug] = shot;
    // Se guarda tras CADA captura: si algo se cuelga después, no se pierde lo ya hecho.
    await saveManifest();
    results.push({ slug: project.slug, ok: true });
    console.log(`ok (${shot.embeddable ? "incrustable" : "NO incrustable"})`);
  } catch (error) {
    const kept = Boolean(manifest[project.slug]);
    results.push({ slug: project.slug, ok: false, kept });
    console.log(`FALLÓ — ${error.message}${kept ? " · se conserva la última captura válida" : " · no hay captura previa"}`);
  }
}

// Chrome en Windows a veces tarda en cerrar: con tope de tiempo, y se sale igual.
await Promise.race([browser.close().catch(() => undefined), new Promise((resolve) => setTimeout(resolve, 5000))]);

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} capturas actualizadas.`);
process.exit(failed.some((r) => !r.kept) ? 1 : 0);

async function saveManifest() {
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + "\n");
}

// --------------------------------------------------------------------------

async function launch() {
  const custom = process.env.CHROME_PATH;
  const attempts = custom ? [{ executablePath: custom }] : [{ channel: "chrome" }, { channel: "msedge" }];
  let last;
  for (const opts of attempts) {
    try {
      return await chromium.launch({ headless: true, ...opts });
    } catch (error) {
      last = error;
    }
  }
  fail(`No se pudo abrir Chrome ni Edge (${last?.message.split("\n")[0]}). Define CHROME_PATH.`);
}

async function capture(browser, project) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    locale: "es",
    serviceWorkers: "block",
  });
  try {
    const page = await context.newPage();
    let response;
    try {
      response = await page.goto(project.appUrl, { waitUntil: "networkidle", timeout: NAV_TIMEOUT });
    } catch (error) {
      // Apps con websockets/polling nunca quedan "idle": basta con que cargue.
      if (!/Timeout/i.test(error.message)) throw error;
      response = await page.goto(project.appUrl, { waitUntil: "load", timeout: NAV_TIMEOUT });
    }
    if (!response || response.status() >= 400) throw new Error(`HTTP ${response?.status() ?? "sin respuesta"}`);

    // Recursos principales: fuentes e imágenes visibles, luego un respiro para
    // que termine cualquier transición de entrada.
    await page.evaluate(() => document.fonts.ready);
    await page
      .waitForFunction(() => [...document.images].every((img) => img.complete), undefined, { timeout: 10_000 })
      .catch(() => undefined);
    await page.waitForTimeout(1500);

    const png = await page.screenshot({ type: "png", clip: { x: 0, y: 0, ...VIEWPORT } });
    const embeddable = canEmbed(response.headers());

    // Escritura atómica: si algo falla antes de este punto, no se toca nada.
    const full = await sharp(png).resize(1920, 1080, { fit: "cover" }).webp({ quality: 82, effort: 5 }).toBuffer();
    const small = await sharp(png).resize(960, 540, { fit: "cover" }).webp({ quality: 80, effort: 5 }).toBuffer();
    await replace(join(OUT_DIR, `${project.slug}.webp`), full);
    await replace(join(OUT_DIR, `${project.slug}-960.webp`), small);

    return {
      src: `/screenshots/${project.slug}.webp`,
      srcSm: `/screenshots/${project.slug}-960.webp`,
      width: 1920,
      height: 1080,
      updatedAt: new Date().toISOString(),
      embeddable,
    };
  } finally {
    await Promise.race([context.close().catch(() => undefined), new Promise((resolve) => setTimeout(resolve, 5000))]);
  }
}

async function replace(target, buffer) {
  const tmp = `${target}.tmp`;
  await writeFile(tmp, buffer);
  await rm(target, { force: true });
  await rename(tmp, target);
}

// ¿Puede mostrarse en un <iframe> de otro origen? Se respeta X-Frame-Options y
// la directiva frame-ancestors de CSP: si alguna lo restringe, no se incrusta.
function canEmbed(headers) {
  const xfo = (headers["x-frame-options"] ?? "").toLowerCase();
  if (xfo.includes("deny") || xfo.includes("sameorigin") || xfo.includes("allow-from")) return false;
  const csp = headers["content-security-policy"] ?? "";
  const match = csp.match(/frame-ancestors([^;]*)/i);
  if (match) {
    const sources = match[1].trim().split(/\s+/).filter(Boolean);
    if (!sources.includes("*")) return false;
  }
  return true;
}

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}
