import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
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

const title = `${personal.name} — Full Stack Developer`;
const description =
  "Production-grade web uygulamaları geliştiren full-stack developer.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
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
      </body>
    </html>
  );
}
