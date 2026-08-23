"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { sectionIds } from "@/lib/data";
import { useApp } from "@/components/Providers";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { MenuIcon, CloseIcon } from "@/components/icons";
import { localePath } from "@/lib/routes";

const MOBILE_NAV_ID = "mobile-nav";

export function Navbar() {
  const { t, lang } = useApp();
  const [active, setActive] = useState<string>("hero");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

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

  // Mobil menü: Escape ve dışarı tıklama ile kapanır.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  return (
    <motion.header
      ref={headerRef}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-3 z-50 flex justify-center px-4"
    >
      <nav
        className={`flex items-center gap-1 rounded-full px-2 py-2 transition-all duration-300 ${
          scrolled || menuOpen ? "glass shadow-lg shadow-black/20" : "bg-transparent"
        }`}
      >
        {/* Mobil menü düğmesi — sm ve üstünde tam gezinme zaten görünür. */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={t.nav.toggleMenu}
          aria-expanded={menuOpen}
          aria-controls={MOBILE_NAV_ID}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/10 hover:text-foreground sm:hidden"
        >
          {menuOpen ? (
            <CloseIcon width={18} height={18} />
          ) : (
            <MenuIcon width={18} height={18} />
          )}
        </button>

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
            href={localePath(lang, "/blog")}
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

      {/* Mobil panel. Masaüstünde hiç render edilmez (sm:hidden), bu yüzden
          geniş ekran görünümü değişmez. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id={MOBILE_NAV_ID}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="glass absolute inset-x-4 top-full mt-2 rounded-2xl p-2 shadow-lg shadow-black/20 sm:hidden"
          >
            <ul className="flex flex-col">
              {sectionIds.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active === id ? "true" : undefined}
                    className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors hover:bg-foreground/[0.06] ${
                      active === id ? "text-foreground" : "text-muted"
                    }`}
                  >
                    {t.nav[id]}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href={localePath(lang, "/blog")}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-foreground/[0.06]"
                >
                  {t.blog.nav}
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
