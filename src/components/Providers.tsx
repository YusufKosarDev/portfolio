"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LANG,
  getTranslation,
  type Lang,
  type Translation,
} from "@/lib/i18n";

type Theme = "dark" | "light";

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
  // Tema: flash önlemek için layout'taki inline script <html>'e class ekler.
  // Burada ilk değeri DOM'dan okuyarak hidrasyonla uyumlu tutuyoruz.
  const [theme, setTheme] = useState<Theme>("dark");
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  // İlk yüklemede gerçek tercihleri uygula (DOM + localStorage).
  useEffect(() => {
    const storedTheme =
      document.documentElement.classList.contains("light") ? "light" : "dark";
    setTheme(storedTheme);

    const storedLang = localStorage.getItem("lang") as Lang | null;
    if (storedLang === "tr" || storedLang === "en") {
      setLangState(storedLang);
      document.documentElement.lang = storedLang;
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      const root = document.documentElement;
      root.classList.toggle("light", next === "light");
      localStorage.setItem("theme", next);
      return next;
    });
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    localStorage.setItem("lang", next);
    document.documentElement.lang = next;
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "tr" ? "en" : "tr");
  }, [lang, setLang]);

  const value: AppContextValue = {
    theme,
    toggleTheme,
    lang,
    setLang,
    toggleLang,
    t: getTranslation(lang),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <Providers>");
  return ctx;
}
