import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BEAM_FRAG, BEAM_VERT, DUST_FRAG, DUST_VERT, GLOW_FRAG, GLOW_VERT } from "./shaders";
import type { SceneState } from "./timeline";

// ---------------------------------------------------------------------------
// Entorno de reflejos: un "estudio" oscuro con unas pocas luces de área (tira de
// cobre a la izquierda, tira marfil a la derecha, caja de luz cenital y relleno
// cálido bajo). Se hornea una vez en un PMREM — sin HDR externos ni red — y es lo
// que se refleja en el metal. Como el equipo gira con el cursor, los reflejos se
// desplazan solos sobre los bordes.
// ---------------------------------------------------------------------------
export function Studio() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = new THREE.Scene();
    const disposables: Array<{ dispose: () => void }> = [];

    const room = new THREE.Mesh(
      new THREE.BoxGeometry(34, 22, 34),
      new THREE.MeshBasicMaterial({ color: "#0d0805", side: THREE.BackSide }),
    );
    env.add(room);
    disposables.push(room.geometry, room.material as THREE.Material);

    const light = (w: number, h: number, pos: [number, number, number], color: string, power: number) => {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide }),
      );
      mesh.position.set(...pos);
      mesh.lookAt(0, 0, 0);
      env.add(mesh);
      disposables.push(mesh.geometry, mesh.material as THREE.Material);
    };
    light(12, 5, [0, 9, 2], "#ffe2c4", 3.2); // caja de luz cenital
    light(1.6, 14, [-9, 1, 3], "#ff9d45", 7); // tira de cobre
    light(1.2, 12, [9, 0, -1], "#ffdab9", 4); // tira marfil
    light(14, 3, [0, -6, -4], "#ff7a22", 2.2); // relleno cálido bajo
    light(5, 3, [4, 3, 10], "#fff0e0", 1.4); // relleno frontal

    const target = pmrem.fromScene(env, 0.03);
    scene.environment = target.texture;
    scene.environmentIntensity = 0;
    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      disposables.forEach((d) => d.dispose());
    };
  }, [gl, scene]);
  return null;
}

// ---------------------------------------------------------------------------
// Halo de cobre detrás del equipo + haz volumétrico cenital + polvo en suspensión.
// ---------------------------------------------------------------------------
interface AtmosphereProps {
  S: SceneState;
  compact: boolean;
}

export function Atmosphere({ S, compact }: AtmosphereProps) {
  const { gl } = useThree();
  const copper = useMemo(() => new THREE.Color("#ff9d45"), []);

  const glowU = useMemo(() => ({ uAmt: { value: 0 }, uCopper: { value: copper } }), [copper]);
  const beamU = useMemo(() => ({ uAmt: { value: 0 }, uColor: { value: new THREE.Color("#ffc58a") } }), []);

  // Cono abierto: de un punto alto a la izquierda hacia el monitor.
  const beam = useMemo(() => {
    const height = 8.5;
    const geometry = new THREE.CylinderGeometry(0.12, 2.4, height, 36, 1, true);
    const from = new THREE.Vector3(-3.4, 5.2, -1.6);
    const to = new THREE.Vector3(0.2, 0.2, 0.2);
    const dir = to.clone().sub(from).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
    const pos = from.clone().addScaledVector(dir, height / 2);
    return { geometry, quat, pos };
  }, []);

  const count = compact ? 34 : 64;
  const dust = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5.2;
      positions[i * 3 + 2] = -1.6 + Math.random() * 4.2;
      for (let k = 0; k < 4; k++) seeds[i * 4 + k] = Math.random();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
    return geometry;
  }, [count]);
  const dustU = useMemo(
    () => ({
      uTime: { value: 0 },
      uPx: { value: 1 },
      uAmt: { value: 0 },
      uColor: { value: new THREE.Color("#ffc58a") },
    }),
    [],
  );

  const back = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    glowU.uAmt.value = 0.34 * S.power * S.fade;
    beamU.uAmt.value = 0.1 * S.fade * (0.55 + 0.45 * S.power);
    dustU.uTime.value = clock.elapsedTime;
    dustU.uPx.value = gl.getPixelRatio();
    dustU.uAmt.value = S.fade * (0.4 + 0.6 * S.power);
  });

  return (
    <group>
      <mesh ref={back} position={[0, 0.2, -2.4]} renderOrder={-2}>
        <planeGeometry args={[15, 10]} />
        <shaderMaterial
          vertexShader={GLOW_VERT}
          fragmentShader={GLOW_FRAG}
          uniforms={glowU}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          premultipliedAlpha
          toneMapped={false}
        />
      </mesh>

      <mesh geometry={beam.geometry} position={beam.pos} quaternion={beam.quat} renderOrder={-1}>
        <shaderMaterial
          vertexShader={BEAM_VERT}
          fragmentShader={BEAM_FRAG}
          uniforms={beamU}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          premultipliedAlpha
          toneMapped={false}
        />
      </mesh>

      <points geometry={dust} frustumCulled={false} renderOrder={1}>
        <shaderMaterial
          vertexShader={DUST_VERT}
          fragmentShader={DUST_FRAG}
          uniforms={dustU}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          premultipliedAlpha
          toneMapped={false}
        />
      </points>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Figuras geométricas de fondo (a profundidad negativa: se mueven al revés que
// las interfaces del frente, lo que refuerza la sensación de capas).
// ---------------------------------------------------------------------------
interface ShapesProps {
  S: SceneState;
  rig: { x: number; y: number };
}

export function Shapes({ S, rig }: ShapesProps) {
  const octa = useRef<THREE.LineSegments>(null);
  const octaMat = useRef<THREE.LineBasicMaterial>(null);
  const torus = useRef<THREE.Mesh>(null);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.36)), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const e = S.shapes;
    if (octa.current) {
      octa.current.visible = e > 0.002;
      octa.current.scale.setScalar(0.3 + 0.7 * e);
      octa.current.rotation.set(t * 0.21, t * 0.33, 0);
      octa.current.position.set(-3.0 - rig.x * 0.18, 2.05 + Math.sin(t * 0.5) * 0.06 + rig.y * 0.1, -0.8);
    }
    if (octaMat.current) octaMat.current.opacity = 0.85 * e;
    if (torus.current) {
      torus.current.visible = e > 0.002;
      torus.current.scale.setScalar(0.3 + 0.7 * e);
      torus.current.rotation.set(t * 0.3 + 1, t * 0.18, 0.4);
      torus.current.position.set(3.0 - rig.x * 0.14, -1.2 + Math.cos(t * 0.45) * 0.06 + rig.y * 0.08, -0.5);
    }
  });

  return (
    <>
      <lineSegments ref={octa} geometry={edges} visible={false}>
        <lineBasicMaterial ref={octaMat} color="#ff9d45" transparent opacity={0} toneMapped={false} />
      </lineSegments>
      <mesh ref={torus} visible={false}>
        <torusGeometry args={[0.27, 0.017, 12, 72]} />
        <meshStandardMaterial color="#b87333" metalness={1} roughness={0.3} envMapIntensity={1.3} />
      </mesh>
    </>
  );
}
