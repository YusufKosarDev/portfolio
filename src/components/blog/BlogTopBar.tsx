"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useApp } from "@/components/Providers";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { ArrowUpRightIcon } from "@/components/icons";

/**
 * Blog sayfaları için sabit üst bar — ana siteyle aynı cam/tema dilini kullanır.
 * `to` ve `label` ile "ana sayfa" veya "tüm yazılar" geri bağlantısı gösterir.
 */
export function BlogTopBar({ to, label }: { to: string; label: string }) {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-3 z-50 flex justify-center px-4"
    >
      <nav className="glass flex items-center gap-2 rounded-full px-3 py-2 shadow-lg shadow-black/20">
        <Link
          href={to}
          className="group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowUpRightIcon
            width={15}
            height={15}
            className="rotate-[225deg] transition-transform group-hover:-translate-x-0.5"
          />
          {label}
        </Link>
        <span className="mx-1 h-5 w-px bg-border-subtle" />
        <LangToggle />
        <ThemeToggle />
      </nav>
    </motion.header>
  );
}

/** Aktif dile göre tarih biçimlendirme yardımcısı. */
export function useFormattedDate(date: string): string {
  const { lang } = useApp();
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed);
}
