import "server-only";
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

// Basit, dosya tabanlı blog altyapısı. Yeni yazı = bu klasöre yeni .md dosyası.
// Karmaşık CMS yok; frontmatter + markdown yeterli ve genişletilebilir.
const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  readingMinutes: number;
};

export type Post = PostMeta & {
  /** Markdown'dan üretilmiş güvenli HTML */
  html: string;
};

/**
 * Minimal frontmatter ayrıştırıcı: dosyanın başındaki `---` blokunu
 * `key: value` satırları olarak okur. Harici bağımlılık gerektirmez.
 */
function parseFrontmatter(raw: string): {
  data: Record<string, string>;
  content: string;
} {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const data: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) data[key] = value;
  }
  return { data, content: match[2] };
}

function estimateReadingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function readPostFile(slug: string): Post | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = parseFrontmatter(raw);
  const html = marked.parse(content, { async: false }) as string;

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "",
    excerpt: data.excerpt ?? "",
    tags: data.tags
      ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [],
    readingMinutes: estimateReadingMinutes(content),
    html,
  };
}

/** Tüm yazıların metası, tarihe göre yeniden eskiye sıralı. */
export function getAllPostsMeta(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => readPostFile(f.replace(/\.md$/, "")))
    .filter((p): p is Post => p !== null)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ html, ...meta }) => meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getPostBySlug(slug: string): Post | null {
  return readPostFile(slug);
}
