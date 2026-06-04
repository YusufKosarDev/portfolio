"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { sectionIds } from "@/lib/data";
import { useApp } from "@/components/Providers";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";

export function Navbar() {
  const { t } = useApp();
  const [active, setActive] = useState<string>("hero");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: görünür bölümü aktif et
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-3 z-50 flex justify-center px-4"
    >
      <nav
        className={`flex items-center gap-1 rounded-full px-2 py-2 transition-all duration-300 ${
          scrolled ? "glass shadow-lg shadow-black/20" : "bg-transparent"
        }`}
      >
        <a
          href="#hero"
          className="mr-1 hidden select-none px-3 font-display text-sm font-bold tracking-tight sm:block"
        >
          <span className="text-gradient">YK</span>
        </a>

        <div className="flex items-center">
          {sectionIds.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className="relative hidden rounded-full px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground sm:block sm:text-[13px]"
            >
              <span className="relative z-10">{t.nav[id]}</span>
              <AnimatePresence>
                {active === id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-0 rounded-full bg-foreground/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </AnimatePresence>
            </a>
          ))}
          <Link
            href="/blog"
            className="relative hidden rounded-full px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground sm:block sm:text-[13px]"
          >
            <span className="relative z-10">{t.blog.nav}</span>
          </Link>
        </div>

        <span className="mx-1 hidden h-5 w-px bg-border-subtle sm:block" />

        <div className="flex items-center gap-1">
          <LangToggle />
          <ThemeToggle />
        </div>
      </nav>
    </motion.header>
  );
}
