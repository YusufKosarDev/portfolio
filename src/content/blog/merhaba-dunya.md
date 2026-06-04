---
title: Bu Portföyü Nasıl Geliştirdim?
date: 2026-06-04
excerpt: Next.js 16, App Router ve Tailwind CSS ile koyu/açık tema, çift dil ve mikro animasyonlar içeren bir portfolio sitesi kurma notları.
tags: Next.js, TypeScript, Tailwind
---

Merhaba! Bu, blogun ilk yazısı ve aynı zamanda bir **yer tutucu** (placeholder).
Buradaki amaç, blog altyapısının uçtan uca çalıştığını göstermek.

## Neden basit bir altyapı?

Karmaşık bir CMS yerine, dosya tabanlı bir markdown sistemi tercih ettim:

- Her yazı `src/content/blog/` altında bir `.md` dosyası
- Frontmatter ile başlık, tarih, özet ve etiketler
- Build sırasında statik olarak üretilir — hızlı ve ücretsiz

## Kod örneği

```ts
export function topla(a: number, b: number): number {
  return a + b;
}
```

## Sırada ne var?

Yeni bir yazı eklemek için tek yapman gereken bu klasöre yeni bir `.md`
dosyası bırakmak. Liste ve detay sayfaları otomatik güncellenir.

> Okuduğun için teşekkürler — yakında gerçek içeriklerle döneceğim.
