"use client";

import { usePathname } from "next/navigation";
import { useApp } from "@/components/Providers";
import { LANGS } from "@/lib/i18n";
import { localePath } from "@/lib/routes";

/**
 * Dil değiştirici. Dil adreste yaşadığı için düğmeler değil bağlantılar:
 * aynı sayfanın diğer dildeki karşılığına gider, böylece her iki dil de
 * gerçek bir URL'e sahip olur ve arama motorları ikisini de görebilir.
 *
 * Bilinçli olarak `next/link` değil düz `<a>`: dil değişimi kök layout'un
 * parametresini değiştiriyor ve React bu geçişte <html> üzerindeki tüm
 * öznitelikleri sıfırlayıp yalnızca kendi renderladıklarını geri koyuyor —
 * bu da inline script'in koyduğu data-theme'i silip temayı sıfırlıyordu.
 * Tam sayfa yüklemesinde script yeniden çalışıp tercihi uyguluyor.
 * Aynı dil içindeki gezinme soft navigation olarak kalır.
 */
export function LangToggle() {
  const { lang, t } = useApp();
  const pathname = usePathname() ?? "/";

  return (
    <div
      role="group"
      aria-label={t.nav.toggleLang}
      className="flex items-center rounded-full bg-foreground/[0.06] p-0.5 text-xs font-semibold"
    >
      {LANGS.map((l) => {
        const active = l === lang;
        return (
          <a
            key={l}
            href={localePath(l, pathname)}
            hrefLang={l}
            aria-current={active ? "true" : undefined}
            className={`rounded-full px-2.5 py-1 uppercase transition-colors ${
              active
                ? "bg-gradient-to-r from-accent-from to-accent-to text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {l}
          </a>
        );
      })}
    </div>
  );
}
