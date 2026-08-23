// Merkezi çeviri dosyası. Yeni metin eklemek/güncellemek için tek kaynak.
// Her dil aynı yapıya sahip olmalı (tip güvenliği `Translation` ile sağlanır).

export type Lang = "tr" | "en";

export const LANGS: Lang[] = ["tr", "en"];
export const DEFAULT_LANG: Lang = "tr";

const tr = {
  nav: {
    hero: "Ana Sayfa",
    about: "Hakkında",
    skills: "Yetenekler",
    projects: "Projeler",
    experience: "Deneyim",
    contact: "İletişim",
    toggleTheme: "Temayı değiştir",
    toggleLang: "Dili değiştir",
  },
  hero: {
    badge: "Yeni projelere açık",
    title: "Full Stack Developer",
    roles: [
      "Full Stack Developer",
      "React & Next.js Geliştiricisi",
      "TypeScript Meraklısı",
      "Problem Çözücü",
    ],
    tagline:
      "Production-grade web uygulamaları geliştiren full-stack developer",
    ctaProjects: "Projelerimi Gör",
    ctaContact: "İletişime Geç",
    scroll: "Kaydır",
  },
  cv: {
    download: "CV İndir",
    file: "/Yusuf_Kosar_CV.pdf",
  },
  about: {
    eyebrow: "01 — Hakkında",
    title: "Ben Kimim?",
    p1: "University of the People'da Bilgisayar Bilimleri okuyan ve Workintech Full-Stack programını tamamlayan bir full-stack developer. React, TypeScript, Node.js ve PostgreSQL ile production seviyesinde uygulamalar geliştiriyorum.",
    p2: "Temiz mimari, test edilebilirlik ve kullanıcı deneyimini önemsiyorum. Fikirden production'a; CI/CD, tip güvenliği ve ölçeklenebilir veri modelleriyle uçtan uca ürünler kuruyorum.",
    currently: {
      label: "Şu an",
      learning: "Java & Spring Boot öğreniyorum",
      available: "Staj / junior fırsatlarına açığım",
    },
    highlightsLabel: "Öne çıkan teknolojiler",
    stats: {
      projects: "Production Projesi",
      certificates: "Sertifika",
      learning: "Öğrenme İsteği",
    },
  },
  skills: {
    eyebrow: "02 — Yetenekler",
    title: "Teknoloji Yığınım",
    description:
      "Frontend'den veritabanına, test ve dağıtıma kadar uçtan uca kullandığım araçlar.",
    categories: {
      frontend: "Frontend",
      backend: "Backend",
      database: "Veritabanı",
      tools: "Araçlar",
    },
  },
  projects: {
    eyebrow: "03 — Projeler",
    title: "Seçili Çalışmalar",
    description:
      "Production'a alınmış, test edilmiş ve gerçek kullanıcı senaryolarına çözüm üreten uygulamalar.",
    live: "Canlı Demo",
    code: "Kod",
    items: {
      stacklight: {
        subtitle: "Hata Takip & Gruplama Platformu",
        description:
          "Okuma yolu yazma yolundan ayrık: dashboard veritabanına doğrudan bağlandığı için ingestion servisi uykudayken bile çalışıyor. Hatalar deterministik parmak iziyle gruplanıyor — Java ve JS stack trace normalizasyonu sürümlü tutuluyor. Üç anomali dedektörü gölge modda karşılaştırıldı, aktif dedektör ölçüm sonucuna göre değiştirildi. 320 test, altı CI iş akışı.",
      },
      localmediakit: {
        subtitle: "İçerik Üreticileri İçin Medya Kiti Platformu",
        description:
          "Yayınlanan sayfalar değişmez (immutable) snapshot olarak edge'den servis ediliyor; paylaşılan bir link backend uykudayken bile anında açılıyor. Şifre sıfırlama ucundaki timing oracle kapatıldı — gönderim outbox'a taşınarak ölçümle doğrulanmış sabit yanıt süresi sağlandı. 330 backend + 105 frontend + 13 E2E testi; ArchUnit mimari kuralları ihlalde build'i kırıyor, PIT mutation skoru %97.",
      },
      pulse: {
        subtitle: "Gerçek Zamanlı Operasyonel Telemetri & Anomali Platformu",
        description:
          "Java/Spring Boot, Python/FastAPI ve React'ten oluşan polyglot dağıtık sistem. Telemetri, Redis Streams tüketici gruplarından (XAUTOCLAIM ile hata toleransı, idempotency, DLQ) akar ve TimescaleDB hypertable'da işlenir; z-score + EWMA ile iki katmanlı anomali tespiti ve Holt-Winters ile eşik aşımını önceden öngören tahmin. SSE canlı akış, ack/resolve uyarı yaşam döngüsü, isabetini kendi ölçen tahmin karnesi ve tek komutla tam konteynerize kurulum.",
      },
      ripplechat: {
        subtitle: "Gerçek Zamanlı Topluluk Sohbet Platformu",
        description:
          "WebSocket/STOMP ile gerçek zamanlı mesajlaşma, thread'ler, reaksiyonlar ve presence. Uçtan uca şifreleme (X3DH + Double Ratchet), TOTP tabanlı 2FA, oturum/cihaz yönetimi. WebRTC ile sesli/görüntülü arama, Web Push, PWA/offline. Elasticsearch destekli arama, PostgreSQL yedeğine zarifçe düşer.",
      },
      subtrack: {
        subtitle: "Abonelik & Gider Takip Uygulaması",
        description:
          "TypeScript monorepo; aboneliklerin aylık/yıllık maliyetini çoklu para birimiyle gösterir. 2FA, Google + GitHub OAuth, sunucu taraflı JWT iptali, harcama tahmini, 53 test, Docker + GitHub Actions CI/CD.",
      },
      garajim: {
        subtitle: "Araç Bakım & MTV Takip Asistanı",
        description:
          "PostgreSQL Row Level Security üzerine multi-tenant SaaS. Gerçek zamanlı WebSocket senkronizasyonu, Deno serverless fonksiyonları, Recharts ile tahmine dayalı analiz, Cypress E2E testleri.",
      },
      ciftlikpro: {
        subtitle: "Çok Kiracılı Çiftlik Yönetim SaaS'ı",
        description:
          "PostgreSQL Row-Level Security (FORCE + WITH CHECK) ve Prisma extension ile çift katmanlı tenant izolasyonu sağlayan çok kiracılı SaaS. 4 rollü RBAC (Admin/Çalışan/Veteriner/Muhasebeci), tek transaction'da public kayıt (tenant + admin), token'lı personel daveti, FREE/PRO plan limitleri ve Stripe abonelik. KVKK self-servis veri ihracı + hesap silme, 277 birim + 7 E2E testi.",
      },
      patidefteri: {
        subtitle: "Evcil Hayvan Sağlık Takibi",
        description:
          "Evcil hayvanların aşı, bakım ve sağlık geçmişini takip eden full-stack PWA. Gerçek zamanlı çok cihazlı senkronizasyon, VAPID Web Push bildirimleri, PDF rapor + QR paylaşımı, çoklu dil, Framer Motion animasyonları.",
      },
    },
  },
  experience: {
    eyebrow: "04 — Yolculuk",
    title: "Deneyim & Sertifikalar",
    description: "Eğitim ve sürekli gelişimle şekillenen yazılım yolculuğum.",
    eduTitle: "Eğitim & Deneyim",
    certTitle: "Sertifikalar",
    items: {
      uopeople: {
        title: "Bilgisayar Bilimleri",
        org: "University of the People",
        period: "Devam ediyor",
        description:
          "Bilgisayar bilimleri temelleri, algoritmalar ve yazılım mühendisliği üzerine lisans eğitimi.",
      },
      workintech: {
        title: "Full-Stack Web Development",
        org: "Workintech",
        period: "Tamamlandı",
        description:
          "React, Node.js, PostgreSQL ve modern web mimarileri üzerine yoğun, proje tabanlı full-stack programı.",
      },
    },
  },
  contact: {
    eyebrow: "05 — İletişim",
    titleA: "Birlikte bir şeyler",
    titleHighlight: "inşa edelim",
    description:
      "Yeni bir proje, iş birliği ya da sadece merhaba demek için — kutu her zaman açık.",
    channelsTitle: "Doğrudan ulaş",
    formTitle: "Mesaj gönder",
    form: {
      name: "İsim",
      namePlaceholder: "Adınız Soyadınız",
      email: "E-posta",
      emailPlaceholder: "ornek@email.com",
      message: "Mesaj",
      messagePlaceholder: "Merhaba Yusuf, ...",
      submit: "Mesajı Gönder",
      sending: "Gönderiliyor...",
      success: "Teşekkürler! Mesajın ulaştı, en kısa sürede döneceğim.",
      error: "Bir şeyler ters gitti. Lütfen tekrar dene ya da e-posta ile yaz.",
      errName: "Lütfen adınızı girin.",
      errEmail: "Geçerli bir e-posta adresi girin.",
      errMessage: "Mesaj en az 10 karakter olmalı.",
    },
    footerNote: "Next.js · TypeScript · Tailwind · Framer Motion ile tasarlandı",
  },
  blog: {
    nav: "Blog",
    title: "Blog & Yazılar",
    description: "Geliştirme notları, öğrendiklerim ve proje hikâyeleri.",
    backHome: "Ana sayfaya dön",
    backList: "Tüm yazılar",
    readingSuffix: "dk okuma",
    empty: "Henüz yazı yok. Çok yakında!",
  },
};

// EN — aynı yapı, İngilizce içerik.
const en: Translation = {
  nav: {
    hero: "Home",
    about: "About",
    skills: "Skills",
    projects: "Projects",
    experience: "Experience",
    contact: "Contact",
    toggleTheme: "Toggle theme",
    toggleLang: "Switch language",
  },
  hero: {
    badge: "Open to new projects",
    title: "Full Stack Developer",
    roles: [
      "Full Stack Developer",
      "React & Next.js Developer",
      "TypeScript Enthusiast",
      "Problem Solver",
    ],
    tagline: "Full-stack developer building production-grade web applications",
    ctaProjects: "View My Work",
    ctaContact: "Get in Touch",
    scroll: "Scroll",
  },
  cv: {
    download: "Download CV",
    file: "/Yusuf_Kosar_Resume_EN.pdf",
  },
  about: {
    eyebrow: "01 — About",
    title: "Who Am I?",
    p1: "A full-stack developer studying Computer Science at the University of the People and a graduate of the Workintech Full-Stack program. I build production-grade applications with React, TypeScript, Node.js and PostgreSQL.",
    p2: "I care about clean architecture, testability and user experience. From idea to production, I build end-to-end products with CI/CD, type safety and scalable data models.",
    currently: {
      label: "Currently",
      learning: "Learning Java & Spring Boot",
      available: "Open to internship / junior opportunities",
    },
    highlightsLabel: "Featured technologies",
    stats: {
      projects: "Production Projects",
      certificates: "Certificates",
      learning: "Drive to Learn",
    },
  },
  skills: {
    eyebrow: "02 — Skills",
    title: "My Tech Stack",
    description:
      "The tools I use end to end — from frontend to database, testing and deployment.",
    categories: {
      frontend: "Frontend",
      backend: "Backend",
      database: "Database",
      tools: "Tools",
    },
  },
  projects: {
    eyebrow: "03 — Projects",
    title: "Selected Work",
    description:
      "Applications shipped to production, tested, and solving real user scenarios.",
    live: "Live Demo",
    code: "Code",
    items: {
      stacklight: {
        subtitle: "Error Tracking & Grouping Platform",
        description:
          "The read path is decoupled from the write path: the dashboard talks to the database directly, so it keeps working even while the ingestion service is asleep. Errors are grouped by deterministic fingerprinting, with versioned Java and JS stack trace normalization. Three anomaly detectors were compared in shadow mode, and the active detector was swapped based on the measurements. 320 tests, six CI workflows.",
      },
      localmediakit: {
        subtitle: "Media Kit Platform for Content Creators",
        description:
          "Published pages are served from the edge as immutable snapshots, so a shared link opens instantly even while the backend is asleep. A timing oracle on the password reset endpoint was closed by moving delivery to an outbox, giving a constant response time verified by measurement. 330 backend + 105 frontend + 13 E2E tests; ArchUnit architecture rules fail the build on violation, PIT mutation score 97%.",
      },
      pulse: {
        subtitle: "Real-Time Operational Telemetry & Anomaly Platform",
        description:
          "A polyglot distributed system in Java/Spring Boot, Python/FastAPI, and React. Telemetry flows through Redis Streams consumer groups (XAUTOCLAIM fault tolerance, idempotency, DLQ) into a TimescaleDB hypertable; two-layer anomaly detection (z-score + EWMA) and Holt-Winters forecasting that predicts threshold breaches before they happen. SSE live stream, ack/resolve alert lifecycle, a self-scoring forecast scorecard, and full containerization in a single command.",
      },
      ripplechat: {
        subtitle: "Real-Time Community Chat Platform",
        description:
          "Real-time messaging over WebSocket/STOMP with threads, reactions, and presence. End-to-end encryption (X3DH + Double Ratchet), TOTP-based 2FA, session/device management. WebRTC voice and video calls, Web Push, PWA/offline. Elasticsearch-powered search that gracefully degrades to a PostgreSQL fallback.",
      },
      subtrack: {
        subtitle: "Subscription & Expense Tracker",
        description:
          "TypeScript monorepo that shows monthly/yearly subscription costs in multiple currencies. 2FA, Google + GitHub OAuth, server-side JWT revocation, spending forecasts, 53 tests, Docker + GitHub Actions CI/CD.",
      },
      garajim: {
        subtitle: "Vehicle Maintenance & Tax Assistant",
        description:
          "Multi-tenant SaaS built on PostgreSQL Row Level Security. Real-time WebSocket sync, Deno serverless functions, predictive analytics with Recharts, Cypress E2E tests.",
      },
      ciftlikpro: {
        subtitle: "Multi-Tenant Farm Management SaaS",
        description:
          "A multi-tenant SaaS with dual-layer tenant isolation via PostgreSQL Row-Level Security (FORCE + WITH CHECK) and a Prisma extension. Four-role RBAC (Admin/Worker/Vet/Accountant), single-transaction public sign-up (tenant + admin), token-based staff invitations, FREE/PRO plan limits, and Stripe subscriptions. Self-service data export + account deletion for regulatory compliance, 277 unit + 7 E2E tests.",
      },
      patidefteri: {
        subtitle: "Pet Health Tracker",
        description:
          "Full-stack PWA tracking pets' vaccination, care and health history. Real-time multi-device sync, VAPID Web Push notifications, PDF reports + QR sharing, multi-language, Framer Motion animations.",
      },
    },
  },
  experience: {
    eyebrow: "04 — Journey",
    title: "Experience & Certificates",
    description: "My software journey shaped by education and continuous growth.",
    eduTitle: "Education & Experience",
    certTitle: "Certificates",
    items: {
      uopeople: {
        title: "Computer Science",
        org: "University of the People",
        period: "In progress",
        description:
          "Bachelor's studies in computer science fundamentals, algorithms and software engineering.",
      },
      workintech: {
        title: "Full-Stack Web Development",
        org: "Workintech",
        period: "Completed",
        description:
          "Intensive, project-based full-stack program covering React, Node.js, PostgreSQL and modern web architectures.",
      },
    },
  },
  contact: {
    eyebrow: "05 — Contact",
    titleA: "Let's build something",
    titleHighlight: "together",
    description:
      "For a new project, a collaboration, or just to say hi — the inbox is always open.",
    channelsTitle: "Reach out directly",
    formTitle: "Send a message",
    form: {
      name: "Name",
      namePlaceholder: "Your full name",
      email: "Email",
      emailPlaceholder: "you@email.com",
      message: "Message",
      messagePlaceholder: "Hi Yusuf, ...",
      submit: "Send Message",
      sending: "Sending...",
      success: "Thank you! Your message was sent — I'll get back to you soon.",
      error: "Something went wrong. Please try again or reach out via email.",
      errName: "Please enter your name.",
      errEmail: "Please enter a valid email address.",
      errMessage: "Message must be at least 10 characters.",
    },
    footerNote: "Built with Next.js · TypeScript · Tailwind · Framer Motion",
  },
  blog: {
    nav: "Blog",
    title: "Blog & Articles",
    description: "Development notes, things I learn, and project stories.",
    backHome: "Back to home",
    backList: "All posts",
    readingSuffix: "min read",
    empty: "No posts yet. Coming soon!",
  },
};

export type Translation = typeof tr;

export const translations: Record<Lang, Translation> = { tr, en };

export function getTranslation(lang: Lang): Translation {
  return translations[lang] ?? translations[DEFAULT_LANG];
}
