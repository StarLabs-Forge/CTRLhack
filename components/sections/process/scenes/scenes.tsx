import type { CSSProperties } from "react";

// Escenas del proceso. Son puramente presentacionales: su coreografía vive en
// scenes.css, expresada en FRACCIONES de la duración de la escena (--at inicio,
// --len duración), y esa duración llega desde processConfig vía --scene-dur.
// Todo es CSS 3D + SVG: cero contextos WebGL, solo transform/opacity en caliente.

export interface SceneProps {
  state: "idle" | "playing" | "done" | "loop";
}

const v = (o: Record<string, number | string>) => o as CSSProperties;

/* ───────── 01 · Hablamos ───────── */
// Conversación completa: cada mensaje llega con su indicador de "escribiendo"
// y, al ir creciendo, el chat sube para dejar lugar al siguiente.
const CHAT = [
  { side: "l", text: "Tengo una idea" },
  { side: "r", text: "¡Qué bien! Cuéntame más." },
  { side: "l", text: "Quiero vender en línea." },
  { side: "r", text: "Podemos armar tu tienda." },
  { side: "l", text: "¿Y cuánto tomaría?" },
  { side: "r", text: "Un plan claro en días." },
  { side: "l", text: "¿Y cuándo arrancamos?" },
  { side: "r", text: "Esta semana mismo." },
] as const;

export function ConversationScene({ state }: SceneProps) {
  return (
    <div className="scene chat" data-state={state}>
      <div className="chat-tilt">
        <div className="chat-win sc-in" style={v({ "--at": 0, "--len": 0.12 })}>
          <div className="chat-bar">
            <i /><i /><i />
            <span>ctrlhack · chat</span>
          </div>
          <div className="chat-stack">
            <div className="chat-track" style={v({ "--at": 0.1, "--len": 0.8 })}>
              {CHAT.map((m, i) => {
                const typeAt = 0.04 + i * 0.1;
                const at = typeAt + 0.06;
                return (
                  <div className={`chat-row ${m.side}`} style={v({ "--y": 2 + i * 10 })} key={m.text}>
                    <div className="typing sc-blip" style={v({ "--at": typeAt, "--len": at - typeAt })}>
                      <b /><b /><b />
                    </div>
                    <div className="bubble sc-in" style={v({ "--at": at, "--len": 0.07, "--fx": m.side === "l" ? "-6cqw" : "6cqw" })}>
                      {m.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="chat-ok sc-in" style={v({ "--at": 0.88, "--len": 0.08 })}>✓ Acordado</div>
        </div>
      </div>
    </div>
  );
}

/* ───────── 02 · Definimos ───────── */
// Cada tarjeta recorre tres posiciones: dispersa (s) → esquema (t) → wireframe (w).
// Valores en unidades de ancho (1 u = 1% del ancho de la escena).
const CARDS = [
  { s: [70, 52, 14, 8], t: [38, 6, 24, 9], w: [10, 9, 80, 8] }, // raíz → cabecera
  { s: [6, 6, -12, -6], t: [10, 28, 24, 9], w: [10, 20, 20, 42] }, // → barra lateral
  { s: [52, 56, 8, 10], t: [66, 28, 24, 9], w: [34, 20, 56, 18] }, // → bloque hero
  { s: [80, 8, -18, 4], t: [2, 50, 24, 9], w: [34, 42, 26, 20] }, // → contenido 1
  { s: [24, 50, 20, -8], t: [30, 50, 24, 9], w: [64, 42, 26, 20] }, // → contenido 2
] as const;

const LINES = ["M50 15 C50 22 22 21 22 28", "M50 15 C50 22 78 21 78 28", "M22 37 C22 43 14 44 14 50", "M22 37 C22 43 42 44 42 50"];

export function PlanningScene({ state }: SceneProps) {
  return (
    <div className="scene plan" data-state={state}>
      <div className="plan-frame sc-in" style={v({ "--at": 0.66, "--len": 0.14 })} />
      {CARDS.map((c, i) => (
        <div
          className="plan-card"
          key={i}
          style={v({
            "--at": i * 0.012,
            "--sl": c.s[0], "--st": c.s[1], "--sr": `${c.s[2]}deg`, "--sz": `${(i % 3) * 6 - 6}cqw`,
            "--tl": c.t[0], "--tt": c.t[1], "--tw": c.t[2], "--th": c.t[3],
            "--wl": c.w[0], "--wt": c.w[1], "--ww": c.w[2], "--wh": c.w[3],
          })}
        >
          <i />
        </div>
      ))}
      <svg className="plan-lines" viewBox="0 0 100 72" preserveAspectRatio="none" aria-hidden="true">
        {LINES.map((d, i) => (
          <path d={d} pathLength={1} key={d} style={v({ "--at": 0.04 + i * 0.03 })} />
        ))}
      </svg>
      <div className="plan-sweep" />
      <div className="plan-ok sc-in" style={v({ "--at": 0.88, "--len": 0.08 })}>✓ Plan listo</div>
    </div>
  );
}

/* ───────── 03 · Construimos ───────── */
// x, y, ancho, fondo, alto (u) sobre un plano de 64×44 + posición dispersa de partida.
const BOXES = [
  { p: [0, 0, 64, 8, 7], s: [-22, -26, 30, -20], at: 0.5 },
  { p: [0, 12, 16, 32, 7], s: [-30, 20, 22, 25], at: 0.54 },
  { p: [20, 12, 44, 14, 11], s: [26, -24, 36, 15], at: 0.58 },
  { p: [20, 30, 20, 14, 9], s: [-6, 34, 18, -30], at: 0.62 },
  { p: [44, 30, 20, 14, 16], s: [34, 22, 40, 35], at: 0.66 },
] as const;
const LINKS = [
  [16, 17, 4, 2],
  [30, 8, 2, 4],
  [28, 26, 2, 4],
  [52, 26, 2, 4],
] as const;

export function ConstructionScene({ state }: SceneProps) {
  return (
    <div className="scene cons" data-state={state}>
      <div className="code-win">
        <div className="code-bar"><i /><i /><i /><span>app.tsx</span></div>
        {["<Header brand />", "<Sidebar nav />", "<Hero cta />", "<Cards data />", "deploy(app)"].map((l, i) => (
          <code className="code-line" style={v({ "--at": 0.1 + i * 0.075 })} key={l}>
            <em>{l}</em>
          </code>
        ))}
      </div>
      <div className="cons-stage">
        {BOXES.map((b, i) => (
          <div className="box" key={i} style={v({ "--x": b.p[0], "--y": b.p[1], "--w": b.p[2], "--d": b.p[3], "--h": b.p[4] })}>
            <div
              className="box-in"
              style={v({ "--at": b.at, "--sx": `${b.s[0]}cqw`, "--sy": `${b.s[1]}cqw`, "--sz": `${b.s[2]}cqw`, "--sr": `${b.s[3]}deg` })}
            >
              <i className="f top" /><i className="f front" /><i className="f right" />
            </div>
          </div>
        ))}
        {LINKS.map((l, i) => (
          <div className="link" key={i} style={v({ "--x": l[0], "--y": l[1], "--w": l[2], "--d": l[3], "--at": 0.82 + i * 0.03 })} />
        ))}
      </div>
    </div>
  );
}

/* ───────── 04 · Probamos ───────── */
const BLOCKS = [
  { cls: "hd", r: [4, 4, 80, 7], at: 0.18 },
  { cls: "sb", r: [4, 14, 20, 40], at: 0.26 },
  { cls: "hr", r: [28, 14, 56, 16], at: 0.32 },
  { cls: "c1", r: [28, 34, 26, 20], at: 0.4 },
  { cls: "c2 bug", r: [58, 34, 26, 20], at: 0.34 },
] as const;

export function TestingScene({ state }: SceneProps) {
  return (
    <div className="scene test" data-state={state}>
      <div className="test-panel">
        <div className="test-bar"><i /><i /><i /></div>
        {BLOCKS.map((b) => (
          <div className={`t-block ${b.cls}`} key={b.cls} style={v({ "--l": b.r[0], "--t": b.r[1], "--w": b.r[2], "--h": b.r[3], "--at": b.at })}>
            <span className="t-badge" />
            <u /><u />
          </div>
        ))}
        <div className="t-scan" />
        <div className="t-msg t-err sc-blip" style={v({ "--at": 0.52, "--len": 0.19 })}>✕ Error en tarjeta</div>
        <div className="t-msg t-fix sc-blip" style={v({ "--at": 0.71, "--len": 0.13 })}>↻ Corrigiendo</div>
      </div>
      <div className="t-chip sc-in" style={v({ "--at": 0.88, "--len": 0.08 })}>✓ 12/12 superadas</div>
    </div>
  );
}

/* ───────── 05 · Lanzamos ───────── */
// Chispas que suben desde la laptop cuando se lanza (posición fija: no es aleatoria
// en cada render, así la escena siempre se ve igual).
const SPARKS = [
  { x: -14, d: 0.0 },
  { x: -6, d: 0.22 },
  { x: 3, d: 0.1 },
  { x: 11, d: 0.36 },
  { x: -10, d: 0.5 },
  { x: 7, d: 0.62 },
] as const;

export function LaunchScene({ state }: SceneProps) {
  return (
    <div className="scene lap" data-state={state}>
      <div className="lap-floor" />
      <div className="lap-ring" />
      <div className="lap-ring lap-ring--2" />
      <div className="lap-beam" />
      {SPARKS.map((s, i) => (
        <span key={i} className="lap-spark" style={v({ "--x": s.x, "--d": s.d })} />
      ))}
      <div className="lap-rig">
        <div className="lap-lid">
          <div className="lap-screen">
            <div className="lap-url sc-in" style={v({ "--at": 0.2, "--len": 0.1 })}>
              <i /><i /><i />
              <span>ctrlhack.com</span>
            </div>
            {/* la página ya está publicada: se muestra completa desde el inicio */}
            <img className="lap-shot sc-in" style={v({ "--at": 0.12, "--len": 0.14 })} src="/screenshots/check-960.webp" alt="" loading="lazy" decoding="async" draggable={false} />
            <div className="lap-status sc-in" style={v({ "--at": 0.3, "--len": 0.1 })}>
              <i /> EN LÍNEA
            </div>
            <div className="lap-sheen" />
          </div>
        </div>
        <div className="lap-base">
          <span className="lap-keys" />
          <span className="lap-pad" />
        </div>
      </div>
    </div>
  );
}
