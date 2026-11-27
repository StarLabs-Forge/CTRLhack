// Configuración central de la animación del proceso. TODAS las duraciones
// viven aquí (ms): el controlador las usa para el temporizador y las escenas
// las reciben como `--scene-dur` en CSS, así coreografía y reloj no se separan.
export const PROCESS_TIMING = {
  /** Desplazamiento de la energía entre nodos: 600–900 ms según la distancia. */
  travelMin: 600,
  travelMax: 900,
  travelPerExtraStep: 100,
  /** Encendido del nodo al llegar la energía (antes de arrancar la escena). */
  nodeActivate: 400,
  /** Duración de cada escena, en orden: Hablamos · Definimos · Construimos · Probamos · Lanzamos. */
  scenes: [3000, 2500, 3500, 3000, 3500],
  /** Pausa con el resultado final antes de reiniciar el recorrido. */
  hold: 2000,
  /** Retroceso suave de la energía al reiniciar. */
  rewind: 900,
  /** Espera tras retirar el cursor de una escena terminada, antes de continuar. */
  resumeAfterLeave: 500,
} as const;

export const PROCESS_STEPS = [
  { num: "01", title: "Hablamos", description: "Entendemos qué necesitas." },
  { num: "02", title: "Definimos", description: "Convertimos la idea en una solución clara." },
  { num: "03", title: "Construimos", description: "Diseñamos y desarrollamos." },
  { num: "04", title: "Probamos", description: "Comprobamos que funcione." },
  { num: "05", title: "Lanzamos", description: "Lo ponemos en marcha y seguimos evolucionando." },
] as const;

export const STEP_COUNT = PROCESS_STEPS.length;

/** Factor de lentitud de las escenas en bucle (todas a la vez): más lento = más natural. */
export const LOOP_SLOWDOWN = 2.6;
