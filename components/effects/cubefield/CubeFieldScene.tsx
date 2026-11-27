import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// Fondo de la web: un campo de cubos metálicos en perspectiva (como un
// "skyline" de prismas visto desde arriba). Las alturas forman olas que:
//  · ruedan al hacer scroll (la fase de la ola sigue a window.scrollY, y la
//    velocidad de scroll agita el campo),
//  · se levantan y se encienden en cobre alrededor del cursor,
//  · y respiran solas muy despacio cuando no pasa nada.
// Todo es un único InstancedMesh: una sola llamada de dibujo para ~1300 cubos.

interface SceneProps {
  compact: boolean;
  onFail: () => void;
}

interface Palette {
  bg: string;
  cube: string;
  glow: string;
  light: boolean;
}

function readPalette(): Palette {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const light = root.dataset.theme === "light";
  return {
    bg: cs.getPropertyValue("--bg-950").trim() || "#0b0908",
    cube: light ? "#d8cdbf" : "#2b2420",
    glow: cs.getPropertyValue("--glow").trim() || "#ff9d45",
    light,
  };
}

// Sigue el tema (botón claro/oscuro del nav) sin recargar la escena.
function usePalette(): Palette {
  const [palette, setPalette] = useState(readPalette);
  useEffect(() => {
    const obs = new MutationObserver(() => setPalette(readPalette()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return palette;
}

// Hash determinista por celda: misma "ciudad" en cada visita.
function hash(i: number) {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

const SPACING = 0.7;
const SIZE = 0.62;
// Giro fijo del campo: las filas corren en diagonal (como la referencia) y no
// queda un pasillo recto alineado con la cámara.
const BASE_ROT = -0.55;

interface Input {
  ndc: THREE.Vector2;
  active: boolean;
  scrollY: number;
  /** último movimiento de ratón o scroll (performance.now) */
  lastInput: number;
}

const CAMERA_POS = new THREE.Vector3(0, 14, 12);
const CAMERA_TARGET = new THREE.Vector3(0, 0, -2);

// Solo se crean los cubos que pueden verse: los que quedan detrás de la cámara,
// fuera de los bordes o perdidos en la niebla no se dibujan. Se prueba la base y
// la punta de un cubo alto, con margen para el giro con el scroll.
function isVisible(cam: THREE.PerspectiveCamera, wx: number, wz: number, v: THREE.Vector3) {
  for (const h of [0, 3]) {
    v.set(wx, h, wz);
    if (v.distanceTo(CAMERA_POS) > 36) continue;
    v.project(cam);
    if (v.z < 1 && Math.abs(v.x) < 1.45 && Math.abs(v.y) < 1.35) return true;
  }
  return false;
}

function Cubes({ cols, rows, fov, input, palette, onFail }: { cols: number; rows: number; fov: number; input: MutableRefObject<Input>; palette: Palette; onFail: () => void }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const { camera, gl, scene } = useThree();
  const size = useThree((s) => s.size);
  // proporción redondeada: un cambio pequeño de ventana no rehace el campo
  const aspect = Math.round((size.width / Math.max(1, size.height)) * 4) / 4 || 1.6;

  // Datos fijos por celda visible: posición, altura base y si es un cubo "encendido".
  const cells = useMemo(() => {
    const cam = new THREE.PerspectiveCamera(fov, aspect, 0.1, 80);
    cam.position.copy(CAMERA_POS);
    cam.lookAt(CAMERA_TARGET);
    cam.updateMatrixWorld();
    const v = new THREE.Vector3();
    const cosR = Math.cos(BASE_ROT);
    const sinR = Math.sin(BASE_ROT);
    const keep: number[] = [];
    const gx: number[] = [];
    const gz: number[] = [];
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - (cols - 1) / 2) * SPACING;
        const z = (r - (rows - 1) / 2) * SPACING;
        // posición en pantalla con el giro fijo del campo (rotation.y)
        if (isVisible(cam, x * cosR + z * sinR, -x * sinR + z * cosR, v)) {
          keep.push(i);
          gx.push(x);
          gz.push(z);
        }
        i++;
      }
    }
    const n = keep.length;
    const base = new Float32Array(n);
    const hot = new Float32Array(n);
    keep.forEach((id, k) => {
      // el patrón usa el índice original de la grilla: el campo se ve igual que antes
      base[k] = hash(id) * 0.3;
      hot[k] = hash(id + 991) > 0.965 ? 1 : 0;
    });
    return { x: Float32Array.from(gx), z: Float32Array.from(gz), base, hot, height: new Float32Array(n).fill(0.4), glow: new Float32Array(n) };
  }, [cols, rows, fov, aspect]);
  const count = cells.x.length;

  const geometry = useMemo(() => {
    const g = new THREE.BoxGeometry(SIZE, 1, SIZE);
    g.translate(0, 0.5, 0); // la base del cubo queda en y=0: escalar en Y lo "levanta"
    const glowAttr = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);
    glowAttr.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute("aGlow", glowAttr);
    return g;
  }, [count]);

  const glowUniform = useMemo(() => ({ value: new THREE.Color(palette.glow) }), [palette.glow]);

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ metalness: 0.8, roughness: 0.34, envMapIntensity: 0.45 });
    // Brillo por cubo: el atributo aGlow suma emisión cobre a ese cubo.
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uGlowColor = glowUniform;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nattribute float aGlow;\nvarying float vGlow;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvGlow = aGlow;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform vec3 uGlowColor;\nvarying float vGlow;")
        .replace(
          "#include <emissivemap_fragment>",
          // La cara de arriba brilla más que los lados: el cubo encendido
          // conserva volumen en vez de verse como un bloque plano.
          "#include <emissivemap_fragment>\n" +
            "float topFace = max(dot(normal, normalize((viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz)), 0.0);\n" +
            "totalEmissiveRadiance += uGlowColor * vGlow * (0.3 + 0.7 * topFace);",
        );
    };
    return m;
  }, [glowUniform]);

  useEffect(() => {
    material.color.set(palette.cube);
    material.envMapIntensity = palette.light ? 0.9 : 0.45;
    scene.fog = new THREE.Fog(palette.bg, 14, 34);
  }, [material, palette, scene]);

  // Reflejos metálicos: un entorno de estudio generado en la GPU (sin archivos).
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  // Si el contexto WebGL se pierde, se apaga el fondo (queda el color sólido).
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (e: Event) => {
      e.preventDefault();
      onFail();
    };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onFail]);

  const tmp = useMemo(
    () => ({
      raycaster: new THREE.Raycaster(),
      plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
      hit: new THREE.Vector3(),
      mouse: new THREE.Vector3(0, 0, 3),
      scroll: 0,
      energy: 0,
      presence: 0,
      perf: { samples: [] as number[], checked: false },
    }),
    [],
  );

  useFrame((state, rawDt) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dt = Math.min(rawDt, 0.05);
    const t = state.clock.elapsedTime;
    const inp = input.current;

    // Guarda de rendimiento: si tras el arranque el cuadro típico no llega a
    // ~24 fps, se apaga. Usa la mediana y no el promedio: unas pocas trabas
    // sueltas (otra escena 3D cargando, una imagen) no deben apagar el fondo.
    if (t > 1.5 && t < 5.5) {
      tmp.perf.samples.push(rawDt);
    } else if (t >= 5.5 && !tmp.perf.checked) {
      tmp.perf.checked = true;
      const s = tmp.perf.samples.sort((a, b) => a - b);
      if (s.length > 10 && s[Math.floor(s.length / 2)] > 1 / 24) onFail();
      tmp.perf.samples = [];
    }

    // Scroll suavizado + "energía" según lo rápido que se desliza.
    const prev = tmp.scroll;
    tmp.scroll += (inp.scrollY - tmp.scroll) * (1 - Math.exp(-dt * 6));
    const speed = Math.abs(tmp.scroll - prev) / Math.max(dt, 1e-3);
    tmp.energy += (Math.min(speed / 1800, 1) - tmp.energy) * (1 - Math.exp(-dt * 3));
    const phase = tmp.scroll * 0.0032;

    // Dónde cae el cursor sobre el suelo de cubos.
    tmp.raycaster.setFromCamera(inp.ndc, camera);
    if (tmp.raycaster.ray.intersectPlane(tmp.plane, tmp.hit)) {
      tmp.mouse.lerp(tmp.hit, 1 - Math.exp(-dt * 10));
    }
    tmp.presence += ((inp.active ? 1 : 0) - tmp.presence) * (1 - Math.exp(-dt * 4));

    if (lightRef.current) {
      lightRef.current.position.set(tmp.mouse.x, 2.2, tmp.mouse.z);
      lightRef.current.intensity = 12 * tmp.presence;
    }

    // El campo gira apenas con el scroll: da sensación de recorrido.
    mesh.rotation.y = BASE_ROT + Math.sin(tmp.scroll * 0.00035) * 0.12;

    const { x, z, base, hot, height, glow } = cells;
    const amp = 0.45 + tmp.energy * 0.9;
    const k = 1 - Math.exp(-dt * 7);
    const m = mesh.instanceMatrix.array as Float32Array;
    const g = (mesh.geometry.getAttribute("aGlow") as THREE.InstancedBufferAttribute).array as Float32Array;
    const sigma2 = 2 * 1.8 * 1.8;
    // El cursor se compara en el espacio del campo (que está girado).
    const cos = Math.cos(-mesh.rotation.y);
    const sin = Math.sin(-mesh.rotation.y);
    const mx = tmp.mouse.x * cos - tmp.mouse.z * sin;
    const mz = tmp.mouse.x * sin + tmp.mouse.z * cos;

    for (let i = 0; i < x.length; i++) {
      const xi = x[i];
      const zi = z[i];
      const w1 = Math.sin(xi * 0.6 + t * 0.5 + phase);
      const w2 = Math.cos(zi * 0.5 - t * 0.35 + phase * 1.6);
      const w3 = Math.sin((xi + zi) * 0.28 - phase * 0.8);
      const dx = xi - mx;
      const dz = zi - mz;
      // lejos del cursor el efecto es nulo: se salta la exponencial
      const d2 = dx * dx + dz * dz;
      const near = tmp.presence > 0.001 && d2 < sigma2 * 5 ? Math.exp(-d2 / sigma2) * tmp.presence : 0;
      const pulse = hot[i] * (0.22 + 0.18 * Math.sin(t * 1.4 + i));

      const targetH = 0.18 + base[i] + (w1 * w2 * 0.5 + 0.5) * amp + (w3 * 0.5 + 0.5) * 0.22 + near * 1.3 + hot[i] * 0.35;
      const targetG = near * 0.75 + pulse + tmp.energy * 0.2 * (w1 * 0.5 + 0.5) * (hot[i] + 0.15);

      height[i] += (targetH - height[i]) * k;
      glow[i] += (targetG - glow[i]) * k;

      // Matriz columna: solo escala en Y y traslación, sin rotación por cubo.
      const o = i * 16;
      m[o] = 1; m[o + 1] = 0; m[o + 2] = 0; m[o + 3] = 0;
      m[o + 4] = 0; m[o + 5] = height[i]; m[o + 6] = 0; m[o + 7] = 0;
      m[o + 8] = 0; m[o + 9] = 0; m[o + 10] = 1; m[o + 11] = 0;
      m[o + 12] = xi; m[o + 13] = 0; m[o + 14] = zi; m[o + 15] = 1;
      g[i] = glow[i];
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.geometry.getAttribute("aGlow").needsUpdate = true;
  });

  return (
    <>
      <instancedMesh key={count} ref={meshRef} args={[geometry, material, count]} frustumCulled={false} />
      <pointLight ref={lightRef} color={palette.glow} intensity={0} distance={7} decay={2} />
    </>
  );
}

// Ritmo de dibujo: a pleno (60 fps) mientras hay ratón o scroll, y a la mitad
// en reposo, donde el oleaje es tan lento que no se nota la diferencia.
// Los primeros segundos van a pleno para que la guarda de rendimiento mida bien.
function Driver({ input }: { input: MutableRefObject<Input> }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let raf = 0;
    let tick = 0;
    const start = performance.now();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const busy = now - start < 6000 || now - input.current.lastInput < 1500;
      if (busy || (tick++ & 1) === 0) invalidate();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [invalidate, input]);
  return null;
}

export default function CubeFieldScene({ compact, onFail }: SceneProps) {
  const palette = usePalette();
  const input = useRef<Input>({ ndc: new THREE.Vector2(0, -0.2), active: false, scrollY: 0, lastInput: 0 });

  // El canvas no recibe eventos (está detrás del contenido): se escucha la ventana.
  useEffect(() => {
    const cur = input.current;
    cur.scrollY = window.scrollY;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      cur.ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      cur.active = true;
      cur.lastInput = performance.now();
    };
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) cur.active = false;
    };
    const onScroll = () => {
      cur.scrollY = window.scrollY;
      cur.lastInput = performance.now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseout", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseout", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Cuadrado grande: al estar girado en diagonal tiene que cubrir las esquinas.
  const cols = compact ? 38 : 60;
  const rows = compact ? 38 : 60;

  const fov = compact ? 52 : 40;

  return (
    <Canvas
      frameloop="demand"
      // resolución un poco menor: es un fondo detrás de un velo oscuro, no se nota
      dpr={[1, compact ? 1 : 1.25]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov, position: [CAMERA_POS.x, CAMERA_POS.y, CAMERA_POS.z], near: 0.1, far: 80 }}
      onCreated={({ camera }) => camera.lookAt(CAMERA_TARGET)}
    >
      <Driver input={input} />
      <ambientLight intensity={palette.light ? 0.9 : 0.25} />
      <directionalLight position={[-6, 10, 4]} intensity={palette.light ? 1.6 : 1.4} color="#ffe9d6" />
      <directionalLight position={[8, 4, -6]} intensity={0.7} color="#b87333" />
      <Cubes cols={cols} rows={rows} fov={fov} input={input} palette={palette} onFail={onFail} />
    </Canvas>
  );
}
