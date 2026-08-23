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
};

export default nextConfig;
