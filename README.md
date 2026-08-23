# Personal Portfolio Website

> Yusuf Koşar's personal portfolio — a cinematic, animated, multilingual single‑page site with dark/light theming.

### 🔗 [**Live Demo → yusufkosar.vercel.app**](https://yusufkosar.vercel.app)

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img alt="Framer Motion" src="https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=white" />
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

---

## ✨ Features

- 🎬 **Cinematic dark theme** with a polished **light theme** toggle — preference is remembered in `localStorage` (no flash on reload).
- 🌍 **Multilingual (TR / EN)** — each language is a real route (`/` and `/en`) with `hreflang` alternates and its own metadata, so both versions are indexable. All copy lives in a single typed dictionary.
- 📝 **File-based blog** — markdown + frontmatter, one file per language (`<slug>.<lang>.md`), statically generated at build time. No CMS.
- 🎞️ **Framer Motion** scroll & entrance animations, a top **scroll‑progress bar**, and a **scroll‑spy navbar** that highlights the active section.
- 🪄 **Cursor‑tracking spotlight cards** in the Projects section that come alive on hover.
- 📬 **Working contact form** with real email delivery via **Resend**, plus **client‑ and server‑side validation** and success/error states.
- 📱 **Fully responsive**, honors **`prefers-reduced-motion`**, and ships with **SEO meta tags**, a sitemap, and a dynamically rendered **Open Graph image**.
- ✅ **Tested and CI-checked** — Vitest suites cover data consistency, TR/EN dictionary parity, contact validation and the blog loader; GitHub Actions runs lint, typecheck, tests and a production build on every push.

---

## 🛠️ Tech Stack

| Category        | Technologies                                      |
| --------------- | ------------------------------------------------- |
| **Framework**   | Next.js 16 (App Router), React 19, TypeScript     |
| **Styling**     | Tailwind CSS v4, Framer Motion                    |
| **Content**     | Markdown + frontmatter (`marked`)                 |
| **Email**       | Resend                                            |
| **Testing**     | Vitest, GitHub Actions                            |
| **Deployment**  | Vercel                                            |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.9+ (required by Next.js 16; CI runs on Node 24)
- A free [Resend](https://resend.com) account & API key (only needed for the contact form)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Create your local environment file from the example
cp .env.example .env.local
```

Open `.env.local` and add your Resend API key:

```env
RESEND_API_KEY=re_your_api_key_here
```

> 💡 Without a verified domain, Resend's test sender (`onboarding@resend.dev`) can only deliver to the email address that owns the Resend account. Sign up with the address where you want to receive messages.

### Development

```bash
# Start the dev server → http://localhost:3000
npm run dev
```

### Production

```bash
# Create an optimized production build
npm run build

# Run the production server
npm run start
```

### Scripts

| Script                | What it does                                                        |
| --------------------- | ------------------------------------------------------------------- |
| `npm run dev`         | Start the dev server on `http://localhost:3000`                      |
| `npm run build`       | Production build                                                     |
| `npm run start`       | Serve the production build                                           |
| `npm run lint`        | ESLint                                                               |
| `npm run typecheck`   | `tsc --noEmit`                                                       |
| `npm test`            | Vitest suites                                                        |
| `npm run screenshots` | Re-capture project card thumbnails into `public/projects/` — run it after adding a project or when a linked site is redesigned |

---

## 📁 Project Structure

```
portfolyo/
├── .github/workflows/           # CI: lint → typecheck → test → build
├── scripts/
│   └── capture-screenshots.mts  # Generates the project card thumbnails
├── test/stubs/                  # `server-only` stub for the node test env
├── public/
│   ├── projects/                # Card thumbnails & the Pulse demo video
│   └── Yusuf_Kosar_*.pdf        # CV (TR) and résumé (EN)
└── src/
    ├── app/
    │   ├── [lang]/              # Locale-scoped routes — "tr" is served bare, "en" is prefixed
    │   │   ├── layout.tsx       # Fonts, per-language metadata, theme bootstrap
    │   │   ├── page.tsx         # Single-page composition of all sections
    │   │   ├── blog/            # Blog index + [slug] detail pages
    │   │   └── opengraph-image.tsx, twitter-image.tsx
    │   ├── api/contact/         # Contact form route handler (Resend)
    │   ├── globals.css          # Theme tokens, animations, utilities
    │   ├── robots.ts
    │   └── sitemap.ts           # Canonical URLs + hreflang alternates
    ├── components/
    │   ├── sections/            # Hero, About, Skills, Projects, Experience, Contact
    │   ├── blog/                # BlogIndex, BlogPost, BlogTopBar
    │   ├── Providers.tsx        # Theme + language context
    │   ├── Navbar.tsx           # Scroll-spy nav + theme & language toggles
    │   ├── ContactForm.tsx      # Validated contact form
    │   └── ...                  # ScrollProgress, Reveal, ProjectThumbnail, icons
    ├── content/blog/            # Markdown posts — `<slug>.<lang>.md`
    └── lib/
        ├── data.ts              # Links, skills, projects, certificates
        ├── i18n.ts              # TR/EN translations
        ├── blog.ts              # Frontmatter + markdown loader
        ├── contact.ts           # Validation, honeypot, rate limiting
        ├── routes.ts            # Locale path helpers
        └── __tests__/           # Vitest suites
```

> Turkish is the default language and is served on bare URLs (`/`, `/blog`) via a rewrite, so links printed on a CV keep working. English lives under `/en`. See [`src/lib/routes.ts`](src/lib/routes.ts).

---

## 📝 Customization

All content is centralized for easy editing — no need to touch the components:

- **Texts & translations** → [`src/lib/i18n.ts`](src/lib/i18n.ts) (edit both the `tr` and `en` dictionaries to keep them in sync — the tests fail if they drift apart)
- **Projects, links & certificates** → [`src/lib/data.ts`](src/lib/data.ts) (after adding a project with a live URL, run `npm run screenshots` to generate its card thumbnail)
- **Blog posts** → drop `<slug>.tr.md` **and** `<slug>.en.md` into [`src/content/blog/`](src/content/blog). Both languages are required — leaving one out fails the test suite. Frontmatter fields: `title`, `date`, `excerpt`, `tags`.

Environment variables are documented in [`.env.example`](.env.example) — `RESEND_API_KEY` is the only required one; `CONTACT_FROM` and `CONTACT_TO` fall back to sensible defaults.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with Next.js · TypeScript · Tailwind CSS · Framer Motion</p>
