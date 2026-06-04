"use client";

import { motion } from "framer-motion";
import { personal } from "@/lib/data";
import { useApp } from "@/components/Providers";
import { CvButton } from "@/components/CvButton";
import {
  GithubIcon,
  LinkedinIcon,
  MailIcon,
} from "@/components/icons";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero() {
  const { t } = useApp();

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <div className="grid-overlay pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2">
        <div className="spin-slow h-full w-full rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(139,92,246,0.25),transparent_30%,rgba(34,211,238,0.18),transparent_60%)] opacity-60 blur-2xl" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex max-w-4xl flex-col items-center"
      >
        <motion.span
          variants={item}
          className="glass mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-to opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-to" />
          </span>
          {t.hero.badge}
        </motion.span>

        <motion.h1
          variants={item}
          className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl md:text-8xl"
        >
          <span className="text-gradient">{personal.name}</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-5 font-display text-xl font-medium text-foreground/90 sm:text-2xl md:text-3xl"
        >
          {t.hero.title}
        </motion.p>

        <motion.p
          variants={item}
          className="mt-5 max-w-xl text-balance text-base leading-relaxed text-muted sm:text-lg"
        >
          {t.hero.tagline}
        </motion.p>

        <motion.div
          variants={item}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="#projects"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-accent-from via-accent-mid to-accent-to px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-mid/25 transition-transform hover:scale-[1.03]"
          >
            {t.hero.ctaProjects}
          </a>
          <a
            href="#contact"
            className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/10"
          >
            {t.hero.ctaContact}
          </a>
          <CvButton />
        </motion.div>

        <motion.div variants={item} className="mt-8 flex items-center gap-3">
          {[
            { href: personal.github, label: "GitHub", Icon: GithubIcon },
            { href: personal.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
            { href: `mailto:${personal.email}`, label: "E-posta", Icon: MailIcon },
          ].map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={label}
              className="glass flex h-11 w-11 items-center justify-center rounded-full text-muted transition-all hover:scale-110 hover:text-foreground"
            >
              <Icon />
            </a>
          ))}
        </motion.div>
      </motion.div>

      <motion.a
        href="#about"
        aria-label={t.hero.scroll}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-muted"
      >
        <span className="text-[11px] uppercase tracking-[0.25em]">
          {t.hero.scroll}
        </span>
        <span className="flex h-9 w-5 items-start justify-center rounded-full border border-border-subtle p-1">
          <span className="scroll-dot h-1.5 w-1.5 rounded-full bg-foreground/70" />
        </span>
      </motion.a>
    </section>
  );
}
