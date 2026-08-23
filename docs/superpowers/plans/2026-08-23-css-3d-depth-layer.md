# CSS 3D Derinlik Katmanı — Uygulama Planı (Faz 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sitenin kart ve çip yüzeylerine, yeni bağımlılık eklemeden, imleci takip eden 3D derinlik kazandırmak.

**Architecture:** Eğim matematiği `src/lib/tilt.ts` içinde saf bir fonksiyondur ve birim testlerle korunur. `useTilt` hook'u bu fonksiyonu sarar ve sonucu doğrudan DOM'a **CSS değişkeni** olarak yazar (`--tilt-x`, `--tilt-y`), rAF ile kısılmış şekilde — React state kullanılmaz, fare hareketinde yeniden render olmaz. Görsel dönüşüm tamamen CSS'te yaşar ve dokunmatik cihazlarda / `prefers-reduced-motion` açıkken medya sorgusuyla kapanır.

**Tech Stack:** TypeScript, React 19, Tailwind CSS v4, Framer Motion 12 (mevcut), Vitest (mevcut). **Yeni bağımlılık yok.**

**Spec:** `docs/superpowers/specs/2026-08-23-hero-3d-data-flow-design.md`

## Global Constraints

- Yeni npm bağımlılığı eklenmeyecek. `package.json` bu fazda değişmez.
- Maksimum eğim açısı: kartlarda **7°** (spec: 6–8° aralığı). Bu değer `useTilt`'in varsayılanıdır.
- Eğim yalnızca `(hover: hover) and (pointer: fine)` ortamlarında uygulanır; dokunmatik cihazlarda hiç devreye girmez.
- `prefers-reduced-motion: reduce` açıkken eğim tamamen kapanır (`transform: none`).
- Kod yorumları Türkçe (repo kalıbı). Commit mesajları İngilizce.
- Testler node ortamında çalışır, yalnızca saf mantığı hedefler (`vitest.config.mts` include: `src/**/*.test.ts`).
- Her task sonunda `npm test`, `npm run lint`, `npm run typecheck` temiz olmalı.

## Spec'ten bilinçli sapma

Spec §5 çipler için "~3° eğim" diyor. Bu planda çipler **eğim yerine derinlik sıçraması** (`translateZ`) alıyor. Gerekçe: bir çip ~28px yüksekliğinde; o boyutta 3°'lik eğim algılanamaz, buna karşılık 25+ çipin her birine ayrı pointer dinleyicisi bağlamak gerekirdi. Derinlik sıçraması spec'in çipler için koyduğu asıl hedefi ("z ekseninde öne çıksın") daha ucuza karşılıyor. Kartlarda eğim spec'teki gibi uygulanıyor.

## Dosya yapısı

| Dosya | Sorumluluk |
| --- | --- |
| `src/lib/tilt.ts` (yeni) | Saf matematik: imleç konumu + kutu boyutu → sınırlanmış açılar |
| `src/lib/__tests__/tilt.test.ts` (yeni) | `tilt.ts` için birim testler |
| `src/lib/useTilt.ts` (yeni) | `tilt.ts`'i saran React hook'u; DOM'a CSS değişkeni yazar |
| `src/app/globals.css` (değişir) | `.tilt-scene` / `.tilt` sınıfları ve medya sorgusu kapıları |
| `src/components/sections/Projects.tsx` (değişir) | Kart yapısı; spotlight dinleyicisiyle birleştirilmiş eğim |
| `src/components/sections/Experience.tsx` (değişir) | Sertifika ve zaman çizelgesi kartları |
| `src/components/sections/About.tsx` (değişir) | İstatistik kartları |
| `src/components/sections/Skills.tsx` (değişir) | Yetenek çipleri (derinlik sıçraması) |

---

### Task 1: Eğim matematiği

**Files:**
- Create: `src/lib/tilt.ts`
- Test: `src/lib/__tests__/tilt.test.ts`

**Interfaces:**
- Consumes: yok (ilk task)
- Produces: `tiltFromPointer(input: TiltInput): Tilt` — `TiltInput = { width: number; height: number; x: number; y: number; maxDeg: number }`, `Tilt = { rotateX: number; rotateY: number }`. `x`/`y` elemanın **sol üst köşesine göre** piksel cinsindendir.

**İşaret sözleşmesi (CSS 3D):** `rotateX` pozitifken elemanın **alt kenarı** izleyiciye yaklaşır, üst kenar uzaklaşır. `rotateY` pozitifken **sağ kenar** uzaklaşır. İstenen his "imleç yüzeye bastırıyor": imleç üstteyken üst kenar geri gider, imleç sağdayken sağ kenar geri gider.

- [ ] **Step 0: Record the bundle baseline**

Task 6 artışı ölçebilsin diye referans değeri **değişikliklerden önce** al:

```bash
npm run build
```

`Route (app)` tablosundaki `/[lang]` satırının **First Load JS** değerini not et. Bu sayı Task 6 Step 1'de karşılaştırma tabanı olacak.

- [ ] **Step 1: Write the failing test**

`src/lib/__tests__/tilt.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { tiltFromPointer } from "@/lib/tilt";

const BOX = { width: 400, height: 200, maxDeg: 7 };

describe("tiltFromPointer", () => {
  it("merkezde eğim yok", () => {
    const tilt = tiltFromPointer({ ...BOX, x: 200, y: 100 });

    expect(tilt.rotateX).toBe(0);
    expect(tilt.rotateY).toBe(0);
  });

  it("imleç üstteyken üst kenar geri gider", () => {
    // rotateX pozitif = alt kenar öne, üst kenar geri.
    const tilt = tiltFromPointer({ ...BOX, x: 200, y: 0 });

    expect(tilt.rotateX).toBe(7);
    expect(tilt.rotateY).toBe(0);
  });

  it("imleç sağdayken sağ kenar geri gider", () => {
    const tilt = tiltFromPointer({ ...BOX, x: 400, y: 100 });

    expect(tilt.rotateY).toBe(7);
    expect(tilt.rotateX).toBe(0);
  });

  it("karşı köşeler zıt işaret üretir", () => {
    const topLeft = tiltFromPointer({ ...BOX, x: 0, y: 0 });
    const bottomRight = tiltFromPointer({ ...BOX, x: 400, y: 200 });

    expect(topLeft.rotateX).toBe(7);
    expect(topLeft.rotateY).toBe(-7);
    expect(bottomRight.rotateX).toBe(-7);
    expect(bottomRight.rotateY).toBe(7);
  });

  it("kutu dışındaki imleç maksimumu aşmaz", () => {
    // Pointer capture sırasında imleç elemanın dışına çıkabiliyor.
    const tilt = tiltFromPointer({ ...BOX, x: 4000, y: -2000 });

    expect(tilt.rotateY).toBe(7);
    expect(tilt.rotateX).toBe(7);
  });

  it("sıfır boyutlu kutuda NaN üretmez", () => {
    // getBoundingClientRect gizli elemanlarda 0x0 döndürür.
    const tilt = tiltFromPointer({ width: 0, height: 0, x: 10, y: 10, maxDeg: 7 });

    expect(tilt.rotateX).toBe(0);
    expect(tilt.rotateY).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/tilt.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/tilt"`

- [ ] **Step 3: Write minimal implementation**

`src/lib/tilt.ts`:

```ts
// Kart yüzeylerinin imleci takip eden 3D eğimi için saf matematik.
// DOM'a dokunmaz, böylece node ortamında test edilebilir.

export type Tilt = {
  /** Pozitif: alt kenar izleyiciye yaklaşır. */
  rotateX: number;
  /** Pozitif: sağ kenar izleyiciden uzaklaşır. */
  rotateY: number;
};

export type TiltInput = {
  width: number;
  height: number;
  /** İmlecin elemanın sol kenarına uzaklığı (px) */
  x: number;
  /** İmlecin elemanın üst kenarına uzaklığı (px) */
  y: number;
  /** Maksimum eğim açısı (derece) */
  maxDeg: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * İmleç konumunu eğim açılarına çevirir. His şu: imleç yüzeye bastırıyor,
 * yani imlecin bulunduğu kenar geri gidiyor.
 */
export function tiltFromPointer({ width, height, x, y, maxDeg }: TiltInput): Tilt {
  // Gizli veya henüz ölçülmemiş eleman 0x0 döner; sıfıra bölme yerine düz dur.
  if (width <= 0 || height <= 0) return { rotateX: 0, rotateY: 0 };

  // Merkeze göre -1..1 aralığına normalize et. Pointer capture sırasında imleç
  // kutunun dışına çıkabildiği için sınırlama şart.
  const nx = clamp((x / width) * 2 - 1, -1, 1);
  const ny = clamp((y / height) * 2 - 1, -1, 1);

  return { rotateX: -ny * maxDeg, rotateY: nx * maxDeg };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/tilt.test.ts`
Expected: PASS — 6 passed

- [ ] **Step 5: Run the full gate**

Run: `npm test && npm run lint && npm run typecheck`
Expected: hepsi temiz, test sayısı 64 → 70

- [ ] **Step 6: Commit**

```bash
git add src/lib/tilt.ts src/lib/__tests__/tilt.test.ts
git commit -m "Add pure tilt math for cursor-following card depth"
```

---

### Task 2: `useTilt` hook'u ve CSS temeli

**Files:**
- Create: `src/lib/useTilt.ts`
- Modify: `src/app/globals.css` (dosyanın sonuna, "Erişilebilirlik" bloğundan **önce**)

**Interfaces:**
- Consumes: `tiltFromPointer`, `TiltInput` (Task 1)
- Produces: `useTilt<T extends HTMLElement>(options?: { maxDeg?: number }): { ref: RefObject<T | null>; onPointerMove: (event: { clientX: number; clientY: number }) => void; onPointerLeave: () => void }`

`onPointerMove` bilinçli olarak `{ clientX, clientY }` taşıyan herhangi bir nesneyi kabul eder; böylece React'in `PointerEvent`'i de `MouseEvent`'i de doğrudan geçirilebilir (Projects'teki mevcut `onMouseMove` ile birleştirmek için gerekli).

- [ ] **Step 1: Write the hook**

`src/lib/useTilt.ts`:

```ts
"use client";

import { useCallback, useEffect, useRef } from "react";
import { tiltFromPointer } from "@/lib/tilt";

/** Spec'teki kart açısı. Çipler bu hook'u kullanmaz. */
const DEFAULT_MAX_DEG = 7;

type PointerLike = { clientX: number; clientY: number };

/**
 * Elemana imleci takip eden 3D eğim verir.
 *
 * Açıyı React state'ine yazmaz — doğrudan DOM'daki CSS değişkenlerini günceller.
 * Böylece fare her kıpırdadığında yeniden render olmaz. Bu, projelerdeki
 * spotlight'ın (--mx/--my) zaten kullandığı yaklaşımın aynısı.
 *
 * Görsel dönüşümün kendisi globals.css'teki `.tilt` sınıfında; dokunmatik
 * cihaz ve reduced-motion kapıları da orada, medya sorgusuyla.
 */
export function useTilt<T extends HTMLElement>({
  maxDeg = DEFAULT_MAX_DEG,
}: { maxDeg?: number } = {}) {
  const ref = useRef<T>(null);
  const frame = useRef(0);

  useEffect(() => {
    // Bekleyen kare unmount'ta iptal edilmezse sökülmüş elemana yazmaya çalışır.
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  const onPointerMove = useCallback(
    ({ clientX, clientY }: PointerLike) => {
      // Kare başına en fazla bir güncelleme: pointermove fare hızına göre
      // saniyede yüzlerce kez tetiklenebiliyor.
      if (frame.current) return;

      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        const el = ref.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const { rotateX, rotateY } = tiltFromPointer({
          width: rect.width,
          height: rect.height,
          x: clientX - rect.left,
          y: clientY - rect.top,
          maxDeg,
        });

        el.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
        el.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
      });
    },
    [maxDeg]
  );

  const onPointerLeave = useCallback(() => {
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  }, []);

  return { ref, onPointerMove, onPointerLeave };
}
```

- [ ] **Step 2: Add the CSS primitives**

`src/app/globals.css` — `/* Erişilebilirlik */` bloğunun **hemen üstüne** ekle:

```css
/* ===== 3D derinlik katmanı =====
   .tilt-scene perspektifi taşır, .tilt eğilen yüzeydir. İkisinin ayrı
   olmasının nedeni: Framer Motion hover animasyonları (whileHover) elemana
   satır içi transform yazıyor ve CSS sınıfını eziyor. Perspektif dıştaki
   motion elemanında, eğim içteki düz elemanda kalınca ikisi çakışmıyor. */
.tilt-scene {
  perspective: 900px;
}

.tilt {
  transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg));
  transition: transform 0.18s ease-out;
  will-change: transform;
}

/* Çiplerde eğim yerine derinlik sıçraması (bkz. plan: spec'ten sapma). */
.depth-scene {
  perspective: 600px;
}

/* Yalnızca gerçek imleci olan cihazlarda. Dokunmatikte hover kavramı yok;
   eğim orada ya hiç tetiklenmez ya da dokunuştan sonra takılı kalır. */
@media not all and (hover: hover) and (pointer: fine) {
  .tilt {
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tilt {
    transform: none;
    transition: none;
  }
}
```

- [ ] **Step 3: Verify nothing regressed**

Run: `npm test && npm run lint && npm run typecheck`
Expected: hepsi temiz. Henüz hiçbir bileşen hook'u kullanmadığı için görsel değişiklik yok.

- [ ] **Step 4: Commit**

```bash
git add src/lib/useTilt.ts src/app/globals.css
git commit -m "Add the useTilt hook and its CSS primitives"
```

---

### Task 3: Proje kartlarına eğim

**Files:**
- Modify: `src/components/sections/Projects.tsx`

**Interfaces:**
- Consumes: `useTilt` (Task 2), `.tilt-scene` / `.tilt` (Task 2)
- Produces: yok (yaprak değişiklik)

**Neden yapısal değişiklik gerekiyor:** Kart şu an tek bir `motion.div`; üzerinde hem `whileHover={{ y: -6 }}` (satır içi transform yazar) hem de eğim olsaydı Framer eğimi ezerdi. Çözüm: dıştaki `motion.div` yalnızca yükselmeyi ve perspektifi taşır, içteki düz `div` eğilir. `group`, `ref` ve spotlight dinleyicisi içteki elemana taşınır — aksi hâlde `group-hover` ve `--mx/--my` yanlış elemana bağlanır.

- [ ] **Step 1: Rewrite the card wrapper**

`src/components/sections/Projects.tsx` içindeki `ProjectCard`'ın `return` bloğunu şununla değiştir:

```tsx
  return (
    <Reveal delay={index * 0.08}>
      <motion.div
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="tilt-scene h-full"
      >
        <div
          ref={ref}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          className="tilt group relative h-full overflow-hidden rounded-2xl border border-border-subtle bg-card p-7 transition-colors hover:border-accent-to/30"
        >
          <div
            className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(28rem 28rem at var(--mx) var(--my), rgba(99,102,241,0.12), transparent 60%)",
            }}
          />

          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-6">
              <ProjectThumbnail
                id={project.id}
                media={project.media}
                name={project.name}
                index={index}
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-bold tracking-tight">
                  {project.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-accent-to/90">
                  {copy.subtitle}
                </p>
              </div>
              <span className="font-mono text-xs text-muted/60">0{index + 1}</span>
            </div>

            <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
              {copy.description}
            </p>

            <ul className="mt-5 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-md border border-border-subtle bg-foreground/[0.02] px-2.5 py-1 text-xs font-medium text-foreground/75"
                >
                  {tech}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-3 border-t border-border-subtle pt-5">
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-accent-to"
                >
                  <ExternalIcon width={16} height={16} />
                  {t.projects.live}
                </a>
              )}
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                <GithubIcon width={16} height={16} />
                {t.projects.code}
              </a>
              <ArrowUpRightIcon
                width={18}
                height={18}
                className="ml-auto text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-to"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
```

Kart içeriği birebir korunmuştur — yalnızca sarmalayıcı katman değişti.

- [ ] **Step 2: Merge the tilt handler with the existing spotlight handler**

`ProjectCard`'ın tepesindeki `ref` ve `onMouseMove` tanımlarını şununla değiştir:

```tsx
  const { t } = useApp();
  const { ref, onPointerMove: tilt, onPointerLeave } = useTilt<HTMLDivElement>();
  const copy = t.projects.items[project.id];

  // Tek dinleyici hem spotlight'ı hem eğimi besler; ikisi de aynı imleç
  // konumunu kullanıyor, ayrı ayrı dinlemek gereksiz iş olurdu.
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    }
    tilt(e);
  };
```

Dosyanın ilk import satırı şu an şöyle:

```tsx
import { useRef, type MouseEvent } from "react";
```

Bunu şununla değiştir (`useRef` ve `MouseEvent` artık kullanılmıyor; ikisi de `useTilt` içine taşındı):

```tsx
import { type PointerEvent } from "react";
```

ve `useApp` import'unun altına ekle:

```tsx
import { useTilt } from "@/lib/useTilt";
```

- [ ] **Step 3: Verify the gate**

Run: `npm test && npm run lint && npm run typecheck`
Expected: hepsi temiz

- [ ] **Step 4: Verify in the browser**

Run: `npm run dev`
Aç: `http://localhost:3000/#projects`
Kontrol et:
- İmleci bir kartın üzerinde gezdirince kart imlecin bulunduğu kenardan geri yatıyor
- Spotlight parıltısı hâlâ imleci takip ediyor
- Kart üzerine gelince hâlâ 6px yükseliyor
- Ekran görüntüsü hover'da hâlâ hafifçe büyüyor (`group-hover` bozulmamış)
- İmleç karttan çıkınca kart düzleşiyor

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Projects.tsx
git commit -m "Tilt the project cards toward the cursor"
```

---

### Task 4: Deneyim, sertifika ve istatistik kartlarına eğim

**Files:**
- Modify: `src/components/sections/Experience.tsx`
- Modify: `src/components/sections/About.tsx`

**Interfaces:**
- Consumes: `useTilt` (Task 2), `.tilt-scene` / `.tilt` (Task 2)
- Produces: yok

Bu üç kart grubu aynı muameleyi görüyor, bu yüzden tek task. Sertifika ve zaman çizelgesi kartlarında Framer hover'ı **yok**, yani sarmalayıcıya gerek kalmadan doğrudan `tilt-scene` + `tilt` uygulanabilir. İstatistik kartlarında `whileHover={{ y: -3 }}` var, orada Task 3'teki iki katmanlı yapı gerekiyor.

- [ ] **Step 1: Add a small tilt component for the plain cards**

`src/components/sections/Experience.tsx` — dosyanın üstüne, `Experience` fonksiyonundan **önce** ekle:

```tsx
/** Framer hover'ı olmayan düz kartlar için eğimli sarmalayıcı. */
function TiltCard({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const { ref, onPointerMove, onPointerLeave } = useTilt<HTMLDivElement>();

  return (
    <div className="tilt-scene">
      <div
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className={`tilt ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
```

Import ekle (Experience.tsx şu an react'ten hiçbir şey import etmiyor, iki satır da yeni):

```tsx
import type { ReactNode } from "react";
import { useTilt } from "@/lib/useTilt";
```

- [ ] **Step 2: Apply it to the timeline cards**

`Experience.tsx` içinde zaman çizelgesi kartındaki

```tsx
<div className="glass rounded-2xl p-5 transition-colors hover:bg-foreground/[0.03]">
```

satırını şununla değiştir (kapanış `</div>`'i `</TiltCard>` yap):

```tsx
<TiltCard className="glass rounded-2xl p-5 transition-colors hover:bg-foreground/[0.03]">
```

- [ ] **Step 3: Apply it to the certificate cards**

Aynı dosyada sertifika kartındaki

```tsx
<div className="glass group flex items-center gap-4 rounded-2xl p-5 transition-colors hover:bg-foreground/[0.03]">
```

satırını şununla değiştir (kapanış `</div>`'i `</TiltCard>` yap):

```tsx
<TiltCard className="glass group flex items-center gap-4 rounded-2xl p-5 transition-colors hover:bg-foreground/[0.03]">
```

- [ ] **Step 4: Apply the two-layer structure to the stat cards**

`src/components/sections/About.tsx` — istatistik kartı bloğunu şununla değiştir:

```tsx
            {stats.map((s) => (
              <StatCard key={s.label} value={s.value} label={s.label} />
            ))}
```

ve `About` fonksiyonundan **önce** şu bileşeni ekle:

```tsx
/** İstatistik kartı: dıştaki motion yükselmeyi, içteki düz eleman eğimi taşır. */
function StatCard({ value, label }: { value: string; label: string }) {
  const { ref, onPointerMove, onPointerLeave } = useTilt<HTMLDivElement>();

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="tilt-scene"
    >
      <div
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="tilt glass flex items-center justify-between rounded-2xl px-6 py-5 transition-colors hover:bg-foreground/[0.04]"
      >
        <CountUp
          value={value}
          className="font-display text-3xl font-bold text-gradient"
        />
        <span className="text-sm text-muted">{label}</span>
      </div>
    </motion.div>
  );
}
```

Import ekle:

```tsx
import { useTilt } from "@/lib/useTilt";
```

- [ ] **Step 5: Verify the gate**

Run: `npm test && npm run lint && npm run typecheck`
Expected: hepsi temiz

- [ ] **Step 6: Verify in the browser**

Run: `npm run dev`
Aç: `http://localhost:3000/#experience` ve `http://localhost:3000/#about`
Kontrol et: sertifika kartları, zaman çizelgesi kartları ve istatistik kartları imlece göre eğiliyor; istatistik kartları hâlâ hover'da yükseliyor; CountUp sayımı bozulmamış.

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/Experience.tsx src/components/sections/About.tsx
git commit -m "Tilt the experience, certificate and stat cards"
```

---

### Task 5: Yetenek çiplerine derinlik sıçraması

**Files:**
- Modify: `src/components/sections/Skills.tsx`

**Interfaces:**
- Consumes: `.depth-scene` (Task 2)
- Produces: yok

Çipler `useTilt` kullanmaz (bkz. "Spec'ten bilinçli sapma"). Mevcut `whileHover={{ y: -3 }}` yerine Framer'ın `z` ekseni kullanılıyor: Framer bunu `translateZ` olarak yazar, üstteki `.depth-scene` perspektifi sayesinde çip gerçekten öne gelir. Framer satır içi transform yazdığı için CSS sınıfıyla çakışma olmaz.

- [ ] **Step 1: Add perspective to the chip list and swap the hover**

`src/components/sections/Skills.tsx` içinde:

```tsx
                className="flex flex-wrap gap-2"
```
→
```tsx
                className="depth-scene flex flex-wrap gap-2"
```

ve

```tsx
                    whileHover={{ y: -3 }}
```
→
```tsx
                    whileHover={{ z: 18 }}
```

- [ ] **Step 2: Verify the gate**

Run: `npm test && npm run lint && npm run typecheck`
Expected: hepsi temiz

- [ ] **Step 3: Verify in the browser**

Run: `npm run dev`
Aç: `http://localhost:3000/#skills`
Kontrol et: çipin üzerine gelince çip yukarı kaymak yerine **büyüyerek öne geliyor** (perspektif etkisi). `prefers-reduced-motion` açıkken hareket yok — Framer `MotionConfig reducedMotion="user"` ile zaten kapatıyor.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Skills.tsx
git commit -m "Pop the skill chips toward the viewer on hover"
```

---

### Task 6: Erişilebilirlik denetimi ve ölçüm

**Files:**
- Modify: yok (yalnızca doğrulama; bulgu çıkarsa ilgili dosya)

**Interfaces:**
- Consumes: Task 3–5 çıktıları
- Produces: yok

- [ ] **Step 1: Measure the bundle against the baseline**

Run: `npm run build`

`/[lang]` satırının **First Load JS** değerini, Task 1 Step 0'da not ettiğin referansla karşılaştır.

Expected: fark **0 kB'a çok yakın**. Bu fazda yeni bağımlılık yok; eklenen şey birkaç yüz bayt JS ve CSS. Belirgin bir artış varsa yanlışlıkla ağır bir şey import edilmiştir — `npm run build` çıktısındaki chunk listesini incele.

- [ ] **Step 2: Verify reduced-motion actually disables the tilt**

Run: `npm run dev`
Chrome DevTools → Command palette (Ctrl+Shift+P) → "Show Rendering" → **Emulate CSS prefers-reduced-motion: reduce**
Kontrol et: kartların üzerine gelince eğim **yok**, spotlight parıltısı çalışmaya devam ediyor (o hareket değil, renk), çipler sıçramıyor.

- [ ] **Step 3: Verify touch devices get no stuck tilt**

Chrome DevTools → Device toolbar (Ctrl+Shift+M) → iPhone profili seç → sayfayı yeniden yükle
Kontrol et: bir karta dokunup bırakınca kart **eğik kalmıyor**; `(hover: hover) and (pointer: fine)` kapısı çalışıyor.

- [ ] **Step 4: Capture before/after screenshots**

Chrome'da `/#projects` bölümünün ekran görüntüsünü al (imleç bir kartın üzerindeyken). Değişikliğin gerçekten görünür olduğunu kanıtlar; PR açıklamasına eklenebilir.

- [ ] **Step 5: Final gate and push**

```bash
npm test && npm run lint && npm run typecheck && npm run build
git push origin main
```

Expected: 70 test geçer, lint/typecheck temiz, build başarılı.

---

## Tamamlanma kriterleri

- [ ] Proje, sertifika, zaman çizelgesi ve istatistik kartları imleci takip ederek eğiliyor
- [ ] Yetenek çipleri hover'da öne geliyor
- [ ] Dokunmatik cihazlarda hiçbir eğim tetiklenmiyor
- [ ] `prefers-reduced-motion: reduce` açıkken tüm eğim ve sıçrama kapalı
- [ ] First Load JS artışı ihmal edilebilir düzeyde (ölçülmüş, tahmin edilmemiş)
- [ ] `npm test` 70 test geçiyor; lint, typecheck ve build temiz

## Bu plana dâhil olmayan

- Kart içindeki görselin `translateZ` ile öne çıkması (parallax). Kart `overflow: hidden` taşıyor ve bu, tarayıcıların `transform-style: preserve-3d`'yi düzleştirmesine yol açan bilinen bir durum. Eğimin kendisi etkiyi zaten veriyor; parallax ayrı bir tur olarak, gerçek tarayıcıda denenerek ele alınmalı.
- Hero'daki WebGL sahnesi — Faz 2, kendi planı olacak.
