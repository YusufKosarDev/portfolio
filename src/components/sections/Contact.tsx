"use client";

import { personal } from "@/lib/data";
import { useApp } from "@/components/Providers";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "@/components/ContactForm";
import { CvButton } from "@/components/CvButton";
import {
  GithubIcon,
  LinkedinIcon,
  MailIcon,
  ArrowUpRightIcon,
} from "@/components/icons";

export function Contact() {
  const { t } = useApp();

  const channels = [
    {
      label: "E-posta",
      value: personal.email,
      href: `mailto:${personal.email}`,
      Icon: MailIcon,
    },
    {
      label: "LinkedIn",
      value: "in/yusufkosar",
      href: personal.linkedin,
      Icon: LinkedinIcon,
    },
    {
      label: "GitHub",
      value: "YusufKosarDev",
      href: personal.github,
      Icon: GithubIcon,
    },
  ];

  return (
    <section id="contact" className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <Reveal className="relative overflow-hidden rounded-3xl border border-border-subtle bg-gradient-to-b from-background-alt/60 to-background p-8 sm:p-12">
        <div className="grid-overlay pointer-events-none absolute inset-0 opacity-50" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent-mid/20 blur-3xl" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Sol: başlık + kanallar */}
          <div className="flex flex-col">
            <span className="mb-3 inline-block font-mono text-xs font-semibold uppercase tracking-[0.3em] text-accent-to/90">
              {t.contact.eyebrow}
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t.contact.titleA}{" "}
              <span className="text-gradient">{t.contact.titleHighlight}</span>
            </h2>
            <p className="mt-4 max-w-md text-muted">{t.contact.description}</p>

            <p className="mb-3 mt-8 text-sm font-medium text-muted">
              {t.contact.channelsTitle}
            </p>
            <div className="grid gap-3">
              {channels.map(({ label, value, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="glass group flex items-center gap-3 rounded-xl p-4 text-left transition-colors hover:bg-foreground/[0.04]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.04] text-accent-to">
                    <Icon width={18} height={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-muted">{label}</span>
                    <span className="block truncate text-sm font-medium text-foreground">
                      {value}
                    </span>
                  </span>
                  <ArrowUpRightIcon
                    width={16}
                    height={16}
                    className="ml-auto text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-to"
                  />
                </a>
              ))}
            </div>

            <div className="mt-6">
              <CvButton />
            </div>
          </div>

          {/* Sağ: form */}
          <div className="glass rounded-2xl p-6 sm:p-7">
            <h3 className="mb-5 font-display text-lg font-semibold">
              {t.contact.formTitle}
            </h3>
            <ContactForm />
          </div>
        </div>
      </Reveal>

      <footer className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border-subtle pt-8 text-sm text-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="font-medium text-foreground/80">{personal.name}</span>
        </p>
        <p className="text-xs">{t.contact.footerNote}</p>
      </footer>
    </section>
  );
}
