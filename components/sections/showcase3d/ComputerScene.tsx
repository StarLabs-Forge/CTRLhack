import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Atmosphere, Shapes, Studio } from "./Atmosphere";
import { Computer } from "./Computer";
import { FloatingPanels, panelCount } from "./FloatingPanels";
import { loadBrandFonts, loadLogoTexture } from "./assets";
import { createState, playIntro, stopAnimations, type SceneState } from "./timeline";
import type { PointerInput, Rig } from "./types";

const FOV = 30;
const TAN_HALF = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

interface SceneProps {
  input: MutableRefObject<PointerInput>;
  active: boolean; // el hero está en pantalla: solo entonces se renderiza
  compact: boolean; // móvil / pantalla pequeña
  onFail: () => void; // la escena no pudo (o no puede) mantenerse fluida
}

const damp = THREE.MathUtils.damp;

function World({ input, active, compact, onFail, S }: SceneProps & { S: SceneState }) {
  const { gl, scene, camera, size, setDpr } = useThree();
  const stage = useRef<THREE.Group>(null);
  const computer = useRef<THREE.Group>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const screenLight = useRef<THREE.PointLight>(null);
  const rig = useRef<Rig>({ x: 0, y: 0 }).current;
  const intro = useRef<ReturnType<typeof playIntro> | null>(null);
  const [logo, setLogo] = useState<THREE.Texture | null>(null);
  const [ready, setReady] = useState(false);
  const perf = useRef({ frames: 0, acc: 0, lowered: false });

  // Carga del isotipo oficial + fuentes, y precompilado de shaders para que el
  // encendido no tenga un tirón en el primer frame.
  useEffect(() => {
    let alive = true;
    let texture: THREE.Texture | null = null;
    (async () => {
      try {
        const [tex] = await Promise.all([
          loadLogoTexture(compact ? 1536 : 2048, gl.capabilities.getMaxAnisotropy()),
          loadBrandFonts(),
        ]);
        if (!alive) {
          tex.dispose();
          return;
        }
        texture = tex;
        setLogo(tex);
        await new Promise((r) => requestAnimationFrame(r));
        try {
          await gl.compileAsync(scene, camera);
        } catch {
          /* compilar de antemano es una optimización, no un requisito */
        }
        if (alive) setReady(true);
      } catch {
        if (alive) onFail();
      }
    })();
    return () => {
      alive = false;
      texture?.dispose();
    };
  }, [gl, scene, camera, compact, onFail]);

  // La secuencia arranca la primera vez que hay todo cargado Y el hero se ve.
  useEffect(() => {
    if (ready && active && !S.started) intro.current = playIntro(S);
  }, [ready, active, S]);
  useEffect(
    () => () => {
      stopAnimations(S, intro.current);
      gl.domElement.style.opacity = "";
    },
    [S, gl],
  );

  // 1) Rig: puntero amortiguado + encuadre de cámara (prioridad -1: va primero).
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const follow = input.current.active ? 5 : 2.4; // al salir el cursor, regreso más lento
    rig.x = damp(rig.x, input.current.x, follow, dt);
    rig.y = damp(rig.y, input.current.y, follow, dt);

    // la composición debe caber en cualquier proporción del contenedor
    const aspect = size.width / Math.max(size.height, 1);
    const needW = compact ? 3.6 : 4.0;
    const needH = 2.45;
    const fit = Math.max(needH / TAN_HALF, needW / (TAN_HALF * aspect));
    const e = S.cam;
    const dist = fit * (1 + (1 - e) * 0.42); // acercamiento suave
    camera.position.set(0, 1.05 + (1 - e) * 0.3, dist);
    camera.lookAt(0, 0.15, 0);

    // luces y reflejos reaccionan a la aparición y al cursor
    scene.environmentIntensity = 0.95 * S.fade;
    if (key.current) key.current.intensity = 1.5 * S.fade;
    if (rim.current) {
      rim.current.intensity = 2.8 * S.fade;
      rim.current.position.set(4 + rig.x * 2.2, 3 + rig.y * 1.2, -3);
    }
    if (screenLight.current) screenLight.current.intensity = 9 * S.power * (0.5 + 0.5 * S.logo);

    // canvas: emerge de la oscuridad
    const op = Math.min(1, S.fade * 1.5);
    const style = gl.domElement.style;
    const next = op.toFixed(3);
    if (style.opacity !== next) style.opacity = next;

    // 2) Movimiento del escenario: giro de entrada + inclinación por cursor + levitación
    const t = state.clock.elapsedTime;
    const st = stage.current;
    if (st) {
      const left = 1 - S.cam;
      st.rotation.y = -0.6 * left + rig.x * 0.2 + Math.sin(t * 0.33) * 0.03;
      st.rotation.x = 0.14 * left - rig.y * 0.11 + Math.sin(t * 0.27 + 1.2) * 0.015;
      st.position.y = Math.sin(t * 0.6) * 0.05;
    }
    const pc = computer.current;
    if (pc) {
      pc.position.y = 0.5 + Math.sin(t * 0.5 + 0.7) * 0.035;
      pc.rotation.set(0.04, -0.3, Math.sin(t * 0.4) * 0.008); // inclinación lateral fija
    }

    // 3) Guarda de rendimiento: baja la resolución y, si no basta, cede al fallback
    if (S.started) {
      const p = perf.current;
      p.frames++;
      if (p.frames > 60) {
        p.acc += Math.min(delta, 0.1);
        if (p.frames === 180) {
          const avg = p.acc / 120;
          if (avg > 1 / 36 && !p.lowered && gl.getPixelRatio() > 1) {
            p.lowered = true;
            setDpr(1);
            p.frames = 0;
            p.acc = 0;
          } else if (avg > 1 / 24) {
            onFail();
          }
        }
      }
    }
  }, -1);

  return (
    <>
      <Studio />
      <ambientLight intensity={0.1} color="#ffcfa3" />
      <directionalLight ref={key} position={[-4, 4, 5]} color="#ffe3c8" />
      <directionalLight ref={rim} position={[4, 3, -3]} color="#ff9d45" />
      <pointLight ref={screenLight} position={[0, 0.5, 1.8]} color="#ff9d45" distance={7} decay={2} />

      <Atmosphere S={S} compact={compact} />
      <group ref={stage}>
        <group ref={computer} position={[0, 0.5, 0]}>
          <Computer S={S} rig={rig} logo={logo} />
        </group>
        <FloatingPanels S={S} rig={rig} compact={compact} />
        <Shapes S={S} rig={rig} />
      </group>
    </>
  );
}

export default function ComputerScene(props: SceneProps) {
  const S = useRef<SceneState>(createState(panelCount(props.compact))).current;
  return (
    <Canvas
      dpr={[1, props.compact ? 1.5 : 1.75]}
      frameloop={props.active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping }}
      camera={{ fov: FOV, near: 2, far: 70, position: [0, 1.3, 14] }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.style.opacity = "0";
      }}
      style={{ position: "absolute", inset: 0, touchAction: "pan-y" }}
    >
      <World {...props} S={S} />
    </Canvas>
  );
}
