// Kameraya doğru akan telemetri parçacıkları. Pulse projesindeki gerçek
// zamanlı akışa ve anomali tespitine göndermedir (spec §4).
//
// Tek Points nesnesi, tek çizim çağrısı. Konumlar her karede shader'da değil
// CPU'da ilerletiliyor; 1500 parçacıkta bu ihmal edilebilir ve anomali
// mantığını okunur tutuyor.

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";
import { paletteForTheme, type ScenePalette } from "@/lib/scene/palette";

const PARTICLE_COUNT = 1500;
const DPR_CAP = 1.5;
/** Parçacıkların yaşadığı hacim. Z ekseninde kameraya doğru akarlar. */
const SPREAD_X = 26;
const SPREAD_Y = 16;
const DEPTH = 40;
const SPEED_MIN = 2.5;
const SPEED_MAX = 7;

/** Anomali: aynı anda en fazla bir tane, ortalama 8 saniyede bir, 1.5s nabız. */
const ANOMALY_INTERVAL_MS = 8000;
const ANOMALY_DURATION_MS = 1500;

export type SceneHandle = {
  start(): void;
  stop(): void;
  resize(): void;
  setTheme(theme: string): void;
  dispose(): void;
};

const vertexShader = `
  attribute float aSpeed;
  attribute float aSeed;
  attribute float aAnomaly;
  varying float vAlpha;
  varying float vAnomaly;
  uniform float uOpacity;

  void main() {
    vAnomaly = aAnomaly;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // Uzaktaki parçacık hem küçük hem sönük: derinlik hissi buradan geliyor.
    float depth = clamp(1.0 - (-mvPosition.z / ${DEPTH.toFixed(1)}), 0.0, 1.0);
    gl_PointSize = (1.0 + depth * 3.0 + aAnomaly * 4.0) * (300.0 / -mvPosition.z);
    vAlpha = depth * uOpacity * (0.35 + 0.65 * fract(aSeed));
  }
`;

const fragmentShader = `
  varying float vAlpha;
  varying float vAnomaly;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uAnomaly;

  void main() {
    // Yuvarlak parçacık: kare noktanın köşelerini at.
    vec2 d = gl_PointCoord - vec2(0.5);
    float r = dot(d, d);
    if (r > 0.25) discard;

    vec3 base = mix(uColorA, uColorB, gl_PointCoord.x);
    base = mix(base, uColorC, gl_PointCoord.y);
    vec3 color = mix(base, uAnomaly, vAnomaly);
    gl_FragColor = vec4(color, vAlpha * (1.0 - r * 4.0));
  }
`;

function toVec3(hex: string): [number, number, number] {
  const c = new Color(hex);
  return [c.r, c.g, c.b];
}

export function createScene(
  canvas: HTMLCanvasElement,
  { theme }: { theme: string }
): SceneHandle {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(60, 1, 0.1, DEPTH + 10);
  camera.position.z = 6;

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const speeds = new Float32Array(PARTICLE_COUNT);
  const seeds = new Float32Array(PARTICLE_COUNT);
  const anomalies = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * SPREAD_X;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y;
    positions[i * 3 + 2] = -Math.random() * DEPTH;
    speeds[i] = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
    seeds[i] = Math.random();
  }

  const positionAttribute = new BufferAttribute(positions, 3);
  const anomalyAttribute = new BufferAttribute(anomalies, 1);

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", positionAttribute);
  geometry.setAttribute("aSpeed", new BufferAttribute(speeds, 1));
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  geometry.setAttribute("aAnomaly", anomalyAttribute);

  const palette: ScenePalette = paletteForTheme(theme);
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uColorA: { value: toVec3(palette.particles[0]) },
      uColorB: { value: toVec3(palette.particles[1]) },
      uColorC: { value: toVec3(palette.particles[2]) },
      uAnomaly: { value: toVec3(palette.anomaly) },
      uOpacity: { value: palette.opacity },
    },
  });

  scene.add(new Points(geometry, material));

  let frame = 0;
  let last = 0;
  let anomalyIndex = -1;
  let anomalyUntil = 0;
  let nextAnomaly = 0;

  function resize(): void {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (w === 0 || h === 0) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, DPR_CAP));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function tick(now: number): void {
    frame = requestAnimationFrame(tick);
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
    last = now;

    // Anomali yaşam döngüsü: doğur, süresi dolunca söndür.
    if (anomalyIndex >= 0 && now > anomalyUntil) {
      anomalies[anomalyIndex] = 0;
      anomalyIndex = -1;
      anomalyAttribute.needsUpdate = true;
    }
    if (anomalyIndex < 0 && now > nextAnomaly) {
      anomalyIndex = Math.floor(Math.random() * PARTICLE_COUNT);
      anomalies[anomalyIndex] = 1;
      anomalyUntil = now + ANOMALY_DURATION_MS;
      // Sabit aralık mekanik durur; ±%50 dağıtınca doğal görünüyor.
      nextAnomaly = now + ANOMALY_INTERVAL_MS * (0.5 + Math.random());
      anomalyAttribute.needsUpdate = true;
    }

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const zi = i * 3 + 2;
      positions[zi] += speeds[i] * dt;
      // Kamerayı geçen parçacık hacmin dibine geri sarılır.
      if (positions[zi] > camera.position.z) {
        positions[zi] = -DEPTH;
        positions[i * 3] = (Math.random() - 0.5) * SPREAD_X;
        positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y;
      }
    }
    positionAttribute.needsUpdate = true;

    renderer.render(scene, camera);
  }

  function stop(): void {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = 0;
  }

  return {
    start() {
      if (frame) return;
      last = 0;
      nextAnomaly = performance.now() + ANOMALY_INTERVAL_MS;
      resize();
      frame = requestAnimationFrame(tick);
    },
    stop,
    resize,
    setTheme(next: string) {
      const p = paletteForTheme(next);
      material.uniforms.uColorA.value = toVec3(p.particles[0]);
      material.uniforms.uColorB.value = toVec3(p.particles[1]);
      material.uniforms.uColorC.value = toVec3(p.particles[2]);
      material.uniforms.uAnomaly.value = toVec3(p.anomaly);
      material.uniforms.uOpacity.value = p.opacity;
    },
    dispose() {
      stop();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
