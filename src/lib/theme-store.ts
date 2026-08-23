// Tema tercihi React'in dışında yaşıyor: layout'taki inline script, hidrasyondan
// önce <html> üzerine `light` sınıfını koyuyor (flash önleme). Bu modül o DOM
// durumunu tek doğru kaynak olarak sunar.
//
// useSyncExternalStore ile okunduğunda React hidrasyonda sunucu anlık görüntüsünü
// kullanır, hemen ardından istemci değeriyle yeniden render eder. Böylece ne
// effect içinde senkron setState gerekir ne de hidrasyon uyumsuzluğu oluşur.

export type Theme = "dark" | "light";

const listeners = new Set<() => void>();

export function subscribeTheme(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getThemeSnapshot(): Theme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

/** Sunucuda DOM yok; inline script çalışmadan önceki varsayılan koyu tema. */
export function getThemeServerSnapshot(): Theme {
  return "dark";
}

export function setTheme(next: Theme): void {
  document.documentElement.classList.toggle("light", next === "light");
  try {
    localStorage.setItem("theme", next);
  } catch {
    // Depolama kapalıysa tercih kalıcı olmaz; tema yine de uygulanır.
  }
  listeners.forEach((listener) => listener());
}
