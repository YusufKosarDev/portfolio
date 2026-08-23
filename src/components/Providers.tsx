"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { MotionConfig } from "framer-motion";
import { getTranslation, type Lang, type Translation } from "@/lib/i18n";
import {
  getThemeServerSnapshot,
  getThemeSnapshot,
  setTheme,
  subscribeTheme,
  type Theme,
} from "@/lib/theme-store";
import {
  getLangServerSnapshot,
  getLangSnapshot,
  setStoredLang,
  subscribeLang,
} from "@/lib/lang-store";

type AppContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: Translation;
};

const AppContext = createContext<AppContextValue | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  // Tema ve dil React'in dışında yaşıyor: layout'taki inline script ikisini de
  // hidrasyondan önce <html> üzerine uyguluyor (flash önleme). Harici store
  // olarak okunduklarında React hidrasyonda sunucu değerini kullanır, hemen
  // ardından istemci değeriyle yeniden render eder — ne senkron setState
  // gerekir ne de hidrasyon uyumsuzluğu oluşur.
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  const lang = useSyncExternalStore(
    subscribeLang,
    getLangSnapshot,
    getLangServerSnapshot
  );

  const toggleTheme = useCallback(() => {
    setTheme(getThemeSnapshot() === "dark" ? "light" : "dark");
  }, []);

  const setLang = useCallback((next: Lang) => {
    setStoredLang(next);
  }, []);

  const toggleLang = useCallback(() => {
    setStoredLang(getLangSnapshot() === "tr" ? "en" : "tr");
  }, []);

  const value: AppContextValue = {
    theme,
    toggleTheme,
    lang,
    setLang,
    toggleLang,
    t: getTranslation(lang),
  };

  return (
    <AppContext.Provider value={value}>
      {/* reducedMotion="user": prefers-reduced-motion açıkken tüm framer-motion
          animasyonlarını devre dışı bırakır. CSS animasyonları globals.css'te
          zaten kapatılıyor; bu, JS tarafındaki karşılığı. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <Providers>");
  return ctx;
}
