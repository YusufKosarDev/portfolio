import "server-only";
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { DEFAULT_LANG, type Lang } from "@/lib/i18n";

// Basit, dosya tabanlı blog altyapısı. Yeni yazı = bu klasöre her dil için bir
// .md dosyası. Karmaşık CMS yok; frontmatter + markdown yeterli ve genişletilebilir.
//
// Dosya adı `<slug>.<dil>.md` biçiminde: aynı slug tüm dillerde ortaktır, böylece
// "/blog/x" ile "/en/blog/x" birbirinin karşılığıdır ve hreflang eşlemesi için
// ek bir tabloya gerek kalmaz.
const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");

/** Slug'ın dosya adında güvenle kullanılabilecek biçimi. */
const SLUG_RE = /^[a-z0-9-]+$/;

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

function readPostFile(slug: string, lang: Lang): Post | null {
  // Slug rota parametresinden geliyor ve doğrudan dosya yoluna giriyor.
  // Beyaz liste, dizin dışına çıkan ("../") ya da normalize edildiğinde blog
  // klasörüne geri dönen yolları daha okuma denenmeden eler.
  if (!SLUG_RE.test(slug)) return null;

  const filePath = path.join(BLOG_DIR, `${slug}.${lang}.md`);
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

/**
 * Yazı slug'ları. Varsayılan dilin dosyaları kaynak alınır; bir yazının her
 * dilde bulunması zorunlu olduğu için (bkz. blog testleri) bu liste tüm
 * diller için geçerlidir.
 */
export function getPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const suffix = `.${DEFAULT_LANG}.md`;
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(suffix))
    .map((f) => f.slice(0, -suffix.length));
}

/** Verilen dildeki tüm yazıların metası, tarihe göre yeniden eskiye sıralı. */
export function getAllPostsMeta(lang: Lang): PostMeta[] {
  return getPostSlugs()
    .map((slug) => readPostFile(slug, lang))
    .filter((p): p is Post => p !== null)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ html, ...meta }) => meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string, lang: Lang): Post | null {
  return readPostFile(slug, lang);
}
