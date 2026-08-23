import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getPostSlugs } from "@/lib/blog";
import { isLang, LANGS } from "@/lib/i18n";
import { localePath } from "@/lib/routes";
import { BlogPost } from "@/components/blog/BlogPost";

type Params = { lang: string; slug: string };

export function generateStaticParams(): Params[] {
  return LANGS.flatMap((lang) => getPostSlugs().map((slug) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};

  const post = getPostBySlug(slug);
  if (!post) return { title: "Blog" };

  const path = `/blog/${slug}`;
  const languages: Record<string, string> = {};
  for (const l of LANGS) languages[l] = localePath(l, path);
  languages["x-default"] = localePath("tr", path);

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: localePath(lang, path), languages },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date || undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();

  const post = getPostBySlug(slug);
  if (!post) notFound();

  return <BlogPost post={post} />;
}
