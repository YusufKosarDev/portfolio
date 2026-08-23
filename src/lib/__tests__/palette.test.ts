import { describe, expect, it } from "vitest";
import { paletteForTheme } from "@/lib/scene/palette";

describe("paletteForTheme", () => {
  it("koyu temada üç vurgu rengi döner", () => {
    const p = paletteForTheme("dark");

    expect(p.particles).toHaveLength(3);
    for (const color of p.particles) {
      expect(color, `geçersiz renk: ${color}`).toMatch(/^#[0-9a-f]{6}$/i);
    }
    expect(p.anomaly).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("açık temada farklı bir set döner", () => {
    // Siyah üzerine tasarlanmış camgöbeği #f6f8fd zeminde kaybolur.
    expect(paletteForTheme("light").particles).not.toEqual(
      paletteForTheme("dark").particles
    );
  });

  it("açık temada opaklık daha düşük", () => {
    // Açık zemini ezmemek için efekt geri çekilir.
    expect(paletteForTheme("light").opacity).toBeLessThan(
      paletteForTheme("dark").opacity
    );
  });

  it("bilinmeyen tema koyuya düşer", () => {
    // setTheme'e beklenmedik bir değer gelirse sahne kararmak yerine
    // varsayılan görünümü korumalı.
    expect(paletteForTheme("sepya")).toEqual(paletteForTheme("dark"));
  });
});
