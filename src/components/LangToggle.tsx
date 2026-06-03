"use client";

import { useApp } from "@/components/Providers";
import { LANGS } from "@/lib/i18n";

export function LangToggle() {
  const { lang, setLang, t } = useApp();

  return (
    <div
      role="group"
      aria-label={t.nav.toggleLang}
      className="flex items-center rounded-full bg-foreground/[0.06] p-0.5 text-xs font-semibold"
    >
      {LANGS.map((l) => {
        const active = l === lang;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={active}
            className={`rounded-full px-2.5 py-1 uppercase transition-colors ${
              active
                ? "bg-gradient-to-r from-accent-from to-accent-to text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
