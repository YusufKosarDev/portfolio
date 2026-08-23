---
title: How I Built This Portfolio
date: 2026-06-04
excerpt: Notes on building a portfolio site with Next.js 16, the App Router and Tailwind CSS — dark/light theming, two languages and micro-animations.
tags: Next.js, TypeScript, Tailwind
---

Hello! This is the blog's first post, and also a **placeholder**.
The point of it is to show that the blog pipeline works end to end.

## Why such a simple setup?

Instead of a complex CMS, I went with a file-based markdown system:

- Every post is a `<slug>.<lang>.md` file under `src/content/blog/` — one per language
- Title, date, excerpt and tags come from frontmatter
- Pages are generated statically at build time — fast and free

## A code sample

```ts
export function add(a: number, b: number): number {
  return a + b;
}
```

## What's next?

To add a new post, drop a `post-name.tr.md` and a `post-name.en.md` into that
folder. The index and detail pages update themselves — and if one language is
missing, the tests will tell you.

> Thanks for reading — I'll be back with real content soon.
