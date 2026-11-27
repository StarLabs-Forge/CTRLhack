import { gsap } from "gsap";

// Estado mutable de la coreografía. GSAP lo anima; la escena lo lee en cada
// frame (sin pasar por React: nada de re-renders durante la animación).
export interface SceneState {
  fade: number; // aparición desde la oscuridad (luces + opacidad del canvas)
  cam: number; // acercamiento de cámara + rotación de entrada (0 → 1)
  power: number; // encendido de la pantalla (línea de luz → apertura)
  logo: number; // revelado del isotipo
  wave: number; // posición de la onda de energía por el borde (0 → 1)
  waveGain: number; // intensidad de la onda (1 la primera vez, menos en los pulsos)
  idle: number; // brillo tenue del borde en reposo
  shapes: number; // figuras geométricas de fondo
  panels: number[]; // progreso de cada interfaz flotante (0 = dentro de la pantalla)
  started: boolean;
  done: boolean;
}

export function createState(panelCount: number): SceneState {
  return {
    fade: 0,
    cam: 0,
    power: 0,
    logo: 0,
    wave: 0,
    waveGain: 1,
    idle: 0,
    shapes: 0,
    panels: Array.from({ length: panelCount }, () => 0),
    started: false,
    done: false,
  };
}

// Secuencia de entrada (~5 s). Todo arranca en negro:
//   0.0  la escena emerge de la oscuridad + cámara empieza a acercarse y girar
//   1.0  la pantalla se enciende: línea cobriza → se abre
//   1.9  el isotipo se revela con un barrido de luz
//   2.0  una onda de energía recorre los bordes del equipo
//   2.8+ las interfaces emergen de la pantalla, una tras otra
//   3.4  figuras geométricas de fondo
// Al terminar, un pulso suave de la onda se repite cada ~10 s.
export function playIntro(S: SceneState): gsap.core.Timeline {
  S.started = true;
  const tl = gsap.timeline({
    onComplete: () => {
      S.done = true;
      startPulse(S);
    },
  });
  tl.to(S, { fade: 1, duration: 1.8, ease: "power1.inOut" }, 0)
    .to(S, { cam: 1, duration: 4.4, ease: "power3.out" }, 0)
    .to(S, { power: 1, duration: 1.15, ease: "power2.inOut" }, 1.0)
    .to(S, { idle: 1, duration: 1.4, ease: "power1.out" }, 1.7)
    .to(S, { logo: 1, duration: 1.9, ease: "power2.inOut" }, 1.9)
    .to(S, { wave: 1, duration: 2.1, ease: "none" }, 2.0);
  S.panels.forEach((_, i) => {
    tl.to(S.panels, { [i]: 1, duration: 1.5, ease: "power3.out" }, 2.8 + i * 0.17);
  });
  tl.to(S, { shapes: 1, duration: 1.6, ease: "power2.out" }, 3.4);
  return tl;
}

function startPulse(S: SceneState) {
  S.wave = 0;
  S.waveGain = 0.45;
  gsap.to(S, { wave: 1, duration: 2.4, ease: "none", repeat: -1, repeatDelay: 8, delay: 6 });
}

// Vuelve la coreografía al negro inicial para poder repetir la intro.
export function resetState(S: SceneState) {
  const fresh = createState(S.panels.length);
  Object.assign(S, fresh, { panels: S.panels.map(() => 0) });
}

export function stopAnimations(S: SceneState, tl: gsap.core.Timeline | null) {
  tl?.kill();
  gsap.killTweensOf(S);
  gsap.killTweensOf(S.panels);
}
