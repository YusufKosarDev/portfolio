"use client";

import { motion } from "framer-motion";
import { highlights } from "@/lib/data";
import { useApp } from "@/components/Providers";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal, staggerContainer, staggerItem } from "@/components/Reveal";

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
              <div
                key={s.label}
                className="glass flex items-center justify-between rounded-2xl px-6 py-5 transition-colors hover:bg-foreground/[0.04]"
              >
                <span className="font-display text-3xl font-bold text-gradient">
                  {s.value}
                </span>
                <span className="text-sm text-muted">{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
