"use client";

import { motion } from "framer-motion";
import { highlights } from "@/lib/data";
import { useApp } from "@/components/Providers";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal, staggerContainer, staggerItem } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";

export function About() {
  const { t } = useApp();

  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <SectionHeading eyebrow={t.about.eyebrow} title={t.about.title} />

      <div className="grid items-center gap-12 md:grid-cols-5">
        <Reveal className="md:col-span-3">
          <p className="text-lg leading-relaxed text-foreground/90 sm:text-xl">
            {t.about.p1}
          </p>
          <p className="mt-5 leading-relaxed text-muted">{t.about.p2}</p>

          {/* Şu an / Currently — aktif ve gelişen biri olduğunu gösterir */}
          <div className="glass mt-8 inline-flex flex-col gap-2 rounded-2xl px-5 py-4 sm:flex-row sm:items-center sm:gap-5">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-to/90">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              {t.about.currently.label}
            </span>
            <span className="flex flex-col gap-1 text-sm text-foreground/90 sm:flex-row sm:items-center sm:gap-4">
              <span>{t.about.currently.learning}</span>
              <span className="hidden text-muted/40 sm:inline">·</span>
              <span className="text-muted">{t.about.currently.available}</span>
            </span>
          </div>

          <div className="mt-8">
            <p className="mb-3 text-sm font-medium text-muted">
              {t.about.highlightsLabel}
            </p>
            <motion.ul
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="flex flex-wrap gap-2"
            >
              {highlights.map((tech) => (
                <motion.li
                  key={tech}
                  variants={staggerItem}
                  className="glass rounded-lg px-3 py-1.5 text-sm font-medium text-foreground/90"
                >
                  {tech}
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="md:col-span-2">
          <div className="grid gap-4">
            {t.about.stats.map((s) => (
              <motion.div
                key={s.label}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="glass flex items-center justify-between rounded-2xl px-6 py-5 transition-colors hover:bg-foreground/[0.04]"
              >
                <CountUp
                  value={s.value}
                  className="font-display text-3xl font-bold text-gradient"
                />
                <span className="text-sm text-muted">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
