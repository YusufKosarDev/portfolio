// Proje kartlarındaki ekran görüntülerini bir kez çekip public/projects/ altına
// yazar. Görseller repoda tutulduğu için site çalışma anında hiçbir dış servise
// bağımlı değildir.
//
// Kullanım:  npm run screenshots
// Yeni bir proje eklediğinde veya bir sitenin tasarımı değiştiğinde tekrar çalıştır.

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { projects } from "../src/lib/data.ts";

const OUTPUT_DIR = path.join(process.cwd(), "public", "projects");
/** Kartlar en fazla ~600px genişlikte gösteriliyor; 1280 retina için yeterli. */
const OUTPUT_WIDTH = 1280;
const WEBP_QUALITY = 80;

/** Microlink üzerinden canlı siteden ekran görüntüsü URL'i üretir. */
function screenshotUrl(siteUrl: string): string {
  const params = new URLSearchParams({
    url: siteUrl,
    screenshot: "true",
    embed: "screenshot.url",
    meta: "false",
    "viewport.width": "1280",
    "viewport.height": "800",
    "viewport.deviceScaleFactor": "2",
    waitUntil: "networkidle2",
    colorScheme: "dark",
  });
  return `https://api.microlink.io/?${params.toString()}`;
}

async function capture(id: string, siteUrl: string): Promise<void> {
  const response = await fetch(screenshotUrl(siteUrl), {
    signal: AbortSignal.timeout(90_000),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const source = Buffer.from(await response.arrayBuffer());
  const output = path.join(OUTPUT_DIR, `${id}.webp`);

  await sharp(source)
    .resize({ width: OUTPUT_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(output);

  const { size } = await fs.stat(output);
  console.log(`  ${id.padEnd(16)} ${(size / 1024).toFixed(0).padStart(5)} KB  ${output}`);
}

async function main(): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const targets = projects.filter((project) => project.live);
  console.log(`${targets.length} proje için ekran görüntüsü alınıyor...\n`);

  const failed: string[] = [];

  // Sıralı çalışıyor: Microlink eşzamanlı isteklerde hız sınırına takılıyor.
  for (const project of targets) {
    try {
      await capture(project.id, project.live as string);
    } catch (error) {
      // Bir görsel alınamazsa mevcut dosyaya dokunulmaz; kart eskisini kullanır.
      failed.push(project.id);
      console.warn(`  ${project.id.padEnd(16)} ATLANDI — ${(error as Error).message}`);
    }
  }

  console.log();
  if (failed.length > 0) {
    console.warn(`Alınamayan: ${failed.join(", ")}`);
    console.warn("Mevcut dosyalar korundu. Komutu tekrar çalıştırabilirsin.");
    process.exitCode = 1;
    return;
  }
  console.log("Tüm ekran görüntüleri güncellendi.");
}

await main();
