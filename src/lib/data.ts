// Çevrilemeyen veriler (linkler, teknoloji adları, sertifikalar) burada.
// Çevrilebilir tüm UI metinleri için bkz: src/lib/i18n.ts

export const personal = {
  name: "Yusuf Koşar",
  email: "yusufkosare004@gmail.com",
  linkedin: "https://linkedin.com/in/yusufkosar",
  github: "https://github.com/YusufKosarDev",
} as const;

export const highlights = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Prisma",
] as const;

export type SkillCategory = {
  /** i18n başlık anahtarı */
  key: "frontend" | "backend" | "database" | "tools";
  skills: string[];
};

export const skillCategories: SkillCategory[] = [
  {
    key: "frontend",
    skills: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Tailwind CSS",
      "Framer Motion",
      "Redux",
    ],
  },
  {
    key: "backend",
    skills: ["Node.js", "Express", "Prisma", "REST API", "JWT", "OAuth"],
  },
  {
    key: "database",
    skills: ["PostgreSQL", "Supabase", "Convex"],
  },
  {
    key: "tools",
    skills: ["Git", "Docker", "GitHub Actions", "Vitest", "Playwright", "Cypress"],
  },
];

/** Çevrilebilir metinler (subtitle/description) i18n'de id ile eşleşir. */
export type Project = {
  id: "subtrack" | "garajim" | "ciftlikpro" | "patidefteri";
  name: string;
  stack: string[];
  live: string;
  github: string;
};

/**
 * Microlink.io ile canlı siteden otomatik ekran görüntüsü URL'i üretir.
 * `embed=screenshot.url` parametresi doğrudan görsele 302 yönlendirir,
 * böylece <img src> içinde kullanılabilir (manuel görsel yüklemeye gerek yok).
 */
export function projectScreenshot(siteUrl: string): string {
  const params = new URLSearchParams({
    url: siteUrl,
    screenshot: "true",
    embed: "screenshot.url",
    meta: "false",
    "viewport.width": "1280",
    "viewport.height": "800",
    "viewport.deviceScaleFactor": "2",
    waitUntil: "networkidle2",
    colorScheme: "dark",
  });
  return `https://api.microlink.io/?${params.toString()}`;
}

export const projects: Project[] = [
  {
    id: "subtrack",
    name: "SubTrack",
    stack: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Prisma"],
    live: "https://subtrack-psi-nine.vercel.app",
    github: "https://github.com/YusufKosarDev/subtrack",
  },
  {
    id: "garajim",
    name: "Garajım",
    stack: ["React", "Supabase", "PostgreSQL"],
    live: "https://garajim-sage.vercel.app",
    github: "https://github.com/YusufKosarDev/garajim",
  },
  {
    id: "ciftlikpro",
    name: "Çiftlik Pro",
    stack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Auth.js"],
    live: "https://ciftlik-pro.vercel.app",
    github: "https://github.com/YusufKosarDev/ciftlik-pro",
  },
  {
    id: "patidefteri",
    name: "Pati Defteri",
    stack: ["React", "TypeScript", "Convex", "PWA"],
    live: "https://pati-defteri.vercel.app",
    github: "https://github.com/YusufKosarDev/pati-defteri",
  },
];

/** Çevrilebilir metinler (title/org/description) i18n'de id ile eşleşir. */
export type TimelineItem = {
  id: "uopeople" | "workintech";
};

export const timeline: TimelineItem[] = [
  { id: "uopeople" },
  { id: "workintech" },
];

/** Sertifikalar — başlık ve kurum dilden bağımsız (özel ad). */
export const certificates = [
  { title: "Frontend Developer (React)", org: "HackerRank" },
  { title: "React (Basic)", org: "HackerRank" },
  { title: "JavaScript (Basic)", org: "HackerRank" },
  { title: "IELTS Academic", org: "6.0" },
  { title: "AI for Beginners", org: "HP" },
  { title: "B1 English for Developers", org: "freeCodeCamp" },
];

export const sectionIds = [
  "hero",
  "about",
  "skills",
  "projects",
  "experience",
  "contact",
] as const;

export type SectionId = (typeof sectionIds)[number];
