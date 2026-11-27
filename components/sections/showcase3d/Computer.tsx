import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeBlobTexture, makeFrameRing, makeSlab } from "./geometry";
import { makePlaceholderTexture } from "./assets";
import { RING_FRAG, RING_VERT, SCREEN_FRAG, SCREEN_VERT } from "./shaders";
import type { SceneState } from "./timeline";
import type { Rig } from "./types";

interface ComputerProps {
  S: SceneState;
  rig: Rig;
  logo: THREE.Texture | null;
}

// Monitor futurista: cuerpo de metal oscuro mate con filo de cobre (el bisel y
// los costados llevan el material de cobre), pantalla con el isotipo oficial,
// peana ligera y una luz de estado. Medidas relativas al centro de la pantalla
// (3.2 × 2.0, proporción 16:10).
export function Computer({ S, rig, logo }: ComputerProps) {
  const geo = useMemo(
    () => ({
      body: makeSlab(3.4, 2.2, 0.1, 0.1, 0.025), // cara plana 3.40×2.20 → 3.45×2.25 con bisel
      neck: makeSlab(0.34, 0.95, 0.05, 0.1, 0.012),
      base: makeSlab(1.9, 0.95, 0.22, 0.06, 0.014),
      plate: makeSlab(2.02, 1.07, 0.26, 0.03, 0.006),
      ring: makeFrameRing(3.34, 2.14, 0.09, 0.045),
      screen: new THREE.PlaneGeometry(3.2, 2.0),
      led: new THREE.CircleGeometry(0.02, 20),
      shadow: new THREE.PlaneGeometry(1, 1),
    }),
    [],
  );

  const placeholder = useMemo(() => makePlaceholderTexture(), []);
  const blob = useMemo(() => makeBlobTexture(), []);
  useEffect(
    () => () => {
      placeholder.dispose();
      blob.dispose();
    },
    [placeholder, blob],
  );

  const screenUniforms = useMemo(
    () => ({
      uMap: { value: placeholder as THREE.Texture },
      uPower: { value: 0 },
      uLogo: { value: 0 },
      uTime: { value: 0 },
      uAspect: { value: 1.6 },
      uPtr: { value: new THREE.Vector2() },
      uCopper: { value: new THREE.Color("#ff9d45") },
    }),
    [placeholder],
  );
  const ringUniforms = useMemo(
    () => ({
      uWave: { value: 0 },
      uGain: { value: 1 },
      uIdle: { value: 0 },
      uTime: { value: 0 },
      uHalf: { value: new THREE.Vector2(1.67, 1.07) },
      uCopper: { value: new THREE.Color("#ff9d45") },
    }),
    [],
  );

  useEffect(() => {
    screenUniforms.uMap.value = logo ?? placeholder;
  }, [logo, placeholder, screenUniforms]);

  const ledRef = useRef<THREE.MeshBasicMaterial>(null);
  const shadowRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    screenUniforms.uPower.value = S.power;
    screenUniforms.uLogo.value = S.logo;
    screenUniforms.uTime.value = t;
    screenUniforms.uPtr.value.set(rig.x, rig.y);
    ringUniforms.uWave.value = S.wave;
    ringUniforms.uGain.value = S.waveGain;
    ringUniforms.uIdle.value = S.idle;
    ringUniforms.uTime.value = t;
    if (ledRef.current) ledRef.current.opacity = S.power * (0.65 + 0.35 * Math.sin(t * 1.6));
    if (shadowRef.current) shadowRef.current.opacity = 0.75 * S.fade;
  });

  return (
    <group>
      {/* cuerpo: material 0 = caras (metal oscuro mate cepillado), 1 = filo (cobre) */}
      <mesh geometry={geo.body}>
        <meshPhysicalMaterial attach="material-0" color="#1b1613" metalness={0.92} roughness={0.5} anisotropy={0.65} envMapIntensity={1.15} />
        <meshStandardMaterial attach="material-1" color="#b87333" metalness={1} roughness={0.27} envMapIntensity={1.4} />
      </mesh>

      {/* pantalla */}
      <mesh geometry={geo.screen} position={[0, 0, 0.0765]}>
        <shaderMaterial vertexShader={SCREEN_VERT} fragmentShader={SCREEN_FRAG} uniforms={screenUniforms} toneMapped={false} />
      </mesh>

      {/* onda de energía por el borde */}
      <mesh geometry={geo.ring} position={[0, 0, 0.0785]} renderOrder={2}>
        <shaderMaterial
          vertexShader={RING_VERT}
          fragmentShader={RING_FRAG}
          uniforms={ringUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          premultipliedAlpha
          toneMapped={false}
        />
      </mesh>

      {/* luz de estado */}
      <mesh geometry={geo.led} position={[0, -1.065, 0.0765]} renderOrder={2}>
        <meshBasicMaterial ref={ledRef} color="#ff9d45" transparent opacity={0} toneMapped={false} />
      </mesh>

      {/* cuello y peana */}
      <mesh geometry={geo.neck} position={[0, -1.55, -0.14]}>
        <meshStandardMaterial attach="material-0" color="#17120f" metalness={0.9} roughness={0.55} />
        <meshStandardMaterial attach="material-1" color="#8f5a2b" metalness={1} roughness={0.35} />
      </mesh>
      <mesh geometry={geo.base} position={[0, -2.03, -0.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial attach="material-0" color="#1b1613" metalness={0.92} roughness={0.48} anisotropy={0.6} />
        <meshStandardMaterial attach="material-1" color="#b87333" metalness={1} roughness={0.28} envMapIntensity={1.4} />
      </mesh>
      <mesh geometry={geo.plate} position={[0, -2.075, -0.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#6e3f17" metalness={1} roughness={0.4} />
      </mesh>

      {/* sombra de contacto */}
      <mesh geometry={geo.shadow} position={[0, -2.1, -0.1]} rotation={[-Math.PI / 2, 0, 0]} scale={[4.4, 3.0, 1]} renderOrder={-1}>
        <meshBasicMaterial ref={shadowRef} map={blob} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
