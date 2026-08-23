"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { type ProjectMedia } from "@/lib/data";

type ProjectThumbnailProps = {
  /** Proje kimliği — ekran görüntüsü dosyasının adını belirler */
  id: string;
  /** Ekran görüntüsü yerine geçen yerel medya (poster + video) */
  media?: ProjectMedia;
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

const frameClass =
  "relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border-subtle bg-foreground/[0.02]";

const bottomFade =
  "pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card/60 to-transparent";

/**
 * Canlı linki olmayan projeler için poster + sessiz döngü videosu gösterir.
 * - Poster anında görünür (hafif PNG), video baytları yalnızca kart görünür
 *   olunca yüklenir (`preload="none"` + IntersectionObserver ile play/pause).
 *   Böylece sayfa açılışı yavaşlamaz.
 * - Hover'da hafif zoom (group-hover parent karttan tetiklenir).
 */
function MediaThumbnail({ media, name }: { media: ProjectMedia; name: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    // IntersectionObserver yoksa (çok eski tarayıcı) doğrudan oynat.
    if (typeof IntersectionObserver === "undefined") {
      void video.play().catch(() => {});
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // preload="none" olduğundan baytlar ilk play() ile yüklenmeye başlar.
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px", threshold: 0.15 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <div className={frameClass}>
      <video
        ref={ref}
        poster={media.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={`${name} — demo önizleme`}
        className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      >
        <source src={media.webm} type="video/webm" />
        <source src={media.mp4} type="video/mp4" />
      </video>
      <div className={bottomFade} />
    </div>
  );
}

/**
 * Kart üstünde projenin ekran görüntüsünü gösterir.
 *
 * Görseller `npm run screenshots` ile bir kez çekilip repoda tutulur; sayfa
 * açılışında hiçbir dış servise istek gitmez. Dosya eksikse veya yüklenemezse
 * kart yine de dolu görünür:
 * - Yüklenene kadar: shimmer'lı zarif skeleton
 * - Hata olursa: koyu temayla uyumlu gradient fallback (proje baş harfiyle)
 * - Hover'da: hafif zoom efekti (group-hover parent karttan tetiklenir)
 */
export function ProjectThumbnail({ id, media, name, index }: ProjectThumbnailProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const gradient = fallbackGradients[index % fallbackGradients.length];

  // Yerel medya varsa ekran görüntüsü yerine poster + video kullan.
  if (media) {
    return <MediaThumbnail media={media} name={name} />;
  }

  return (
    <div className={frameClass}>
      {/* Skeleton: görsel yüklenene ve hata olmadığında görünür */}
      {!loaded && !errored && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-foreground/[0.06] via-foreground/[0.02] to-foreground/[0.06]" />
      )}

      {/* Gradient fallback: görsel yoksa veya yükleme hata verirse */}
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

      {!errored && (
        <Image
          src={`/projects/${id}.webp`}
          alt={`${name} — önizleme`}
          fill
          sizes="(min-width: 768px) 45vw, 90vw"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={`object-cover object-top transition-[opacity,transform] duration-500 ease-out group-hover:scale-[1.04] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Alt kenarda hafif okunabilirlik degrade'i */}
      <div className={bottomFade} />
    </div>
  );
}
