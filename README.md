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
- 🌍 **Multilingual (TR / EN)** support with a language switch; all copy lives in a single typed dictionary.
- 🎞️ **Framer Motion** scroll & entrance animations, a top **scroll‑progress bar**, and a **scroll‑spy navbar** that highlights the active section.
- 🪄 **Cursor‑tracking spotlight cards** in the Projects section that come alive on hover.
- 📬 **Working contact form** with real email delivery via **Resend**, plus **client‑ and server‑side validation** and success/error states.
- 📱 **Fully responsive**, honors **`prefers-reduced-motion`**, and ships with **SEO meta tags** (Open Graph included).

---

## 🛠️ Tech Stack

| Category        | Technologies                                      |
| --------------- | ------------------------------------------------- |
| **Framework**   | Next.js 16 (App Router), React 19, TypeScript     |
| **Styling**     | Tailwind CSS v4, Framer Motion                    |
| **Email**       | Resend                                            |
| **Deployment**  | Vercel                                            |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18+ (Node 20+ recommended)
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

---

## 📁 Project Structure

```
portfolyo/
├── public/                  # Static assets (favicon, etc.)
└── src/
    ├── app/
    │   ├── api/contact/      # Contact form route handler (Resend)
    │   ├── layout.tsx        # Root layout, fonts, theme/lang bootstrap
    │   ├── page.tsx          # Single-page composition of all sections
    │   └── globals.css       # Theme tokens, animations, utilities
    ├── components/
    │   ├── sections/         # Hero, About, Skills, Projects, Experience, Contact
    │   ├── Providers.tsx     # Theme + language context
    │   ├── Navbar.tsx        # Scroll-spy nav + theme & language toggles
    │   ├── ContactForm.tsx   # Validated contact form
    │   └── ...               # ScrollProgress, Reveal, icons, toggles
    └── lib/
        ├── data.ts           # Links, skills, projects, certificates
        └── i18n.ts           # TR/EN translations
```

---

## 📝 Customization

All content is centralized for easy editing — no need to touch the components:

- **Texts & translations** → [`src/lib/i18n.ts`](src/lib/i18n.ts) (edit both the `tr` and `en` dictionaries to keep them in sync)
- **Projects, links & certificates** → [`src/lib/data.ts`](src/lib/data.ts)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with Next.js · TypeScript · Tailwind CSS · Framer Motion</p>
