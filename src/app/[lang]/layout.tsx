import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, Space_Grotesk } from "next/font/google";
import "../globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { personal } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import { getTranslation, isLang, LANGS, type Lang } from "@/lib/i18n";
import { localePath } from "@/lib/routes";
import { Providers } from "@/components/Providers";

const inter = Inter({
  variable: "--font-sans-custom",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

type Params = { lang: string };

// Her dil için ayrı statik sayfa üretilir; böylece İngilizce içerik de
// sunucuda render edilip arama motorlarına görünür olur.
export function generateStaticParams(): Params[] {
  return LANGS.map((lang) => ({ lang }));
}

/** Diller arası hreflang eşlemesi. x-default varsayılan dile işaret eder. */
function languageAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const lang of LANGS) {
    alternates[lang] = localePath(lang, path);
  }
  alternates["x-default"] = localePath("tr", path);
  return alternates;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  const t = getTranslation(lang);
  const title = `${personal.name} — ${t.meta.title}`;
  const description = t.meta.description;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s — ${personal.name}`,
    },
    description,
    applicationName: `${personal.name} Portfolio`,
    authors: [{ name: personal.name, url: SITE_URL }],
    creator: personal.name,
    publisher: personal.name,
    keywords: [
      "Yusuf Koşar",
      "Full Stack Developer",
      "Frontend Developer",
      "React",
      "Next.js",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Prisma",
      "Tailwind CSS",
      "Web Developer",
      "Yazılım Geliştirici",
      "Portfolio",
    ],
    alternates: {
      canonical: localePath(lang),
      languages: languageAlternates("/"),
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${SITE_URL}${localePath(lang)}`,
      siteName: `${personal.name} — Portfolio`,
      locale: lang === "tr" ? "tr_TR" : "en_US",
      alternateLocale: lang === "tr" ? ["en_US"] : ["tr_TR"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
  };
}

// Hidrasyondan önce tema tercihini uygula (flash önleme). Dil artık adresten
// geldiği için burada yalnızca tema var.
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    document.documentElement.dataset.theme = stored === 'light' ? 'light' : 'dark';
  } catch (e) {
    document.documentElement.dataset.theme = 'dark';
  }
})();
`;

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<Params>;
}>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <html
      lang={lang}
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">
        <Providers lang={lang as Lang}>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
