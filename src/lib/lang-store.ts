// Dil tercihi şu an localStorage'da tutuluyor ve layout'taki inline script
// hidrasyondan önce <html lang> özniteliğine uyguluyor. Tema deposuyla aynı
// desen: harici store olarak okunur, böylece effect içinde senkron setState
// gerekmez.

import { DEFAULT_LANG, type Lang } from "@/lib/i18n";

const listeners = new Set<() => void>();

export function subscribeLang(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getLangSnapshot(): Lang {
  try {
    const stored = localStorage.getItem("lang");
    if (stored === "tr" || stored === "en") return stored;
  } catch {
    // Depolama kapalıysa varsayılan dile düşülür.
  }
  return DEFAULT_LANG;
}

/** Sunucuda depolama yok; varsayılan dil. */
export function getLangServerSnapshot(): Lang {
  return DEFAULT_LANG;
}

export function setStoredLang(next: Lang): void {
  try {
    localStorage.setItem("lang", next);
  } catch {
    // Depolama kapalıysa tercih kalıcı olmaz; dil yine de değişir.
  }
  document.documentElement.lang = next;
  listeners.forEach((listener) => listener());
}
