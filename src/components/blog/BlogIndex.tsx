"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { PostMeta } from "@/lib/blog";
import { useApp } from "@/components/Providers";
import { Reveal } from "@/components/Reveal";
import { BlogTopBar, useFormattedDate } from "@/components/blog/BlogTopBar";
import { ArrowUpRightIcon } from "@/components/icons";

function PostCard({ post, index }: { post: PostMeta; index: number }) {
  const { t } = useApp();
  const date = useFormattedDate(post.date);

  return (
    <Reveal delay={index * 0.06}>
      <Link href={`/blog/${post.slug}`}>
        <motion.article
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-card p-7 transition-colors hover:border-accent-to/30"
        >
          <div className="flex items-center gap-3 text-xs text-muted">
            <span>{date}</span>
            <span className="text-muted/40">·</span>
            <span>
              {post.readingMinutes} {t.blog.readingSuffix}
            </span>
          </div>

          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight transition-colors group-hover:text-accent-to">
            {post.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {post.excerpt}
          </p>

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

          <ArrowUpRightIcon
            width={18}
            height={18}
            className="absolute right-6 top-6 text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-to"
          />
        </motion.article>
      </Link>
    </Reveal>
  );
}

export function BlogIndex({ posts }: { posts: PostMeta[] }) {
  const { t } = useApp();

  return (
    <>
      <BlogTopBar to="/" label={t.blog.backHome} />
      <main className="relative mx-auto max-w-3xl px-6 pb-24 pt-32 sm:pt-36">
        <Reveal>
          <span className="mb-3 inline-block font-mono text-xs font-semibold uppercase tracking-[0.3em] text-accent-to/90">
            {t.blog.nav}
          </span>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {t.blog.title}
          </h1>
          <p className="mt-4 max-w-xl text-muted">{t.blog.description}</p>
        </Reveal>

        <div className="mt-12 grid gap-5">
          {posts.length === 0 ? (
            <p className="text-muted">{t.blog.empty}</p>
          ) : (
            posts.map((post, i) => (
              <PostCard key={post.slug} post={post} index={i} />
            ))
          )}
        </div>
      </main>
    </>
  );
}
