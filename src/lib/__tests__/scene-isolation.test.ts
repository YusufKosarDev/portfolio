import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SRC_DIR = path.join(process.cwd(), "src");
const SCENE_FILE = path.join("scene", "dataFlow.ts");

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

/** Sahne modülünün kendisi hariç tüm kaynak dosyalar. */
function consumers(): string[] {
  return sourceFiles(SRC_DIR).filter((file) => !file.endsWith(SCENE_FILE));
}

describe("sahne modülü izolasyonu", () => {
  it("three.js sahnesi hiçbir yerden statik import edilmiyor", () => {
    // `import(...)` serbest, `import ... from "..."` yasak. Statik import
    // three.js'i (~126KB gzip) ana bundle'a sokar ve tembel yüklemenin
    // tamamı sessizce anlamsızlaşır.
    //
    // Tip import'u da yasak: derlemede silinse bile modül adını statik
    // yazmak, ileride birinin `type` kelimesini kaldırmasını kolaylaştırır.
    const staticImport =
      /^\s*import\s(?:type\s)?[^\n;]*from\s*["']@\/lib\/scene\/dataFlow["']/m;

    for (const file of consumers()) {
      const source = fs.readFileSync(file, "utf8");
      expect(
        staticImport.test(source),
        `${path.relative(process.cwd(), file)} sahneyi statik import ediyor`
      ).toBe(false);
    }
  });

  it("three.js yalnızca sahne modülünde geçiyor", () => {
    // Başka bir dosya doğrudan "three"den import ederse aynı sorun oluşur.
    const threeImport = /^\s*import\s[^\n;]*from\s*["']three["']/m;

    for (const file of consumers()) {
      const source = fs.readFileSync(file, "utf8");
      expect(
        threeImport.test(source),
        `${path.relative(process.cwd(), file)} doğrudan three.js import ediyor`
      ).toBe(false);
    }
  });
});
