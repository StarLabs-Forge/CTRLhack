// GLSL de la escena. Todos los efectos de luz son aditivos y salen en alfa
// premultiplicado (rgb ≈ alfa·color): así componen bien sobre el fondo del hero
// aunque el canvas sea transparente.

// ---------------------------------------------------------------------------
// Pantalla: encendido (línea de luz cobriza → apertura vertical), isotipo
// oficial revelado con un barrido de luz progresivo y un brillo de cristal.
// El isotipo NO se recolorea: la máscara solo decide cuánto de él se ve y el
// frente del barrido añade luz cobriza mientras se revela (al terminar, 0).
// ---------------------------------------------------------------------------
export const SCREEN_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const SCREEN_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uMap;
uniform float uPower;
uniform float uLogo;
uniform float uTime;
uniform float uAspect;
uniform vec2 uPtr;
uniform vec3 uCopper;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;
  vec2 c = uv - 0.5;

  // --- encendido: primero crece una línea horizontal, luego se abre ---
  float a = smoothstep(0.0, 0.42, uPower);
  float bRaw = clamp((uPower - 0.42) / 0.58, 0.0, 1.0);
  float b = bRaw * bRaw * (3.0 - 2.0 * bRaw);
  float on = step(0.0005, uPower);
  float halfW = a * 0.5;
  float halfH = mix(0.003, 0.5, b);
  float mx = 1.0 - smoothstep(halfW - 0.03, halfW, abs(c.x));
  float my = 1.0 - smoothstep(halfH - 0.004, halfH + 0.002, abs(c.y));
  float lit = mx * my * on;
  float line = exp(-abs(c.y) * (70.0 + 30.0 * b)) * mx * (1.0 - 0.85 * b) * on;
  float core = exp(-abs(c.y) * 260.0) * mx * (1.0 - b) * on;

  // --- fondo de pantalla: cálido muy oscuro, viñeta y rejilla tenue ---
  float r = length(c * vec2(uAspect, 1.0));
  vec3 col = mix(vec3(0.022, 0.012, 0.006), vec3(0.003, 0.002, 0.0015), smoothstep(0.0, 0.95, r));
  vec2 gp = uv * vec2(26.0 * uAspect / 1.6, 26.0);
  vec2 gl = abs(fract(gp) - 0.5);
  float grid = smoothstep(0.47, 0.5, max(gl.x, gl.y));
  col += uCopper * grid * 0.010 * b;

  // --- isotipo oficial, ajustado por ancho (proporción 2:1 intacta) ---
  float wL = 0.74;
  float hL = wL * uAspect / 2.0;
  vec2 lp = vec2((uv.x - 0.5) / wL + 0.5, (uv.y - 0.5) / hL + 0.5);
  vec4 lg = texture2D(uMap, lp);
  lg *= step(0.0, lp.x) * step(lp.x, 1.0) * step(0.0, lp.y) * step(lp.y, 1.0);

  // revelado: barrido diagonal de luz (de izquierda a derecha, ligeramente
  // ascendente). m = cuánto del isotipo es visible; band = frente luminoso.
  float s = lp.x * 0.9 + lp.y * 0.25;
  float edge = mix(-0.3, 1.45, uLogo);
  float m = 1.0 - smoothstep(edge - 0.3, edge, s);
  float band = exp(-pow((s - (edge - 0.1)) * 8.0, 2.0));

  col = mix(col, lg.rgb, lg.a * m);
  col += uCopper * band * lg.a * 1.1;

  // --- reflejo de cristal: banda difusa que se desplaza con el cursor ---
  float sh = clamp(1.0 - abs(c.x * 0.8 + c.y * 0.6 - uPtr.x * 0.28 + 0.1) * 3.4, 0.0, 1.0);
  col += vec3(1.0, 0.86, 0.72) * pow(sh, 3.0) * 0.03;

  // --- línea de encendido + parpadeo de tubo mientras se abre ---
  col = col * lit + uCopper * line * 2.2 + vec3(1.0, 0.93, 0.8) * core * 2.0;
  col *= 1.0 + (hash(uv * vec2(400.0, 300.0) + uTime) - 0.5) * 0.05 * (1.0 - b);

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

// ---------------------------------------------------------------------------
// Onda de energía: recorre el aro del borde una vez; después queda un brillo
// tenue en reposo y, de vez en cuando, un pulso suave.
// ---------------------------------------------------------------------------
export const RING_VERT = /* glsl */ `
varying vec2 vP;
void main() {
  vP = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const RING_FRAG = /* glsl */ `
precision highp float;
varying vec2 vP;
uniform float uWave;
uniform float uGain;
uniform float uIdle;
uniform float uTime;
uniform vec2 uHalf;
uniform vec3 uCopper;

void main() {
  float ang = atan(vP.y / uHalf.y, vP.x / uHalf.x) / 6.2831853 + 0.5;
  float d = mod(uWave - ang, 1.0);
  float act = smoothstep(0.0, 0.02, uWave) * (1.0 - smoothstep(0.985, 1.0, uWave));
  float trail = exp(-d * 7.0);
  float head = exp(-d * 55.0);
  float wave = (trail * 0.75 + head * 1.5) * act * uGain;
  float idle = uIdle * (0.28 + 0.07 * sin(uTime * 1.3));
  float v = wave + idle;
  vec3 col = uCopper * v + vec3(1.0, 0.85, 0.6) * head * act * uGain * 0.7;
  gl_FragColor = vec4(col, clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0));
  #include <colorspace_fragment>
}
`;

// ---------------------------------------------------------------------------
// Luz ambiental: halo de cobre detrás del equipo.
// ---------------------------------------------------------------------------
export const GLOW_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const GLOW_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uAmt;
uniform vec3 uCopper;
void main() {
  vec2 c = (vUv - vec2(0.5, 0.55)) * vec2(1.0, 1.5);
  float g = exp(-dot(c, c) * 9.0);
  vec3 col = uCopper * g * uAmt;
  gl_FragColor = vec4(col, g * uAmt);
  #include <colorspace_fragment>
}
`;

// ---------------------------------------------------------------------------
// Haz volumétrico: cono abierto con borde suave (fresnel) y caída hacia el
// extremo ancho. Es solo una sugerencia de luz — muy tenue.
// ---------------------------------------------------------------------------
export const BEAM_VERT = /* glsl */ `
varying float vT;
varying vec3 vN;
varying vec3 vV;
void main() {
  vT = uv.y;
  vN = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

export const BEAM_FRAG = /* glsl */ `
precision highp float;
varying float vT;
varying vec3 vN;
varying vec3 vV;
uniform float uAmt;
uniform vec3 uColor;
void main() {
  float f = pow(abs(dot(normalize(vN), normalize(vV))), 2.2);
  float a = f * (0.12 + 0.88 * pow(vT, 1.3)) * uAmt;
  gl_FragColor = vec4(uColor * a, a);
  #include <colorspace_fragment>
}
`;

// ---------------------------------------------------------------------------
// Polvo en suspensión: pocas partículas que derivan y titilan en el haz.
// ---------------------------------------------------------------------------
export const DUST_VERT = /* glsl */ `
attribute vec4 aSeed;
uniform float uTime;
uniform float uPx;
uniform float uAmt;
varying float vA;
void main() {
  vec3 p = position;
  p.x += sin(uTime * 0.21 + aSeed.x * 6.283) * 0.35;
  p.z += cos(uTime * 0.17 + aSeed.y * 6.283) * 0.35;
  p.y = mod(p.y + uTime * 0.035 * (0.4 + aSeed.w) + 2.6, 5.4) - 2.6;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (1.6 + aSeed.z * 2.2) * uPx * (9.0 / -mv.z);
  float tw = 0.5 + 0.5 * sin(uTime * 0.8 + aSeed.x * 20.0);
  vA = uAmt * (0.25 + 0.75 * tw * tw) * (0.4 + 0.6 * aSeed.z);
  gl_Position = projectionMatrix * mv;
}
`;

export const DUST_FRAG = /* glsl */ `
precision highp float;
varying float vA;
uniform vec3 uColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  gl_FragColor = vec4(uColor * a * vA, a * vA);
  #include <colorspace_fragment>
}
`;
