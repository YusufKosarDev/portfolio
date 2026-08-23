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

type AppContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  /** Aktif dil. Adresten gelir (sunucuda belirlenir), istemcide değişmez. */
  lang: Lang;
  t: Translation;
};

const AppContext = createContext<AppContextValue | null>(null);

export function Providers({ lang, children }: { lang: Lang; children: ReactNode }) {
  // Tema DOM'da yaşıyor: layout'taki inline script hidrasyondan önce <html>'e
  // class ekliyor. Harici store olarak okunduğu için effect içinde senkron
  // setState gerekmiyor ve hidrasyon uyumsuzluğu oluşmuyor.
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  const toggleTheme = useCallback(() => {
    setTheme(getThemeSnapshot() === "dark" ? "light" : "dark");
  }, []);

  const value: AppContextValue = {
    theme,
    toggleTheme,
    lang,
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
