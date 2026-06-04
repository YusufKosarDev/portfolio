"use client";

import { useApp } from "@/components/Providers";
import { DownloadIcon } from "@/components/icons";

type CvButtonProps = {
  /** Ek sınıf (yerleşim/animasyon sarmalayıcılarıyla uyum için) */
  className?: string;
};

/**
 * Aktif dile göre doğru CV PDF'ini indiren buton.
 * Dosya yolu ve metin i18n'den gelir: TR → Türkçe CV, EN → İngilizce CV.
 * `download` özniteliği dosyayı yeni sekmede açmak yerine indirmeyi tetikler.
 */
export function CvButton({ className = "" }: CvButtonProps) {
  const { t } = useApp();

  return (
    <a
      href={t.cv.file}
      download
      className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-accent-to/30 bg-foreground/[0.03] px-6 py-3 text-sm font-semibold text-foreground transition-all hover:scale-[1.03] hover:border-accent-to/60 hover:bg-foreground/[0.05] active:scale-[0.98] ${className}`}
    >
      {/* Hover'da beliren ince gradient parıltı */}
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r from-accent-from/10 via-accent-mid/10 to-accent-to/10" />
      <DownloadIcon
        width={17}
        height={17}
        className="relative text-accent-to transition-transform duration-300 group-hover:translate-y-0.5"
      />
      <span className="relative">{t.cv.download}</span>
    </a>
  );
}
