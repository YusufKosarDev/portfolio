import { describe, expect, it } from "vitest";
import { isSceneEligible, MIN_WIDTH, MIN_CORES } from "@/lib/scene/eligibility";

const UYGUN = {
  width: 1440,
  reducedMotion: false,
  webgl2: true,
  cores: 8,
};

describe("isSceneEligible", () => {
  it("tüm koşullar sağlanınca kabul eder", () => {
    expect(isSceneEligible(UYGUN)).toBe(true);
  });

  it("dar ekranı reddeder", () => {
    expect(isSceneEligible({ ...UYGUN, width: MIN_WIDTH - 1 })).toBe(false);
    expect(isSceneEligible({ ...UYGUN, width: MIN_WIDTH })).toBe(true);
  });

  it("reduced-motion açıkken reddeder", () => {
    expect(isSceneEligible({ ...UYGUN, reducedMotion: true })).toBe(false);
  });

  it("WebGL2 yoksa reddeder", () => {
    expect(isSceneEligible({ ...UYGUN, webgl2: false })).toBe(false);
  });

  it("zayıf CPU'yu reddeder", () => {
    expect(isSceneEligible({ ...UYGUN, cores: MIN_CORES - 1 })).toBe(false);
    expect(isSceneEligible({ ...UYGUN, cores: MIN_CORES })).toBe(true);
  });

  it("çekirdek sayısı bildirilmiyorsa engel saymaz", () => {
    // Safari hardwareConcurrency'yi kısıtlayabiliyor; bilinmeyeni ret sebebi
    // saymak, güçlü makineleri boş yere dışarıda bırakırdı.
    expect(isSceneEligible({ ...UYGUN, cores: undefined })).toBe(true);
  });

  it("tek bir ret koşulu diğerleri uygunken bile yeter", () => {
    expect(
      isSceneEligible({ width: 800, reducedMotion: false, webgl2: true, cores: 16 })
    ).toBe(false);
  });
});
