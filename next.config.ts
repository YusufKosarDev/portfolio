import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Türkçe varsayılan dil olduğu için çıplak adreslerde servis edilir.
  // Rewrite (redirect değil) sayesinde CV ve profillerde yazılı olan kök adres
  // değişmez; İngilizce sürüm "/en" önekiyle kendi URL'ine sahiptir.
  async rewrites() {
    return [
      { source: "/", destination: "/tr" },
      { source: "/blog", destination: "/tr/blog" },
      { source: "/blog/:slug", destination: "/tr/blog/:slug" },
    ];
  },

  // Rewrite'ın dahili hedefi olan "/tr" dışarıdan da erişilebilir durumda ve
  // çıplak adresin birebir kopyasını servis ediyor. Kalıcı yönlendirme aynı
  // sayfanın iki adreste yaşamasını bitirir.
  //
  // Bilinçli olarak "/tr/:path*" gibi toptan bir desen kullanılmıyor: sayfaların
  // og:image etiketi "/tr/opengraph-image" adresini gösteriyor ve bu rotanın
  // çıplak karşılığı yok — toptan desen sosyal medya önizlemesini 404'e düşürürdü.
  // Bu yüzden liste yukarıdaki rewrite'ların birebir aynası.
  //
  // Döngü oluşmaz: Next yönlendirmeleri gelen adrese uyguluyor, rewrite'ın
  // dahili hedefi yeniden yönlendirme aşamasından geçmiyor.
  async redirects() {
    return [
      { source: "/tr", destination: "/", permanent: true },
      { source: "/tr/blog", destination: "/blog", permanent: true },
      { source: "/tr/blog/:slug", destination: "/blog/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
