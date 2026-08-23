"use client";

import { type PointerEvent } from "react";
import { motion } from "framer-motion";
import { projects, type Project } from "@/lib/data";
import { useApp } from "@/components/Providers";
import { useTilt } from "@/lib/useTilt";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { ProjectThumbnail } from "@/components/ProjectThumbnail";
import { GithubIcon, ExternalIcon, ArrowUpRightIcon } from "@/components/icons";

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { t } = useApp();
  const { ref, onPointerMove: tilt, onPointerLeave } = useTilt<HTMLDivElement>();
  const copy = t.projects.items[project.id];

  // Tek dinleyici hem spotlight'ı hem eğimi besler; ikisi de aynı imleç
  // konumunu kullanıyor, ayrı ayrı dinlemek gereksiz iş olurdu.
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    }
    tilt(e);
  };

  return (
    <Reveal delay={index * 0.08}>
      <motion.div
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="tilt-scene h-full"
      >
        <div
          ref={ref}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          className="tilt group relative h-full overflow-hidden rounded-2xl border border-border-subtle bg-card p-7 transition-colors hover:border-accent-to/30"
        >
          <div
            className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(28rem 28rem at var(--mx) var(--my), rgba(99,102,241,0.12), transparent 60%)",
            }}
          />

          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-6">
              <ProjectThumbnail
                id={project.id}
                media={project.media}
                name={project.name}
                index={index}
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-bold tracking-tight">
                  {project.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-accent-to/90">
                  {copy.subtitle}
                </p>
              </div>
              <span className="font-mono text-xs text-muted/60">0{index + 1}</span>
            </div>

            <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
              {copy.description}
            </p>

            <ul className="mt-5 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-md border border-border-subtle bg-foreground/[0.02] px-2.5 py-1 text-xs font-medium text-foreground/75"
                >
                  {tech}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-3 border-t border-border-subtle pt-5">
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-accent-to"
                >
                  <ExternalIcon width={16} height={16} />
                  {t.projects.live}
                </a>
              )}
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                <GithubIcon width={16} height={16} />
                {t.projects.code}
              </a>
              <ArrowUpRightIcon
                width={18}
                height={18}
                className="ml-auto text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-to"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}

export function Projects() {
  const { t } = useApp();

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <SectionHeading
        eyebrow={t.projects.eyebrow}
        title={t.projects.title}
        description={t.projects.description}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
