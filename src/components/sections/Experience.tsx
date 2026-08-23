"use client";

import type { ReactNode } from "react";
import { timeline, certificates } from "@/lib/data";
import { useApp } from "@/components/Providers";
import { useTilt } from "@/lib/useTilt";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { GraduationIcon, BadgeIcon } from "@/components/icons";

/** Framer hover'ı olmayan düz kartlar için eğimli sarmalayıcı. */
function TiltCard({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const { ref, onPointerMove, onPointerLeave } = useTilt<HTMLDivElement>();

  return (
    <div className="tilt-scene">
      <div
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className={`tilt ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

export function Experience() {
  const { t } = useApp();

  return (
    <section id="experience" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <SectionHeading
        eyebrow={t.experience.eyebrow}
        title={t.experience.title}
        description={t.experience.description}
      />

      <div className="grid gap-12 md:grid-cols-2">
        {/* Timeline */}
        <div>
          <h3 className="mb-7 font-display text-lg font-semibold text-foreground/90">
            {t.experience.eduTitle}
          </h3>
          <div className="relative ml-2 border-l border-border-subtle pl-8">
            {timeline.map((item, i) => {
              const copy = t.experience.items[item.id];
              return (
                <Reveal
                  key={item.id}
                  delay={i * 0.1}
                  className="relative pb-10 last:pb-0"
                >
                  <span className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background ring-1 ring-border-subtle">
                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-accent-from to-accent-to" />
                  </span>
                  <TiltCard className="glass rounded-2xl p-5 transition-colors hover:bg-foreground/[0.03]">
                    <div className="mb-2 flex items-center gap-2">
                      <GraduationIcon
                        width={16}
                        height={16}
                        className="text-accent-to"
                      />
                      <span className="text-xs font-medium uppercase tracking-wider text-muted">
                        {copy.period}
                      </span>
                    </div>
                    <h4 className="font-display text-base font-semibold">
                      {copy.title}
                    </h4>
                    <p className="text-sm font-medium text-accent-to/80">
                      {copy.org}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {copy.description}
                    </p>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* Sertifikalar */}
        <div>
          <h3 className="mb-7 font-display text-lg font-semibold text-foreground/90">
            {t.experience.certTitle}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
            {certificates.map((cert, i) => (
              <Reveal key={cert.title} delay={i * 0.07}>
                <TiltCard className="glass group flex items-center gap-4 rounded-2xl p-5 transition-colors hover:bg-foreground/[0.03]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-from/20 to-accent-to/20 text-accent-to ring-1 ring-border-subtle transition-transform group-hover:scale-110">
                    <BadgeIcon />
                  </span>
                  <div>
                    <h4 className="font-medium text-foreground">{cert.title}</h4>
                    <p className="text-sm text-muted">{cert.org}</p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
