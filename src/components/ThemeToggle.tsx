"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/components/Providers";
import { SunIcon, MoonIcon } from "@/components/icons";

export function ThemeToggle() {
  const { theme, toggleTheme, t } = useApp();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t.nav.toggleTheme}
      title={t.nav.toggleTheme}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/10 hover:text-foreground"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.25 }}
          className="flex"
        >
          {isDark ? (
            <MoonIcon width={18} height={18} />
          ) : (
            <SunIcon width={18} height={18} />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
