import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { certificates, projects, skillCategories, timeline } from "@/lib/data";

const PUBLIC_DIR = path.join(process.cwd(), "public");

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

describe("proje verisi", () => {
  it("id'ler benzersiz", () => {
    const ids = projects.map((project) => project.id);
    expect(new Set(ids).size, `yinelenen id: ${ids.join(", ")}`).toBe(ids.length);
  });

  it("her projenin adı ve en az bir teknolojisi var", () => {
    for (const project of projects) {
      expect(project.name.trim().length, `${project.id} adı boş`).toBeGreaterThan(0);
      expect(project.stack.length, `${project.id} stack boş`).toBeGreaterThan(0);
    }
  });

  it("her projenin kart görseli için canlı linki veya yerel medyası var", () => {
    // İkisi de yoksa ProjectThumbnail yalnızca gradient fallback gösterir;
    // kart görselsiz kalır. Bu testin amacı o sessiz boşluğu yakalamak.
    for (const project of projects) {
      const hasVisual = Boolean(project.live) || Boolean(project.media);
      expect(hasVisual, `${project.id} için ne live ne media var`).toBe(true);
    }
  });

  it("tüm dış bağlantılar https", () => {
    for (const project of projects) {
      expect(isHttpsUrl(project.github), `${project.id} github: ${project.github}`).toBe(
        true
      );
      if (project.live) {
        expect(isHttpsUrl(project.live), `${project.id} live: ${project.live}`).toBe(true);
      }
    }
  });

  it("medyası olmayan her projenin ekran görüntüsü dosyası var", () => {
    // Görseller `npm run screenshots` ile üretilip repoda tutuluyor. Yeni
    // proje eklenip komut çalıştırılmazsa kart gradient fallback'a düşerdi.
    for (const project of projects) {
      if (project.media) continue;

      const filePath = path.join(PUBLIC_DIR, "projects", `${project.id}.webp`);
      expect(
        fs.existsSync(filePath),
        `${project.id} için ekran görüntüsü yok: npm run screenshots`
      ).toBe(true);
    }
  });

  it("yerel medya dosyaları public/ altında gerçekten var", () => {
    for (const project of projects) {
      if (!project.media) continue;

      for (const [kind, urlPath] of Object.entries(project.media)) {
        const filePath = path.join(PUBLIC_DIR, urlPath);
        expect(
          fs.existsSync(filePath),
          `${project.id} ${kind} dosyası yok: ${urlPath}`
        ).toBe(true);
      }
    }
  });
});

describe("sertifika verisi", () => {
  it("her sertifikanın başlığı ve kurumu dolu", () => {
    for (const cert of certificates) {
      expect(cert.title.trim().length).toBeGreaterThan(0);
      expect(cert.org.trim().length).toBeGreaterThan(0);
    }
  });

  it("başlıklar benzersiz", () => {
    // Experience bölümü listeyi cert.title ile key'liyor; yinelenme React
    // uyarısı ve kararsız render üretir.
    const titles = certificates.map((cert) => cert.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe("yetenek ve zaman çizelgesi verisi", () => {
  it("her yetenek kategorisinde en az bir madde var", () => {
    for (const category of skillCategories) {
      expect(category.skills.length, `${category.key} boş`).toBeGreaterThan(0);
    }
  });

  it("zaman çizelgesi id'leri benzersiz", () => {
    const ids = timeline.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
