// Tema tercihi React'in dışında yaşıyor: layout'taki inline script, hidrasyondan
// önce <html> üzerine data-theme özniteliğini koyuyor (flash önleme). Bu modül o
// DOM durumunu tek doğru kaynak olarak sunar.
//
// Neden sınıf değil de data özniteliği: kök layout <html> üzerinde className
// render ediyor. Dil değiştiğinde kök layout yeniden render olduğu için React
// class attribute'unu kendi değeriyle üzerine yazıyor ve imperatif eklenen tema
// sınıfı siliniyordu. React render etmediği data-theme'e dokunmaz.
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
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/** Sunucuda DOM yok; inline script çalışmadan önceki varsayılan koyu tema. */
export function getThemeServerSnapshot(): Theme {
  return "dark";
}

export function setTheme(next: Theme): void {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    // Depolama kapalıysa tercih kalıcı olmaz; tema yine de uygulanır.
  }
  listeners.forEach((listener) => listener());
}
