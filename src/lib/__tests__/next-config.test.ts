import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";

/**
 * Next'in yol desenini kaba bir regex'e çevirir: `:slug` tek segment,
 * `:path*` sıfır veya daha fazla segment. Bir redirect'in hangi adresleri
 * yakaladığını test edebilmek için yeterli.
 */
function toMatcher(source: string): RegExp {
  const pattern = source
    .replace(/:[a-zA-Z]+\*/g, ".*")
    .replace(/:[a-zA-Z]+/g, "[^/]+");
  return new RegExp(`^${pattern}$`);
}

async function getRewrites() {
  const result = await nextConfig.rewrites!();
  return Array.isArray(result) ? result : (result.beforeFiles ?? []);
}

async function getRedirects() {
  return nextConfig.redirects!();
}

describe("dil öneki yönlendirmeleri", () => {
  it("çıplak adrese rewrite edilen her yolun ters yönde kalıcı redirect'i var", async () => {
    // Rewrite "/blog" adresini dahili "/tr/blog" hedefine bağlıyor. Ters yön
    // olmazsa "/tr/blog" da doğrudan servis edilir ve aynı sayfa iki adreste
    // yaşar. Yeni bir rewrite eklenip redirect'i unutulursa burası kırılır.
    const redirects = await getRedirects();

    for (const rewrite of await getRewrites()) {
      const back = redirects.find(
        (redirect) =>
          redirect.source === rewrite.destination &&
          redirect.destination === rewrite.source
      );

      expect(
        back,
        `${rewrite.destination} -> ${rewrite.source} yönlendirmesi yok`
      ).toBeDefined();
      expect(
        back?.permanent,
        `${rewrite.destination} yönlendirmesi kalıcı değil`
      ).toBe(true);
    }
  });

  it("yönlendirmeler dil önekli görsel rotalarını yutmuyor", async () => {
    // Sayfaların og:image etiketi "/tr/opengraph-image" adresini gösteriyor ve
    // bu rotanın çıplak karşılığı yok. "/tr/:path*" gibi toptan bir desen
    // sosyal medya önizlemesini 404'e düşürürdü.
    const imageRoutes = ["/tr/opengraph-image", "/tr/twitter-image"];

    for (const redirect of await getRedirects()) {
      const matcher = toMatcher(redirect.source);
      for (const route of imageRoutes) {
        expect(
          matcher.test(route),
          `${redirect.source} deseni ${route} adresini yakalıyor`
        ).toBe(false);
      }
    }
  });
});
