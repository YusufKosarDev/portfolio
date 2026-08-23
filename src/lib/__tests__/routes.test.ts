import { describe, expect, it } from "vitest";
import { localePath, stripLocale } from "@/lib/routes";
import { LANGS } from "@/lib/i18n";

describe("stripLocale", () => {
  it("İngilizce önekini kaldırır", () => {
    expect(stripLocale("/en")).toBe("/");
    expect(stripLocale("/en/blog")).toBe("/blog");
    expect(stripLocale("/en/blog/merhaba-dunya")).toBe("/blog/merhaba-dunya");
  });

  it("varsayılan dil önekini de kaldırır", () => {
    // next.config.ts'teki rewrite yüzünden usePathname() tarayıcıdaki "/blog"
    // yerine dahili hedef "/tr/blog" değerini döndürebiliyor. Bu soyulmazsa dil
    // düğmesi "/en/tr" gibi var olmayan adresler üretir.
    expect(stripLocale("/tr")).toBe("/");
    expect(stripLocale("/tr/blog")).toBe("/blog");
    expect(stripLocale("/tr/blog/merhaba-dunya")).toBe("/blog/merhaba-dunya");
  });

  it("öneksiz yolları olduğu gibi bırakır", () => {
    expect(stripLocale("/")).toBe("/");
    expect(stripLocale("/blog")).toBe("/blog");
    expect(stripLocale("/blog/merhaba-dunya")).toBe("/blog/merhaba-dunya");
  });

  it("dil koduyla başlayan ama dil olmayan yolları bozmaz", () => {
    expect(stripLocale("/entegrasyon")).toBe("/entegrasyon");
    expect(stripLocale("/transkript")).toBe("/transkript");
  });

  it("boş girdide köke düşer", () => {
    expect(stripLocale("")).toBe("/");
  });
});

describe("localePath", () => {
  it("Türkçe için çıplak adres üretir", () => {
    expect(localePath("tr", "/")).toBe("/");
    expect(localePath("tr", "/blog")).toBe("/blog");
    expect(localePath("tr")).toBe("/");
  });

  it("İngilizce için /en öneki ekler", () => {
    expect(localePath("en", "/")).toBe("/en");
    expect(localePath("en", "/blog")).toBe("/en/blog");
    expect(localePath("en", "/blog/merhaba-dunya")).toBe("/en/blog/merhaba-dunya");
  });

  it("zaten önekli yolu tekrar öneklemez", () => {
    expect(localePath("en", "/en/blog")).toBe("/en/blog");
    expect(localePath("tr", "/tr/blog")).toBe("/blog");
    expect(localePath("en", "/tr/blog")).toBe("/en/blog");
    expect(localePath("tr", "/en/blog")).toBe("/blog");
  });

  it("her dil için sonuç idempotent", () => {
    for (const lang of LANGS) {
      for (const path of ["/", "/blog", "/blog/merhaba-dunya"]) {
        const once = localePath(lang, path);
        expect(localePath(lang, once), `${lang} ${path}`).toBe(once);
      }
    }
  });

  it("hiçbir dil için çift dil önekli adres üretmez", () => {
    for (const from of LANGS) {
      for (const to of LANGS) {
        for (const path of ["/", "/blog"]) {
          const source = localePath(from, path);
          const target = localePath(to, source);
          expect(target, `${source} -> ${to}`).not.toMatch(/^\/(tr|en)\/(tr|en)\b/);
        }
      }
    }
  });
});
