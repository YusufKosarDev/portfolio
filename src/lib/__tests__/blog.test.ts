import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getAllPostsMeta, getPostBySlug, getPostSlugs } from "@/lib/blog";
import { LANGS } from "@/lib/i18n";

const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");

describe("blog dosya sistemi katmanı", () => {
  it("içerik dizininde en az bir yazı var", () => {
    expect(getPostSlugs().length).toBeGreaterThan(0);
  });

  it("her yazının frontmatter'ı her dilde ayrıştırılabiliyor", () => {
    for (const slug of getPostSlugs()) {
      for (const lang of LANGS) {
        const post = getPostBySlug(slug, lang);

        expect(post, `${slug}.${lang} okunamadı`).not.toBeNull();
        if (!post) continue;

        expect(post.slug).toBe(slug);
        expect(post.title.trim().length, `${slug}.${lang} başlıksız`).toBeGreaterThan(0);
        // Sitemap tarihi bu alandan üretiyor; geçersiz tarih sessizce bozar.
        expect(
          Number.isNaN(Date.parse(post.date)),
          `${slug}.${lang} tarihi geçersiz`
        ).toBe(false);
        expect(post.excerpt.trim().length, `${slug}.${lang} özetsiz`).toBeGreaterThan(0);
        expect(post.readingMinutes).toBeGreaterThanOrEqual(1);
        expect(post.html.trim().length, `${slug}.${lang} içeriği boş`).toBeGreaterThan(0);
      }
    }
  });

  it("markdown HTML'e dönüştürülüyor", () => {
    const [slug] = getPostSlugs();
    const post = getPostBySlug(slug, "tr");

    expect(post?.html).toMatch(/<(p|h2|h3|ul|ol|pre)\b/);
  });

  it("olmayan slug için null döner", () => {
    expect(getPostBySlug("boyle-bir-yazi-yok", "tr")).toBeNull();
  });

  it("dizin dışına çıkmaya çalışan slug'ı okumaz", () => {
    // Rota parametresi doğrudan dosya yoluna giriyor; dizin dışına
    // çıkılamadığını sabitliyoruz.
    expect(getPostBySlug("../../package", "tr")).toBeNull();
    expect(getPostBySlug("../../../etc/passwd", "tr")).toBeNull();
  });

  it("liste tarihe göre yeniden eskiye sıralı", () => {
    for (const lang of LANGS) {
      const dates = getAllPostsMeta(lang).map((post) => post.date);
      const sorted = [...dates].sort((a, b) => (a < b ? 1 : -1));

      expect(dates, `${lang} listesi sıralı değil`).toEqual(sorted);
    }
  });

  it("liste metası html taşımıyor", () => {
    // getAllPostsMeta bilerek html alanını düşürüyor; blog indeksine tüm
    // yazıların gövdesini göndermemek için.
    for (const lang of LANGS) {
      for (const meta of getAllPostsMeta(lang)) {
        expect(meta).not.toHaveProperty("html");
      }
    }
  });
});

describe("dile duyarlı içerik", () => {
  it("her yazının her dilde bir dosyası var", () => {
    // Yazı dosyaları `<slug>.<lang>.md` biçiminde. Bir dil eksikse o dilin
    // rotası ya boş kalır ya da başka dilin metnini servis eder — bu testin
    // yakaladığı şey tam olarak o sessiz boşluk.
    for (const slug of getPostSlugs()) {
      for (const lang of LANGS) {
        const file = path.join(BLOG_DIR, `${slug}.${lang}.md`);
        expect(fs.existsSync(file), `eksik çeviri: ${slug}.${lang}.md`).toBe(true);
      }
    }
  });

  it("her dil kendi metnini döndürür", () => {
    // Asıl hata buydu: /en/blog/<slug> İngilizce çerçeveyle Türkçe gövde
    // gösteriyordu. İki dilin gövdesi aynıysa çeviri gerçekten yapılmamıştır.
    for (const slug of getPostSlugs()) {
      const tr = getPostBySlug(slug, "tr");
      const en = getPostBySlug(slug, "en");

      expect(tr, `${slug} tr okunamadı`).not.toBeNull();
      expect(en, `${slug} en okunamadı`).not.toBeNull();
      expect(en?.html, `${slug} için en gövdesi tr ile aynı`).not.toBe(tr?.html);
      expect(en?.title, `${slug} için en başlığı tr ile aynı`).not.toBe(tr?.title);
    }
  });

  it("bir yazının tarihi diller arasında aynı", () => {
    // sitemap `lastModified` alanını her dil için kendi dosyasından okuyor;
    // tarihler ayrışırsa aynı yazı iki farklı tarihle ilan edilir.
    for (const slug of getPostSlugs()) {
      const dates = LANGS.map((lang) => getPostBySlug(slug, lang)?.date);
      expect(new Set(dates).size, `${slug} tarihleri ayrışmış: ${dates.join(", ")}`).toBe(1);
    }
  });

  it("dizin dışına çıkıp geri dönen slug'ı okumaz", () => {
    // Bu yol normalize edildiğinde blog dizinine geri döner ve gerçek dosyaya
    // denk gelir; yalnızca "o yolda dosya yok" savunması bunu durduramaz.
    expect(getPostBySlug("../blog/merhaba-dunya", "tr")).toBeNull();
  });
});
