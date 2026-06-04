import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { personal } from "@/lib/data";
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

const SITE_URL = "https://yusufkosar.vercel.app";
const title = `${personal.name} — Full Stack Developer`;
const description =
  "Full Stack Developer Yusuf Koşar — React, Next.js, TypeScript, Node.js ve PostgreSQL ile production-grade web uygulamaları. | Full Stack Developer building production-grade web apps.";

export const metadata: Metadata = {
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
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: SITE_URL,
    siteName: `${personal.name} — Portfolio`,
    locale: "tr_TR",
    alternateLocale: ["en_US"],
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

// Hidrasyondan önce tema/dil tercihini uygula (flash önleme).
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light') document.documentElement.classList.add('light');
    var l = localStorage.getItem('lang');
    if (l === 'tr' || l === 'en') document.documentElement.lang = l;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
