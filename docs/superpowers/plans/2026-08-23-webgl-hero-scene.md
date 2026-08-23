# WebGL Hero Sahnesi — Uygulama Planı (Faz 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hero'nun arkasına, yalnızca gücü yeten masaüstü cihazlarda yüklenen, Pulse projesindeki telemetri akışına gönderme yapan bir WebGL veri akışı sahnesi koymak.

**Architecture:** three.js kodu React'in dışında, çerçeveden bağımsız bir fabrikada yaşar (`createScene`). Sunucu her zaman CSS fallback'i render eder; hidrasyondan sonra uygunluk ölçülür ve uygunsa sahne dinamik olarak indirilip fallback'in üstüne biner. Fallback hiçbir zaman unmount edilmez, bu yüzden her hata biçimi "canvas görünmez" sonucuna indirgenir.

**Tech Stack:** three.js (yeni bağımlılık), TypeScript, React 19, Next.js 16 `next/dynamic`, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-23-hero-3d-data-flow-design.md`

**Önceki faz:** `docs/superpowers/plans/2026-08-23-css-3d-depth-layer.md` (tamamlandı, `9de7093`)

## Global Constraints

- Uygunluk eşikleri (spec §3): genişlik **≥ 1024px**, `prefers-reduced-motion` **≠ reduce**, **WebGL2** bağlamı oluşabiliyor, `hardwareConcurrency` **≥ 4** (bildirilmiyorsa geçer sayılır).
- Performans bütçesi (spec §4): **tek çizim çağrısı**, **~1500 parçacık**, **DPR tavanı 1.5**, sekme arkaplanda veya hero ekran dışındayken döngü durur.
- Anomali başlangıç değerleri (spec §4): aynı anda **en fazla 1**, ortalama **8 saniyede bir**, **1.5 saniyelik** nabız. İnce ayar noktasıdır, sözleşme değildir.
- Renkler `src/app/globals.css`'teki token'lardan türetilir; sahnede serbest renk uydurulmaz.
- `src/lib/scene/dataFlow.ts` **hiçbir yerden statik import edilmeyecek** — yalnızca `import()` ile. Task 8 bunu teste bağlar.
- Kod yorumları Türkçe. Commit mesajları İngilizce.
- Her task sonunda `npm test`, `npm run lint`, `npm run typecheck` temiz olmalı.
- Bundle ölçümü chunk boyutlarından yapılır; Next 16 Turbopack "First Load JS" sütunu basmıyor. **Faz 1 sonrası referans: JS 1.135.941 bayt, CSS 49.023 bayt.**

## Dosya yapısı

| Dosya | Sorumluluk |
| --- | --- |
| `src/lib/scene/eligibility.ts` (yeni) | Saf: ortam bilgisi → sahne yüklensin mi |
| `src/lib/scene/palette.ts` (yeni) | Saf: tema → sahne renk seti |
| `src/lib/scene/environment.ts` (yeni) | Tarayıcıdan ortam bilgisini okur (saf değil, test edilmez) |
| `src/lib/scene/dataFlow.ts` (yeni) | three.js sahnesi; `createScene(canvas, opts)` |
| `src/components/hero/CssBackdrop.tsx` (yeni) | Hero.tsx'ten çıkarılan konik halka — fallback |
| `src/components/hero/DataFlowCanvas.tsx` (yeni) | Canvas yaşam döngüsü; tembel yüklenir |
| `src/components/hero/HeroBackdrop.tsx` (yeni) | Uygunluğu ölçer, sahneyi indirir, üste bindirir |
| `src/components/sections/Hero.tsx` (değişir) | Halka yerine `<HeroBackdrop />` |
| `src/lib/__tests__/eligibility.test.ts` (yeni) | Uygunluk kuralları |
| `src/lib/__tests__/palette.test.ts` (yeni) | Tema paleti |
| `src/lib/__tests__/scene-isolation.test.ts` (yeni) | Statik import koruması |

---

### Task 1: three.js'in gerçek maliyetini ölç — karar kapısı

**Files:**
- Modify: `package.json`, `package-lock.json` (geçici)
- Create: `src/lib/scene/probe.ts` (geçici, task sonunda silinir)

**Interfaces:**
- Consumes: yok
- Produces: bir **sayı** ve ona dayanan bir **karar**

Spec §9 bu planın en büyük bilinmeyenini kaydediyor: three.js'in ~150KB gzip olacağı bir **tahmin**. Sahne yazıldıktan sonra 300KB çıkarsa iş boşa gider. Bu yüzden ilk iş ölçmek.

- [ ] **Step 1: Install three.js**

```bash
npm install three
npm install --save-dev @types/three
```

- [ ] **Step 2: Create a throwaway probe module**

`src/lib/scene/probe.ts` — sahnenin gerçekte kullanacağı sınıfları import eder; ağaç sallama sonrası maliyeti bu belirler:

```ts
// GEÇİCİ ÖLÇÜM MODÜLÜ — Task 1 sonunda silinir.
import {
  BufferAttribute,
  BufferGeometry,
  Clock,
  Points,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";

export function probe(canvas: HTMLCanvasElement) {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true });
  const scene = new Scene();
  const camera = new PerspectiveCamera(60, 1, 0.1, 100);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(3), 3));
  const material = new ShaderMaterial({
    vertexShader: "void main(){ gl_Position = vec4(position,1.0); gl_PointSize = 2.0; }",
    fragmentShader: "void main(){ gl_FragColor = vec4(1.0); }",
  });
  scene.add(new Points(geometry, material));
  const clock = new Clock();
  renderer.render(scene, camera);
  return clock.getElapsedTime();
}
```

- [ ] **Step 3: Import it dynamically from the hero so it lands in its own chunk**

`src/components/sections/Hero.tsx` — `Hero` fonksiyonunun içine geçici olarak ekle:

```tsx
  // GEÇİCİ — Task 1 ölçümü
  useEffect(() => {
    void import("@/lib/scene/probe");
  }, []);
```

ve dosyanın en üstüne `import { useEffect } from "react";` ekle.

- [ ] **Step 4: Measure**

```bash
npm run build
find .next/static/chunks -name "*.js" -type f -printf "%s\n" | awk '{s+=$1} END {print "toplam ham:", s}'
# three.js'i içeren chunk'ı bul ve gzip boyutunu ölç:
for f in .next/static/chunks/*.js; do
  if grep -lq "WebGLRenderer" "$f" 2>/dev/null; then
    echo "$f  ham=$(stat -c%s "$f")  gzip=$(gzip -c "$f" | wc -c)"
  fi
done
```

- [ ] **Step 5: DECISION GATE — stop and report**

Ölçülen gzip değerini spec §2'deki beklentiyle karşılaştır:

| Ölçüm | Karar |
| --- | --- |
| **≤ 200KB gzip** | Devam et — Task 2'ye geç |
| **> 200KB gzip** | **DUR.** Spec §9 bu durumu öngörüyor: OGL alternatifi masaya geri geliyor. İnsan ortağına ölçümü bildir ve kararı ona bırak. Plan bu noktadan sonra yeniden yazılmalı. |

Kararı ne olursa olsun ölçülen sayıyı insan ortağına **rakamla** bildir.

- [ ] **Step 6: Remove the probe**

```bash
rm src/lib/scene/probe.ts
```

`Hero.tsx`'teki geçici `useEffect` bloğunu ve gereksizleşen `useEffect` import'unu geri al.

- [ ] **Step 7: Commit the dependency only**

```bash
npm run build   # probe silindikten sonra derlemenin temiz olduğunu doğrula
git add package.json package-lock.json
git commit -m "Add three.js for the hero scene"
```

---

### Task 2: CSS fallback'i Hero'dan ayır

**Files:**
- Create: `src/components/hero/CssBackdrop.tsx`
- Modify: `src/components/sections/Hero.tsx`

**Interfaces:**
- Consumes: yok
- Produces: `<CssBackdrop />` — parametresiz, hero'nun arkasındaki dönen konik halkayı render eder

Davranış değişmiyor; bu yalnızca ayırma. Fallback kendi bileşeni olmadan "her zaman mount edilmiş kalır" kuralı kurulamaz.

- [ ] **Step 1: Create the component**

`src/components/hero/CssBackdrop.tsx`:

```tsx
/**
 * Hero'nun arkasındaki dönen konik halka.
 *
 * WebGL sahnesi yüklenemediğinde (dar ekran, reduced-motion, WebGL yok, ağ
 * hatası) görünen şey budur. Sahne yüklendiğinde de unmount edilmez, sahne
 * bunun üstüne biner — böylece her hata biçimi tek sonuca iner: canvas görünmez.
 */
export function CssBackdrop() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2">
      <div className="spin-slow h-full w-full rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(139,92,246,0.25),transparent_30%,rgba(34,211,238,0.18),transparent_60%)] opacity-60 blur-2xl" />
    </div>
  );
}
```

- [ ] **Step 2: Use it in Hero**

`src/components/sections/Hero.tsx` içindeki şu bloğu:

```tsx
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2">
        <div className="spin-slow h-full w-full rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(139,92,246,0.25),transparent_30%,rgba(34,211,238,0.18),transparent_60%)] opacity-60 blur-2xl" />
      </div>
```

şununla değiştir:

```tsx
      <CssBackdrop />
```

ve import ekle:

```tsx
import { CssBackdrop } from "@/components/hero/CssBackdrop";
```

- [ ] **Step 3: Verify nothing changed visually**

```bash
npm test && npm run lint && npm run typecheck && npm run dev
```

`http://localhost:3000/` — halka önceki gibi dönüyor olmalı. Görsel fark **olmamalı**.

- [ ] **Step 4: Commit**

```bash
git add src/components/hero/CssBackdrop.tsx src/components/sections/Hero.tsx
git commit -m "Extract the hero backdrop into its own component"
```

---

### Task 3: Uygunluk kuralları

**Files:**
- Create: `src/lib/scene/eligibility.ts`
- Test: `src/lib/__tests__/eligibility.test.ts`

**Interfaces:**
- Consumes: yok
- Produces: `isSceneEligible(input: EligibilityInput): boolean`, `MIN_WIDTH: 1024`, `MIN_CORES: 4`. `EligibilityInput = { width: number; reducedMotion: boolean; webgl2: boolean; cores: number | undefined }`

- [ ] **Step 1: Write the failing test**

`src/lib/__tests__/eligibility.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isSceneEligible, MIN_WIDTH, MIN_CORES } from "@/lib/scene/eligibility";

const UYGUN = {
  width: 1440,
  reducedMotion: false,
  webgl2: true,
  cores: 8,
};

describe("isSceneEligible", () => {
  it("tüm koşullar sağlanınca kabul eder", () => {
    expect(isSceneEligible(UYGUN)).toBe(true);
  });

  it("dar ekranı reddeder", () => {
    expect(isSceneEligible({ ...UYGUN, width: MIN_WIDTH - 1 })).toBe(false);
    expect(isSceneEligible({ ...UYGUN, width: MIN_WIDTH })).toBe(true);
  });

  it("reduced-motion açıkken reddeder", () => {
    expect(isSceneEligible({ ...UYGUN, reducedMotion: true })).toBe(false);
  });

  it("WebGL2 yoksa reddeder", () => {
    expect(isSceneEligible({ ...UYGUN, webgl2: false })).toBe(false);
  });

  it("zayıf CPU'yu reddeder", () => {
    expect(isSceneEligible({ ...UYGUN, cores: MIN_CORES - 1 })).toBe(false);
    expect(isSceneEligible({ ...UYGUN, cores: MIN_CORES })).toBe(true);
  });

  it("çekirdek sayısı bildirilmiyorsa engel saymaz", () => {
    // Safari hardwareConcurrency'yi kısıtlayabiliyor; bilinmeyeni ret sebebi
    // saymak, güçlü makineleri boş yere dışarıda bırakırdı.
    expect(isSceneEligible({ ...UYGUN, cores: undefined })).toBe(true);
  });

  it("tek bir ret koşulu diğerleri uygunken bile yeter", () => {
    expect(
      isSceneEligible({ width: 800, reducedMotion: false, webgl2: true, cores: 16 })
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/eligibility.test.ts`
Expected: FAIL — `Cannot find package '@/lib/scene/eligibility'`

- [ ] **Step 3: Write minimal implementation**

`src/lib/scene/eligibility.ts`:

```ts
// WebGL sahnesinin yüklenip yüklenmeyeceğine karar veren saf kurallar.
// Tarayıcıya dokunmaz — ortam okuması environment.ts'te, böylece kurallar
// node ortamında test edilebilir.

/** Spec §3: sahne yalnızca geniş ekranlarda. */
export const MIN_WIDTH = 1024;

/** Spec §3: dört çekirdeğin altı ağır sahne için zayıf sayılır. */
export const MIN_CORES = 4;

export type EligibilityInput = {
  width: number;
  reducedMotion: boolean;
  webgl2: boolean;
  /** navigator.hardwareConcurrency — her tarayıcı bildirmiyor. */
  cores: number | undefined;
};

export function isSceneEligible({
  width,
  reducedMotion,
  webgl2,
  cores,
}: EligibilityInput): boolean {
  if (width < MIN_WIDTH) return false;
  if (reducedMotion) return false;
  if (!webgl2) return false;
  // Bilinmeyen çekirdek sayısı ret sebebi değil: Safari bu değeri kısıtlıyor
  // ve güçlü makineleri boş yere dışarıda bırakmak istemiyoruz.
  if (cores !== undefined && cores < MIN_CORES) return false;
  return true;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/eligibility.test.ts`
Expected: PASS — 7 passed

- [ ] **Step 5: Commit**

```bash
git add src/lib/scene/eligibility.ts src/lib/__tests__/eligibility.test.ts
git commit -m "Add the rules that decide whether the WebGL scene loads"
```

---

### Task 4: Tema paleti

**Files:**
- Create: `src/lib/scene/palette.ts`
- Test: `src/lib/__tests__/palette.test.ts`

**Interfaces:**
- Consumes: `Theme` (`src/lib/theme-store.ts`, mevcut: `"dark" | "light"`)
- Produces: `paletteForTheme(theme: string): ScenePalette`. `ScenePalette = { particles: readonly [string, string, string]; anomaly: string; opacity: number }`

- [ ] **Step 1: Write the failing test**

`src/lib/__tests__/palette.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { paletteForTheme } from "@/lib/scene/palette";

describe("paletteForTheme", () => {
  it("koyu temada üç vurgu rengi döner", () => {
    const p = paletteForTheme("dark");

    expect(p.particles).toHaveLength(3);
    for (const color of p.particles) {
      expect(color, `geçersiz renk: ${color}`).toMatch(/^#[0-9a-f]{6}$/i);
    }
    expect(p.anomaly).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("açık temada farklı bir set döner", () => {
    // Siyah üzerine tasarlanmış camgöbeği #f6f8fd zeminde kaybolur.
    expect(paletteForTheme("light").particles).not.toEqual(
      paletteForTheme("dark").particles
    );
  });

  it("açık temada opaklık daha düşük", () => {
    // Açık zemini ezmemek için efekt geri çekilir.
    expect(paletteForTheme("light").opacity).toBeLessThan(
      paletteForTheme("dark").opacity
    );
  });

  it("bilinmeyen tema koyuya düşer", () => {
    // setTheme'e beklenmedik bir değer gelirse sahne kararmak yerine
    // varsayılan görünümü korumalı.
    expect(paletteForTheme("sepya")).toEqual(paletteForTheme("dark"));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/palette.test.ts`
Expected: FAIL — `Cannot find package '@/lib/scene/palette'`

- [ ] **Step 3: Write minimal implementation**

`src/lib/scene/palette.ts`:

```ts
// Sahne renkleri globals.css'teki tema token'larından türetilir; burada
// serbest renk uydurulmaz. Açık tema için tonlar koyulaştırılır ve opaklık
// düşürülür, çünkü siyah üzerine tasarlanmış camgöbeği #f6f8fd zeminde kaybolur.

export type ScenePalette = {
  /** accent-from → accent-mid → accent-to */
  particles: readonly [string, string, string];
  /** Anomali parıltısı (spec §4) */
  anomaly: string;
  opacity: number;
};

const DARK: ScenePalette = {
  particles: ["#8b5cf6", "#6366f1", "#22d3ee"],
  anomaly: "#f472b6",
  opacity: 1,
};

const LIGHT: ScenePalette = {
  particles: ["#6d28d9", "#4338ca", "#0e7490"],
  anomaly: "#be185d",
  opacity: 0.55,
};

export function paletteForTheme(theme: string): ScenePalette {
  return theme === "light" ? LIGHT : DARK;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/palette.test.ts`
Expected: PASS — 4 passed

- [ ] **Step 5: Commit**

```bash
git add src/lib/scene/palette.ts src/lib/__tests__/palette.test.ts
git commit -m "Add the scene palette, recoloured for the light theme"
```

---

### Task 5: Ortam okuyucu

**Files:**
- Create: `src/lib/scene/environment.ts`

**Interfaces:**
- Consumes: `EligibilityInput` (Task 3)
- Produces: `readEnvironment(): EligibilityInput`

Tarayıcıya dokunduğu için birim testi yok; tüm karar mantığı Task 3'te test edilmiş durumda. Bu modülün tek işi okumak.

- [ ] **Step 1: Write it**

`src/lib/scene/environment.ts`:

```ts
"use client";

import type { EligibilityInput } from "@/lib/scene/eligibility";

/**
 * WebGL2 bağlamı gerçekten oluşturulabiliyor mu?
 *
 * `"WebGL2RenderingContext" in window` yetmez: tarayıcı sınıfı tanıyıp da
 * sürücü kara listesi yüzünden bağlam vermeyebiliyor. Tek güvenilir yol
 * denemek. Test canvas'ı hemen bırakılır.
 */
function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Uygunluk kararı için gereken ortam bilgisini tarayıcıdan toplar. */
export function readEnvironment(): EligibilityInput {
  return {
    width: window.innerWidth,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    webgl2: hasWebGL2(),
    cores: navigator.hardwareConcurrency || undefined,
  };
}
```

- [ ] **Step 2: Verify the gate**

Run: `npm test && npm run lint && npm run typecheck`
Expected: hepsi temiz

- [ ] **Step 3: Commit**

```bash
git add src/lib/scene/environment.ts
git commit -m "Read the browser environment for the eligibility check"
```

---

### Task 6: Sahne fabrikası

**Files:**
- Create: `src/lib/scene/dataFlow.ts`

**Interfaces:**
- Consumes: `ScenePalette`, `paletteForTheme` (Task 4)
- Produces: `createScene(canvas: HTMLCanvasElement, opts: { theme: string }): SceneHandle`. `SceneHandle = { start(): void; stop(): void; resize(): void; setTheme(theme: string): void; dispose(): void }`

**Bu modül hiçbir yerden statik import edilmeyecek** (Task 8 bunu teste bağlar).

- [ ] **Step 1: Write the scene**

`src/lib/scene/dataFlow.ts`:

```ts
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

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aSpeed", new BufferAttribute(speeds, 1));
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  geometry.setAttribute("aAnomaly", new BufferAttribute(anomalies, 1));

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
      geometry.attributes.aAnomaly.needsUpdate = true;
    }
    if (anomalyIndex < 0 && now > nextAnomaly) {
      anomalyIndex = Math.floor(Math.random() * PARTICLE_COUNT);
      anomalies[anomalyIndex] = 1;
      anomalyUntil = now + ANOMALY_DURATION_MS;
      // Sabit aralık mekanik durur; ±%50 dağıtınca doğal görünüyor.
      nextAnomaly = now + ANOMALY_INTERVAL_MS * (0.5 + Math.random());
      geometry.attributes.aAnomaly.needsUpdate = true;
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
    geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  return {
    start() {
      if (frame) return;
      last = 0;
      nextAnomaly = performance.now() + ANOMALY_INTERVAL_MS;
      resize();
      frame = requestAnimationFrame(tick);
    },
    stop() {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    },
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
      this.stop();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
```

- [ ] **Step 2: Verify the gate**

Run: `npm run lint && npm run typecheck && npm test`
Expected: hepsi temiz. Sahne henüz hiçbir yerden çağrılmıyor, görsel değişiklik yok.

- [ ] **Step 3: Commit**

```bash
git add src/lib/scene/dataFlow.ts
git commit -m "Add the data-flow scene as a framework-free factory"
```

---

### Task 7: Canvas ve uygunluk kapısı

**Files:**
- Create: `src/components/hero/DataFlowCanvas.tsx`
- Create: `src/components/hero/HeroBackdrop.tsx`
- Modify: `src/components/sections/Hero.tsx`

**Interfaces:**
- Consumes: `createScene` (Task 6, **yalnızca dinamik import**), `readEnvironment` (Task 5), `isSceneEligible` (Task 3), `CssBackdrop` (Task 2), `subscribeTheme` / `getThemeSnapshot` (mevcut `src/lib/theme-store.ts`)
- Produces: `<HeroBackdrop />`

- [ ] **Step 1: Write the canvas component**

`src/components/hero/DataFlowCanvas.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { SceneHandle } from "@/lib/scene/dataFlow";
import { getThemeSnapshot, subscribeTheme } from "@/lib/theme-store";

/**
 * Sahnenin yaşam döngüsünü taşır. three.js modülü burada dinamik olarak
 * indirilir — statik import ana bundle'a girerdi (bkz. scene-isolation testi).
 *
 * Canvas yüklenene kadar şeffaf; sahne ilk kareyi çizdikten sonra belirir,
 * böylece boş bir dikdörtgen bir an için CSS halkasını örtmez.
 */
export function DataFlowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let handle: SceneHandle | null = null;
    let cancelled = false;

    const onResize = () => handle?.resize();
    const onVisibility = () => {
      if (document.hidden) handle?.stop();
      else handle?.start();
    };

    void import("@/lib/scene/dataFlow")
      .then(({ createScene }) => {
        // Modül inerken bileşen unmount olmuş olabilir.
        if (cancelled) return;
        handle = createScene(canvas, { theme: getThemeSnapshot() });
        handle.start();
        setReady(true);

        window.addEventListener("resize", onResize, { passive: true });
        document.addEventListener("visibilitychange", onVisibility);
      })
      .catch(() => {
        // Ağ hatası: CSS halkası zaten altta duruyor, kullanıcı bir şey kaybetmez.
      });

    // Tema değişimi sahneyi yeniden kurmaz, yalnızca renkleri değiştirir.
    const unsubscribe = subscribeTheme(() => handle?.setTheme(getThemeSnapshot()));

    // WebGL bağlamı kaybolursa (GPU sıfırlama, sekme baskısı) sahneyi bırak.
    const onContextLost = (event: Event) => {
      event.preventDefault();
      handle?.stop();
      setReady(false);
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      handle?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 h-full w-full transition-opacity duration-1000 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
```

- [ ] **Step 2: Write the gate component**

`src/components/hero/HeroBackdrop.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { CssBackdrop } from "@/components/hero/CssBackdrop";
import { isSceneEligible } from "@/lib/scene/eligibility";
import { readEnvironment } from "@/lib/scene/environment";

// ssr:false: sahne yalnızca tarayıcıda anlamlı ve sunucuda üretilen HTML'e
// girmemeli — ilk boyamada ağır hiçbir şey olmasın diye (spec §3).
const DataFlowCanvas = dynamic(
  () => import("@/components/hero/DataFlowCanvas").then((m) => m.DataFlowCanvas),
  { ssr: false }
);

/**
 * Hero'nun arka planı.
 *
 * CSS halkası her zaman render edilir ve hiç unmount edilmez; WebGL sahnesi
 * uygun cihazlarda onun üstüne biner. Böylece sahnenin başarısız olabileceği
 * her yol (dar ekran, WebGL yok, reduced-motion, ağ hatası, bağlam kaybı)
 * tek bir sonuca iner: canvas görünmez, halka görünür.
 *
 * Uygunluk ölçümü effect içinde yapılır — sunucuda çalışmadığı için hidrasyon
 * uyumsuzluğu doğmaz.
 */
export function HeroBackdrop() {
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    setEligible(isSceneEligible(readEnvironment()));
  }, []);

  return (
    <>
      <CssBackdrop />
      {eligible && <DataFlowCanvas />}
    </>
  );
}
```

- [ ] **Step 3: Add the readability scrim**

Spec §4: A yerleşimi (tam ekran arka plan) seçildiği için hero metninin arkasına karartma **şart** — yoksa akan parçacıklar ismi yer. Scrim yalnızca sahne aktifken gerekir; CSS halkası zaten bulanık ve sönük.

`src/components/hero/HeroBackdrop.tsx` içindeki `return` bloğunu şununla değiştir:

```tsx
  return (
    <>
      <CssBackdrop />
      {eligible && (
        <>
          <DataFlowCanvas />
          {/* Okunabilirlik karartması: sahnenin yoğunluğu ne olursa olsun
              isim ve butonlar okunur kalsın diye metnin arkasında durur. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, var(--background) 30%, color-mix(in oklab, var(--background) 55%, transparent) 62%, transparent 100%)",
            }}
          />
        </>
      )}
    </>
  );
```

> Scrim `var(--background)` kullanıyor, sabit siyah değil — açık temada zemin beyaza döndüğünde karartma da onunla döner.

- [ ] **Step 4: Use it in Hero**

`src/components/sections/Hero.tsx` içinde `<CssBackdrop />` satırını şununla değiştir:

```tsx
      <HeroBackdrop />
```

Import'u güncelle:

```tsx
import { CssBackdrop } from "@/components/hero/CssBackdrop";
```
→
```tsx
import { HeroBackdrop } from "@/components/hero/HeroBackdrop";
```

- [ ] **Step 5: Verify the gate**

Run: `npm test && npm run lint && npm run typecheck && npm run build`
Expected: hepsi temiz

- [ ] **Step 6: Verify in the browser**

Run: `npm run dev` → `http://localhost:3000/`

Kontrol et:
- Geniş pencerede parçacıklar kameraya doğru akıyor
- Ara sıra tek bir parçacık pembeye dönüp büyüyor (anomali)
- Tema düğmesine basınca renkler değişiyor ve sahne **yeniden başlamıyor** (akış kesintisiz sürüyor)
- Pencereyi 1024px altına daraltıp yeniden yükleyince canvas hiç yüklenmiyor, halka görünüyor
- DevTools → Network: `dataFlow` chunk'ı ayrı bir istek olarak iniyor

- [ ] **Step 7: Commit**

```bash
git add src/components/hero/DataFlowCanvas.tsx src/components/hero/HeroBackdrop.tsx src/components/sections/Hero.tsx
git commit -m "Load the WebGL scene behind an eligibility gate"
```

---

### Task 8: Bundle izolasyon koruması

**Files:**
- Test: `src/lib/__tests__/scene-isolation.test.ts`

**Interfaces:**
- Consumes: yok
- Produces: yok (koruma testi)

Sahne modülü bir kez statik import edilirse three.js ana bundle'a girer ve Faz 2'nin tüm tembel yükleme çabası sessizce boşa gider. Bu test o hatayı gürültülü hâle getirir.

- [ ] **Step 1: Write the test**

`src/lib/__tests__/scene-isolation.test.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SRC_DIR = path.join(process.cwd(), "src");
const SCENE_MODULE = "@/lib/scene/dataFlow";

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

describe("sahne modülü izolasyonu", () => {
  it("three.js sahnesi hiçbir yerden statik import edilmiyor", () => {
    // `import(...)` serbest, `import ... from "..."` yasak. Statik import
    // three.js'i ana bundle'a sokar ve tembel yükleme anlamsızlaşır.
    const staticImport = new RegExp(
      String.raw`^\s*import\s(?:type\s)?[^\n;]*from\s*["']${SCENE_MODULE}["']`,
      "m"
    );

    for (const file of sourceFiles(SRC_DIR)) {
      if (file.endsWith(path.join("scene", "dataFlow.ts"))) continue;
      const source = fs.readFileSync(file, "utf8");
      expect(
        staticImport.test(source),
        `${path.relative(process.cwd(), file)} sahneyi statik import ediyor`
      ).toBe(false);
    }
  });

  it("three.js yalnızca sahne modülünde geçiyor", () => {
    // Başka bir dosya doğrudan "three"den import ederse aynı sorun oluşur.
    for (const file of sourceFiles(SRC_DIR)) {
      if (file.endsWith(path.join("scene", "dataFlow.ts"))) continue;
      const source = fs.readFileSync(file, "utf8");
      expect(
        /^\s*import\s[^\n;]*from\s*["']three["']/m.test(source),
        `${path.relative(process.cwd(), file)} doğrudan three.js import ediyor`
      ).toBe(false);
    }
  });
});
```

> **Not:** `DataFlowCanvas.tsx` sahneden yalnızca `import type { SceneHandle }` alıyor. Tip import'u derlemede silinir ve bundle'a girmez, ama yukarıdaki desen `import type` biçimini de yakalar — bu bilinçli: tip için bile olsa modül adını statik yazmamak, ileride birinin `type` kelimesini silip gerçek import'a çevirmesini engeller. Bunun yerine `SceneHandle` tipini `DataFlowCanvas.tsx` içinde yerel olarak tanımla:
>
> ```tsx
> type SceneHandle = {
>   start(): void;
>   stop(): void;
>   resize(): void;
>   setTheme(theme: string): void;
>   dispose(): void;
> };
> ```
>
> ve Task 7 Step 1'deki `import type { SceneHandle } from "@/lib/scene/dataFlow";` satırını sil.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/scene-isolation.test.ts`
Expected: FAIL — `DataFlowCanvas.tsx sahneyi statik import ediyor` (Task 7'deki tip import'u yüzünden)

- [ ] **Step 3: Make it pass**

`src/components/hero/DataFlowCanvas.tsx` içindeki `import type { SceneHandle } from "@/lib/scene/dataFlow";` satırını sil ve yerine yukarıdaki yerel `type SceneHandle` tanımını koy.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/scene-isolation.test.ts`
Expected: PASS — 2 passed

- [ ] **Step 5: Commit**

```bash
git add src/lib/__tests__/scene-isolation.test.ts src/components/hero/DataFlowCanvas.tsx
git commit -m "Pin the scene module out of the main bundle"
```

---

### Task 9: Ölçüm ve düşüş yolu denetimi

**Files:**
- Modify: yok (yalnızca doğrulama; bulgu çıkarsa ilgili dosya)

**Interfaces:**
- Consumes: Task 1–8 çıktıları
- Produces: yok

- [ ] **Step 1: Confirm the scene is not in the main bundle**

```bash
npm run build
for f in .next/static/chunks/*.js; do
  if grep -lq "WebGLRenderer" "$f" 2>/dev/null; then
    echo "three.js burada: $f  gzip=$(gzip -c "$f" | wc -c)"
  fi
done
```

Expected: three.js **ayrı bir chunk'ta**. Ana giriş chunk'ında çıkıyorsa tembel yükleme kırılmıştır — Task 8 testini ve `next/dynamic` kullanımını incele.

- [ ] **Step 2: Measure the total**

```bash
find .next/static/chunks -name "*.js" -type f -printf "%s\n" | awk '{s+=$1} END {print "JS ham:", s}'
find .next/static -name "*.css" -type f -printf "%s\n" | awk '{s+=$1} END {print "CSS ham:", s}'
```

Faz 1 sonrası referansla karşılaştır (**JS 1.135.941 / CSS 49.023**). Artışın tamamının ayrı chunk'ta olduğunu doğrula.

- [ ] **Step 3: Verify every fallback path**

`npm run dev` ile her birini ayrı ayrı dene:

| Durum | Nasıl tetiklenir | Beklenen |
| --- | --- | --- |
| Dar ekran | Pencereyi <1024px yapıp yeniden yükle | Canvas yok, halka var |
| reduced-motion | DevTools → Rendering → Emulate `prefers-reduced-motion: reduce` | Canvas yok, halka var |
| WebGL kapalı | `chrome://settings` → donanım hızlandırmayı kapat, yeniden başlat | Canvas yok, halka var |
| Bağlam kaybı | Konsolda: `document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()` | Canvas kaybolur, halka görünür, **hata yok** |
| Sekme arkaplanda | Başka sekmeye geç, dön | Dönünce akış kaldığı yerden sürer |
| Tema değişimi | Tema düğmesi | Renkler değişir, sahne yeniden başlamaz |

- [ ] **Step 4: Check for a leak**

DevTools → Performance monitor açıkken tema düğmesine 20 kez bas, sonra dilleri değiştir (TR ↔ EN, tam sayfa yüklemesi).
Expected: JS heap ve **GPU bellek** sürekli artmıyor. Artıyorsa `dispose` çağrılmıyor demektir.

- [ ] **Step 5: Measure LCP**

`npm run build && npm run start` → DevTools → Lighthouse → Performance (masaüstü).
Faz 1 öncesi/sonrası LCP ile karşılaştır. Sahne ilk boyamadan sonra yüklendiği için **LCP belirgin şekilde değişmemeli**. Değişiyorsa `ssr: false` ve effect sıralamasını incele.

- [ ] **Step 6: Final gate**

```bash
npm test && npm run lint && npm run typecheck && npm run build
```

Expected: 83 test (70 + 7 eligibility + 4 palette + 2 isolation), hepsi temiz.

---

## Tamamlanma kriterleri

- [ ] Geniş masaüstü ekranında hero'da parçacık akışı görünüyor, ara sıra anomali parlıyor
- [ ] Dar ekran, reduced-motion ve WebGL'siz ortamlarda CSS halkası görünüyor, hata yok
- [ ] Tema değişimi sahneyi yeniden başlatmadan renkleri değiştiriyor
- [ ] three.js ayrı bir chunk'ta; ana bundle'a girmiyor (test + ölçüm ile kanıtlı)
- [ ] LCP Faz 1'e göre belirgin şekilde bozulmamış (ölçülmüş, tahmin edilmemiş)
- [ ] 83 test geçiyor; lint, typecheck ve build temiz

## Bu plana dâhil olmayan

- Sahnenin fareyle etkileşimi (spec §11 kapsam dışı)
- Diğer bölümlere ek WebGL sahneleri
- Post-processing (bloom vb.) — bütçeyi ikiye katlar, kazancı belirsiz
- Kart görselinin `translateZ` parallax'ı (Faz 1'de ayrı tur olarak bırakıldı)

---

## Ölçüm sonuçları (2026-08-23, uygulama sonrası)

**three.js maliyeti (Task 1 karar kapısı):** 527.074 bayt ham / **130.408 bayt gzip**.
Eşik 200KB'dı, spec §2'nin tahmini 150KB'dı — gerçek değer tahminin altında kaldı,
OGL alternatifine gerek olmadı.

**Bundle (Faz 1 sonrası referansa göre):**

| Ölçüm | Faz 1 sonrası | Faz 2 sonrası | Fark |
| --- | --- | --- | --- |
| Toplam JS (ham) | 1.135.941 | 1.668.597 | +532.656 |
| — three.js chunk'ı | — | 527.074 | tembel |
| **İlk yüklemeye eklenen** | — | — | **+5.582** |
| CSS | 49.023 | 49.164 | +141 |

**Uygunluk kapısı (production sunucusunda, chunk adı izlenerek):**

| Senaryo | Canvas | Halka | three.js indi mi |
| --- | --- | --- | --- |
| Dar ekran (900px) | hayır | evet | **hayır** |
| reduced-motion | hayır | evet | **hayır** |
| Mobil (dokunmatik) | hayır | evet | **hayır** |
| Masaüstü (1440px) | evet | evet | evet |

**Diğer düşüş yolları:** Tema değiştirildiğinde canvas yeniden mount olmadı ve
three.js tekrar indirilmedi (palet yerinde değişiyor). WebGL bağlamı zorla
kaybettirildiğinde sayfa ayakta kaldı, halka görünür oldu, sayfa hatası oluşmadı.

**LCP:** sahne yüklenen masaüstünde 1336 ms, yüklenmeyen dar ekranda 1332 ms —
4 ms fark, yani gürültü düzeyinde. Sahne ilk boyamayı etkilemiyor.

## Uygulama sırasında planı aşan bulgular

1. **Uygunluk `useSyncExternalStore` ile okunuyor.** Plan effect içinde `useState`
   öngörüyordu; repo'nun lint kuralı (`react-hooks/set-state-in-effect`) bunu
   reddediyor ve `theme-store.ts` aynı sorunu zaten harici store ile çözmüş.

2. **Yığın sırası hatası — ve önceden var olan bir hata.** Canvas `-z-10`'daydı,
   ama `body::before` `z-index: -1`'de opak sayfa gradyanını boyuyor; sahne arka
   planın arkasına çiziliyordu. Aynı hata `CssBackdrop`'taki konik halkada da
   vardı: halka bu daldan çok önce de hiç görünmemişti.

3. **Sahne parametreleri yanlış ölçekteydi.** Plandaki nokta boyutu çarpanı (300)
   ve alfa aralığı (0.35–1.0) ekranın %79'unu kaplayıp ismi yiyordu. Düşürüldü:
   kaplama %0.5, ortalama alfa ~21, renk parçacık başına atanıyor.
