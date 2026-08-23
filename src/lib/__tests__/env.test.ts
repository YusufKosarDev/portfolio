import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const ENV_EXAMPLE = path.join(ROOT, ".env.example");

/** src/ altındaki tüm .ts / .tsx dosyaları. */
function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

/** Kodda gerçekten okunan ortam değişkenlerinin adları. */
function referencedEnvVars(): string[] {
  const names = new Set<string>();
  for (const file of sourceFiles(SRC_DIR)) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(/process\.env\.([A-Z0-9_]+)/g)) {
      names.add(match[1]);
    }
  }
  return [...names].sort();
}

/** `.env.example` içindeki anahtarlar (yorum ve boş satırlar atlanır). */
function exampleKeys(): string[] {
  return fs
    .readFileSync(ENV_EXAMPLE, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => line.split("=")[0].trim());
}

describe("ortam değişkeni örneği", () => {
  it(".env.example dosyası var", () => {
    // README kurulum adımı bu dosyayı kopyalatıyor; yoksa talimat kırık.
    expect(fs.existsSync(ENV_EXAMPLE), ".env.example bulunamadı").toBe(true);
  });

  it("kodda okunan her değişken örnekte listeli", () => {
    // Yeni bir process.env okuması eklenip örneğe yazılmazsa, projeyi ilk kez
    // kuran kişi eksik değişkeni ancak çalışma anında fark eder.
    const keys = exampleKeys();
    for (const name of referencedEnvVars()) {
      expect(keys, `${name} .env.example içinde yok`).toContain(name);
    }
  });

  it("örnekte gerçek bir Resend anahtarı yok", () => {
    // Örnek dosya izlendiği için, buraya yapıştırılan gerçek anahtar repoya girer.
    const raw = fs.readFileSync(ENV_EXAMPLE, "utf8");
    expect(raw, "gerçek görünümlü bir Resend anahtarı var").not.toMatch(
      /re_[A-Za-z0-9]{20,}/
    );
  });

  it(".gitignore .env.example'ı yutmuyor", () => {
    // `.env*` deseni bu dosyayı da kapsıyor; istisna satırı olmadan dosya
    // oluşturulsa bile commit edilemez ve README'nin adımı yine çalışmaz.
    const gitignore = fs.readFileSync(path.join(ROOT, ".gitignore"), "utf8");
    expect(gitignore, ".gitignore'da !.env.example istisnası yok").toMatch(
      /^!\.env\.example$/m
    );
  });
});
