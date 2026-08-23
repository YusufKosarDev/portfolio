import { describe, expect, it } from "vitest";
import { getAllPostsMeta, getPostBySlug, getPostSlugs } from "@/lib/blog";

describe("blog dosya sistemi katmanı", () => {
  it("içerik dizininde en az bir yazı var", () => {
    expect(getPostSlugs().length).toBeGreaterThan(0);
  });

  it("her yazının frontmatter'ı ayrıştırılabiliyor", () => {
    for (const slug of getPostSlugs()) {
      const post = getPostBySlug(slug);

      expect(post, `${slug} okunamadı`).not.toBeNull();
      if (!post) continue;

      expect(post.slug).toBe(slug);
      expect(post.title.trim().length, `${slug} başlıksız`).toBeGreaterThan(0);
      // Sitemap tarihi bu alandan üretiyor; geçersiz tarih sessizce bozar.
      expect(Number.isNaN(Date.parse(post.date)), `${slug} tarihi geçersiz`).toBe(false);
      expect(post.readingMinutes).toBeGreaterThanOrEqual(1);
      expect(post.html.trim().length, `${slug} içeriği boş`).toBeGreaterThan(0);
    }
  });

  it("markdown HTML'e dönüştürülüyor", () => {
    const [slug] = getPostSlugs();
    const post = getPostBySlug(slug);

    expect(post?.html).toMatch(/<(p|h2|h3|ul|ol|pre)\b/);
  });

  it("olmayan slug için null döner", () => {
    expect(getPostBySlug("boyle-bir-yazi-yok")).toBeNull();
  });

  it("dizin dışına çıkmaya çalışan slug'ı okumaz", () => {
    // Rota parametresi doğrudan dosya yoluna giriyor; dizin dışına
    // çıkılamadığını sabitliyoruz.
    expect(getPostBySlug("../../package")).toBeNull();
    expect(getPostBySlug("../../../etc/passwd")).toBeNull();
  });

  it("liste tarihe göre yeniden eskiye sıralı", () => {
    const dates = getAllPostsMeta().map((post) => post.date);
    const sorted = [...dates].sort((a, b) => (a < b ? 1 : -1));

    expect(dates).toEqual(sorted);
  });

  it("liste metası html taşımıyor", () => {
    // getAllPostsMeta bilerek html alanını düşürüyor; blog indeksine tüm
    // yazıların gövdesini göndermemek için.
    for (const meta of getAllPostsMeta()) {
      expect(meta).not.toHaveProperty("html");
    }
  });
});
