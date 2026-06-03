"use client";

import { motion } from "framer-motion";
import { skillCategories } from "@/lib/data";
import { useApp } from "@/components/Providers";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal, staggerContainer, staggerItem } from "@/components/Reveal";

export function Skills() {
  const { t } = useApp();

  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <SectionHeading
        eyebrow={t.skills.eyebrow}
        title={t.skills.title}
        description={t.skills.description}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        {skillCategories.map((cat, i) => (
          <Reveal key={cat.key} delay={i * 0.08}>
            <div className="glass group h-full rounded-2xl p-6 transition-colors hover:bg-foreground/[0.03]">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-6 w-1 rounded-full bg-gradient-to-b from-accent-from to-accent-to" />
                <h3 className="font-display text-lg font-semibold">
                  {t.skills.categories[cat.key]}
                </h3>
              </div>
              <motion.ul
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                className="flex flex-wrap gap-2"
              >
                {cat.skills.map((skill) => (
                  <motion.li
                    key={skill}
                    variants={staggerItem}
                    whileHover={{ y: -3 }}
                    className="cursor-default rounded-lg border border-border-subtle bg-foreground/[0.02] px-3 py-1.5 text-sm text-foreground/85 transition-colors hover:border-accent-to/40 hover:text-foreground"
                  >
                    {skill}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
