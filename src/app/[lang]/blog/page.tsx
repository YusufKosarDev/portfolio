import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPostsMeta } from "@/lib/blog";
import { getTranslation, isLang, LANGS } from "@/lib/i18n";
import { localePath } from "@/lib/routes";
import { BlogIndex } from "@/components/blog/BlogIndex";

type Params = { lang: string };

export function generateStaticParams(): Params[] {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  const t = getTranslation(lang);
  const languages: Record<string, string> = {};
  for (const l of LANGS) languages[l] = localePath(l, "/blog");
  languages["x-default"] = localePath("tr", "/blog");

  return {
    title: t.blog.title,
    description: t.blog.description,
    alternates: { canonical: localePath(lang, "/blog"), languages },
  };
}

export default async function BlogPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return <BlogIndex posts={getAllPostsMeta()} />;
}
