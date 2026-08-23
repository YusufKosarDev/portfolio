import { DEFAULT_LANG, LANGS, type Lang } from "@/lib/i18n";

// Varsayılan dil (Türkçe) çıplak adreslerde servis edilir: "/", "/blog".
// Diğer diller önekli: "/en", "/en/blog". Böylece CV ve profillerde yazılı olan
// kök adres çalışmaya devam eder. next.config.ts'teki rewrite, çıplak adresleri
// dahili "/[lang]" rotasına bağlar.

/**
 * Yolun başındaki dil önekini kaldırır.
 *
 * Varsayılan dil de soyulur: rewrite yüzünden `usePathname()` tarayıcıdaki
 * "/blog" yerine dahili hedef olan "/tr/blog" değerini döndürebiliyor.
 * İki biçim de aynı çıplak yola indirgenmeli.
 */
export function stripLocale(pathname: string): string {
  for (const lang of LANGS) {
    if (pathname === `/${lang}`) return "/";
    if (pathname.startsWith(`/${lang}/`)) return pathname.slice(lang.length + 1);
  }
  return pathname || "/";
}

/** Verilen yolu hedef dilin adresine çevirir. "/blog" + en -> "/en/blog" */
export function localePath(lang: Lang, path = "/"): string {
  const bare = stripLocale(path);
  const suffix = bare === "/" ? "" : bare;
  if (lang === DEFAULT_LANG) return suffix || "/";
  return `/${lang}${suffix}`;
}
