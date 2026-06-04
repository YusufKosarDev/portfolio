"use client";

import { useState } from "react";
import { projectScreenshot } from "@/lib/data";

type ProjectThumbnailProps = {
  /** Ekran görüntüsü alınacak canlı site URL'i */
  live: string;
  /** Proje adı (alt metin / erişilebilirlik) */
  name: string;
  /** Gradient fallback için sırayla değişen vurgu (her kart farklı) */
  index: number;
};

// Hata durumunda gösterilecek koyu temayla uyumlu gradient çeşitleri.
const fallbackGradients = [
  "radial-gradient(120% 120% at 0% 0%, rgba(139,92,246,0.35), transparent 55%), radial-gradient(120% 120% at 100% 100%, rgba(34,211,238,0.30), transparent 55%), linear-gradient(135deg, #0d1326, #0a0a0f)",
  "radial-gradient(120% 120% at 100% 0%, rgba(34,211,238,0.32), transparent 55%), radial-gradient(120% 120% at 0% 100%, rgba(99,102,241,0.30), transparent 55%), linear-gradient(135deg, #0b1322, #0a0a0f)",
  "radial-gradient(120% 120% at 0% 100%, rgba(99,102,241,0.34), transparent 55%), radial-gradient(120% 120% at 100% 0%, rgba(139,92,246,0.28), transparent 55%), linear-gradient(135deg, #0d1124, #0a0a0f)",
  "radial-gradient(120% 120% at 50% 0%, rgba(34,211,238,0.30), transparent 55%), radial-gradient(120% 120% at 50% 100%, rgba(139,92,246,0.30), transparent 55%), linear-gradient(135deg, #0c1426, #0a0a0f)",
];

/**
 * Kart üstünde canlı siteden otomatik çekilen ekran görüntüsünü gösterir.
 * - Yüklenene kadar: shimmer'lı zarif skeleton
 * - Hata olursa: koyu temayla uyumlu gradient fallback (proje baş harfiyle)
 * - Hover'da: hafif zoom efekti (group-hover parent karttan tetiklenir)
 */
export function ProjectThumbnail({ live, name, index }: ProjectThumbnailProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const gradient = fallbackGradients[index % fallbackGradients.length];

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border-subtle bg-foreground/[0.02]">
      {/* Skeleton: görsel yüklenene ve hata olmadığında görünür */}
      {!loaded && !errored && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-foreground/[0.06] via-foreground/[0.02] to-foreground/[0.06]" />
      )}

      {/* Gradient fallback: yükleme hata verirse */}
      {errored && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: gradient }}
        >
          <span className="font-display text-4xl font-bold text-white/80 drop-shadow">
            {name.charAt(0)}
          </span>
        </div>
      )}

      {/* Canlı ekran görüntüsü (microlink.io) */}
      {!errored && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={projectScreenshot(live)}
          alt={`${name} — canlı önizleme`}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={`h-full w-full object-cover object-top transition-[opacity,transform] duration-500 ease-out group-hover:scale-[1.04] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Alt kenarda hafif okunabilirlik degrade'i */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card/60 to-transparent" />
    </div>
  );
}
