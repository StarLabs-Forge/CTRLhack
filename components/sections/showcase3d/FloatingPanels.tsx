import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { loadBrandFonts } from "./assets";
import {
  drawChart,
  drawChip,
  drawCode,
  drawRing,
  drawStats,
  readTokens,
  sigChart,
  sigChip,
  sigCode,
  sigRing,
  sigStats,
  type Art,
  type ArtState,
  type Tokens,
} from "./panelArt";
import type { SceneState } from "./timeline";
import type { Rig } from "./types";

interface PanelDef {
  id: string;
  size: [number, number]; // tamaño en unidades de escena
  px: [number, number]; // resolución del canvas
  pos: [number, number, number]; // posición final (la profundidad escalona el parallax)
  rotY: number;
  float: { amp: number; speed: number; phase: number };
  par: number; // cuánto se desplaza con el cursor (más profundidad = más rápido)
  art: Art;
  sig: (s: ArtState) => number;
  maxFps: number;
  compact: boolean; // se muestra también en móvil
}

// Todas nacen en el centro de la pantalla y viajan a su posición a distinta
// profundidad (z). Sin saturar: 4 interfaces y un aviso pequeño.
const PANELS: PanelDef[] = [
  { id: "stats", size: [1.5, 0.84], px: [480, 270], pos: [2.55, 1.4, 1.0], rotY: -0.25, float: { amp: 0.05, speed: 0.55, phase: 0.4 }, par: 0.3, art: drawStats, sig: sigStats, maxFps: 30, compact: true },
  { id: "chart", size: [1.5, 0.94], px: [480, 300], pos: [-2.6, 0.9, 0.7], rotY: 0.28, float: { amp: 0.06, speed: 0.46, phase: 2.1 }, par: 0.22, art: drawChart, sig: sigChart, maxFps: 12, compact: true },
  { id: "code", size: [1.78, 1.02], px: [520, 300], pos: [-2.5, -0.95, 1.55], rotY: 0.22, float: { amp: 0.05, speed: 0.5, phase: 4.0 }, par: 0.42, art: drawCode, sig: sigCode, maxFps: 20, compact: false },
  { id: "ring", size: [0.96, 1.15], px: [300, 360], pos: [2.5, -0.55, 1.75], rotY: -0.26, float: { amp: 0.06, speed: 0.6, phase: 1.3 }, par: 0.5, art: drawRing, sig: sigRing, maxFps: 30, compact: true },
  { id: "chip", size: [1.5, 0.29], px: [440, 84], pos: [-0.15, 2.0, 0.9], rotY: 0.04, float: { amp: 0.03, speed: 0.52, phase: 3.2 }, par: 0.18, art: drawChip, sig: sigChip, maxFps: 20, compact: false },
];

export function panelCount(compact: boolean): number {
  return PANELS.filter((p) => !compact || p.compact).length;
}

// Punto de emergencia: el centro de la pantalla (coordenadas de la escena).
const ORIGIN = new THREE.Vector3(0, 0.5, 0.12);
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

interface FloatingPanelProps {
  def: PanelDef;
  index: number;
  S: SceneState;
  rig: Rig;
  tokens: Tokens;
  xScale: number;
}

function FloatingPanel({ def, index, S, rig, tokens, xScale }: FloatingPanelProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const born = useRef<number | null>(null);
  const lastSig = useRef(Number.NaN);
  const lastDraw = useRef(-1);
  const fontsDirty = useRef(false);

  const { canvas, ctx, texture } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = def.px[0];
    c.height = def.px[1];
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return { canvas: c, ctx: c.getContext("2d"), texture: tex };
  }, [def]);

  useEffect(() => {
    let alive = true;
    loadBrandFonts().then(() => {
      if (alive) fontsDirty.current = true;
    });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);

  const geometry = useMemo(() => new THREE.PlaneGeometry(def.size[0], def.size[1]), [def]);
  const anchor = useMemo(() => new THREE.Vector3(def.pos[0] * xScale, def.pos[1], def.pos[2]), [def, xScale]);

  useFrame(({ clock }) => {
    const m = mesh.current;
    const material = mat.current;
    if (!m || !material) return;
    const p = S.panels[index] ?? 0;
    m.visible = p > 0.002;
    if (!m.visible) return;

    const t = clock.elapsedTime;
    if (born.current === null) born.current = t;
    const e = easeOutCubic(p);

    // trayectoria: del centro de la pantalla a su sitio, con flotación y parallax
    m.position.lerpVectors(ORIGIN, anchor, e);
    m.position.y += Math.sin(t * def.float.speed + def.float.phase) * def.float.amp * e;
    m.position.x += rig.x * def.par * e;
    m.position.y += -rig.y * def.par * 0.6 * e;
    const s = 0.2 + 0.8 * e;
    m.scale.set(s, s, 1);
    m.rotation.set(rig.y * 0.06, def.rotY * e + rig.x * 0.14, 0);
    material.opacity = Math.min(1, p * 3.2) * 0.96;

    // redibujado solo si cambió lo visible (y con tope de fps)
    const art: ArtState = { t: t - born.current, p, k: tokens };
    const sig = def.sig(art);
    const due = t - lastDraw.current >= 1 / def.maxFps;
    if (ctx && (fontsDirty.current || (sig !== lastSig.current && due))) {
      def.art(ctx, canvas.width, canvas.height, art);
      texture.needsUpdate = true;
      lastSig.current = sig;
      lastDraw.current = t;
      fontsDirty.current = false;
    }
  });

  return (
    <mesh ref={mesh} geometry={geometry} visible={false} renderOrder={3 + index}>
      <meshBasicMaterial ref={mat} map={texture} transparent opacity={0} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

interface FloatingPanelsProps {
  S: SceneState;
  rig: Rig;
  compact: boolean;
}

export function FloatingPanels({ S, rig, compact }: FloatingPanelsProps) {
  const tokens = useMemo(() => readTokens(), []);
  const list = PANELS.filter((p) => !compact || p.compact);
  return (
    <>
      {list.map((def, i) => (
        <FloatingPanel key={def.id} def={def} index={i} S={S} rig={rig} tokens={tokens} xScale={compact ? 0.86 : 1} />
      ))}
    </>
  );
}
