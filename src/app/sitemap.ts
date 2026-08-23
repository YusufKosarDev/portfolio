import type { MetadataRoute } from "next";
import { getAllPostsMeta } from "@/lib/blog";
import { LANGS } from "@/lib/i18n";
import { localePath } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";

/** Bir yolun tüm dillerdeki mutlak adresleri (hreflang alternates için). */
function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const lang of LANGS) {
    languages[lang] = `${SITE_URL}${localePath(lang, path)}`;
  }
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Yalnızca kanonik adresler listelenir. Rewrite'ın dahili hedefi olan "/tr"
  // sitemap'e girmez; canonical etiketi zaten "/" adresini işaret ediyor.
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}${localePath("tr", "/")}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages: languageAlternates("/") },
    },
    {
      url: `${SITE_URL}${localePath("en", "/")}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: { languages: languageAlternates("/") },
    },
    {
      url: `${SITE_URL}${localePath("tr", "/blog")}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: { languages: languageAlternates("/blog") },
    },
    {
      url: `${SITE_URL}${localePath("en", "/blog")}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: { languages: languageAlternates("/blog") },
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = getAllPostsMeta().flatMap((post) => {
    const path = `/blog/${post.slug}`;
    return LANGS.map((lang) => ({
      url: `${SITE_URL}${localePath(lang, path)}`,
      lastModified: new Date(post.date),
      changeFrequency: "yearly" as const,
      priority: lang === "tr" ? 0.6 : 0.5,
      alternates: { languages: languageAlternates(path) },
    }));
  });

  return [...staticRoutes, ...postRoutes];
}
