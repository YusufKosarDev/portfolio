import { describe, expect, it } from "vitest";
import { LANGS, translations } from "@/lib/i18n";
import { projects, timeline } from "@/lib/data";

/**
 * Nesne ağacındaki tüm yaprak yollarını toplar ("about.stats.projects" gibi).
 * Diziler indeksle gezilir, böylece uzunluk farkları da yakalanır.
 */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") return [prefix];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => keyPaths(item, `${prefix}[${index}]`));
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key)
  );
}

/** Ağaçtaki tüm yaprakları [yol, değer] çiftleri olarak döndürür. */
function leaves(value: unknown, prefix = ""): [string, unknown][] {
  if (value === null || typeof value !== "object") return [[prefix, value]];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => leaves(item, `${prefix}[${index}]`));
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    leaves(child, prefix ? `${prefix}.${key}` : key)
  );
}

describe("çeviri sözlükleri", () => {
  it("tüm diller birebir aynı anahtar ağacına sahip", () => {
    const [reference, ...others] = LANGS;
    const referenceKeys = keyPaths(translations[reference]).sort();

    for (const lang of others) {
      const langKeys = keyPaths(translations[lang]).sort();
      expect(langKeys, `"${lang}" sözlüğü "${reference}" ile eşleşmiyor`).toEqual(
        referenceKeys
      );
    }
  });

  it.each(LANGS)("%s: hiçbir metin boş değil", (lang) => {
    for (const [path, value] of leaves(translations[lang])) {
      expect(typeof value, `${lang}.${path} metin değil`).toBe("string");
      expect(String(value).trim().length, `${lang}.${path} boş`).toBeGreaterThan(0);
    }
  });
});

describe("proje çevirileri", () => {
  it.each(LANGS)("%s: her projenin subtitle ve description'ı var", (lang) => {
    const items = translations[lang].projects.items;

    for (const project of projects) {
      const copy = items[project.id];
      expect(copy, `"${project.id}" için ${lang} çevirisi yok`).toBeDefined();
      expect(copy.subtitle.trim().length).toBeGreaterThan(0);
      expect(copy.description.trim().length).toBeGreaterThan(0);
    }
  });

  it.each(LANGS)("%s: veride karşılığı olmayan çeviri kaydı yok", (lang) => {
    const knownIds = new Set<string>(projects.map((project) => project.id));

    for (const key of Object.keys(translations[lang].projects.items)) {
      expect(knownIds.has(key), `"${key}" çevirisi var ama data.ts'te proje yok`).toBe(
        true
      );
    }
  });
});

describe("deneyim çevirileri", () => {
  it.each(LANGS)("%s: her zaman çizelgesi kaydının çevirisi var", (lang) => {
    const items = translations[lang].experience.items;

    for (const item of timeline) {
      const copy = items[item.id];
      expect(copy, `"${item.id}" için ${lang} çevirisi yok`).toBeDefined();
      expect(copy.title.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("gezinme çevirileri", () => {
  it.each(LANGS)("%s: her bölüm için etiket var", async (lang) => {
    const { sectionIds } = await import("@/lib/data");

    for (const id of sectionIds) {
      expect(translations[lang].nav[id], `nav.${id} eksik (${lang})`).toBeTruthy();
    }
  });
});
