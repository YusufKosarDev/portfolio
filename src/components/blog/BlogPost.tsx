"use client";

import type { Post } from "@/lib/blog";
import { useApp } from "@/components/Providers";
import { Reveal } from "@/components/Reveal";
import { BlogTopBar, useFormattedDate } from "@/components/blog/BlogTopBar";
import { localePath } from "@/lib/routes";

export function BlogPost({ post }: { post: Post }) {
  const { t, lang } = useApp();
  const date = useFormattedDate(post.date);

  return (
    <>
      <BlogTopBar to={localePath(lang, "/blog")} label={t.blog.backList} />
      <main className="relative mx-auto max-w-2xl px-6 pb-24 pt-32 sm:pt-36">
        <Reveal>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span>{date}</span>
            <span className="text-muted/40">·</span>
            <span>
              {post.readingMinutes} {t.blog.readingSuffix}
            </span>
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {post.title}
          </h1>

          {post.tags.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md border border-border-subtle bg-foreground/[0.02] px-2.5 py-1 text-xs font-medium text-foreground/75"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <article
            className="prose-portfolio mt-10"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </Reveal>
      </main>
    </>
  );
}
