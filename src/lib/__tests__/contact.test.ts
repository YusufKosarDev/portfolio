import { describe, expect, it } from "vitest";
import {
  CONTACT_LIMITS,
  createRateLimiter,
  getClientIp,
  isHoneypotTripped,
  validateContactPayload,
} from "@/lib/contact";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Merhaba, projeniz hakkında konuşmak isterim.",
};

describe("validateContactPayload", () => {
  it("geçerli gönderimi kabul eder ve kırpar", () => {
    const result = validateContactPayload({
      name: "  Ada Lovelace  ",
      email: "  ada@example.com ",
      message: `  ${valid.message}  `,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Ada Lovelace");
      expect(result.data.email).toBe("ada@example.com");
      expect(result.data.message).toBe(valid.message);
    }
  });

  it("nesne olmayan gövdeyi reddeder", () => {
    for (const body of [null, undefined, "metin", 42, []]) {
      const result = validateContactPayload(body);
      // Dizi bir nesnedir; alanları olmadığı için isim kuralında düşer.
      expect(result.ok).toBe(false);
    }
  });

  it("isim sınırlarını uygular", () => {
    const tooShort = "a".repeat(CONTACT_LIMITS.nameMin - 1);
    const tooLong = "a".repeat(CONTACT_LIMITS.nameMax + 1);

    expect(validateContactPayload({ ...valid, name: tooShort })).toMatchObject({
      ok: false,
      reason: "name",
    });
    expect(validateContactPayload({ ...valid, name: tooLong })).toMatchObject({
      ok: false,
      reason: "name",
    });
    expect(
      validateContactPayload({ ...valid, name: "a".repeat(CONTACT_LIMITS.nameMin) }).ok
    ).toBe(true);
  });

  it("geçersiz e-postayı reddeder", () => {
    for (const email of ["", "ada", "ada@", "@example.com", "ada example.com"]) {
      expect(
        validateContactPayload({ ...valid, email }),
        `kabul edilmemeliydi: "${email}"`
      ).toMatchObject({ ok: false, reason: "email" });
    }
  });

  it("mesaj sınırlarını uygular", () => {
    const tooShort = "a".repeat(CONTACT_LIMITS.messageMin - 1);
    const tooLong = "a".repeat(CONTACT_LIMITS.messageMax + 1);

    expect(validateContactPayload({ ...valid, message: tooShort })).toMatchObject({
      ok: false,
      reason: "message",
    });
    expect(validateContactPayload({ ...valid, message: tooLong })).toMatchObject({
      ok: false,
      reason: "message",
    });
  });

  it("isimdeki kontrol karakterlerini reddeder (konu satırı enjeksiyonu)", () => {
    // `name` e-posta konu satırına giriyor; satır sonu başlık enjeksiyonu riski.
    const carriageReturn = String.fromCharCode(13);
    const lineFeed = String.fromCharCode(10);
    const nullByte = String.fromCharCode(0);

    for (const injected of [
      `Ada${carriageReturn}${lineFeed}Bcc: kurban@example.com`,
      `Ada${lineFeed}Soyad`,
      `Ada${nullByte}`,
    ]) {
      expect(
        validateContactPayload({ ...valid, name: injected }),
        "kontrol karakteri geçmemeliydi"
      ).toMatchObject({ ok: false, reason: "name" });
    }
  });

  it("mesaj gövdesinde satır sonuna izin verir", () => {
    const lineFeed = String.fromCharCode(10);
    const multiline = `Birinci satır${lineFeed}${lineFeed}İkinci satır burada.`;

    expect(validateContactPayload({ ...valid, message: multiline }).ok).toBe(true);
  });
});

describe("isHoneypotTripped", () => {
  it("alan boşken veya yokken tetiklenmez", () => {
    expect(isHoneypotTripped(valid)).toBe(false);
    expect(isHoneypotTripped({ ...valid, company: "" })).toBe(false);
    expect(isHoneypotTripped({ ...valid, company: "   " })).toBe(false);
  });

  it("alan doluyken tetiklenir", () => {
    expect(isHoneypotTripped({ ...valid, company: "Acme" })).toBe(true);
  });
});

describe("getClientIp", () => {
  it("x-forwarded-for içindeki ilk adresi alır", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1, 10.0.0.2" });
    expect(getClientIp(headers)).toBe("1.2.3.4");
  });

  it("x-real-ip'ye düşer", () => {
    expect(getClientIp(new Headers({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
  });

  it("hiçbiri yoksa sabit bir anahtar döndürür", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});

describe("createRateLimiter", () => {
  const windowMs = 10 * 60 * 1000;

  it("sınıra kadar izin verir, sonrasını reddeder", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs });
    const now = 1_000_000;

    expect(limiter.check("ip", now).allowed).toBe(true);
    expect(limiter.check("ip", now + 1).allowed).toBe(true);
    expect(limiter.check("ip", now + 2).allowed).toBe(true);
    expect(limiter.check("ip", now + 3).allowed).toBe(false);
  });

  it("reddederken kalan süreyi bildirir", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs });
    const now = 1_000_000;

    limiter.check("ip", now);
    const blocked = limiter.check("ip", now + 60_000);

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe((windowMs - 60_000) / 1000);
  });

  it("pencere dolunca yeniden izin verir", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs });
    const now = 1_000_000;

    limiter.check("ip", now);
    limiter.check("ip", now);
    expect(limiter.check("ip", now).allowed).toBe(false);
    expect(limiter.check("ip", now + windowMs + 1).allowed).toBe(true);
  });

  it("anahtarları birbirinden yalıtır", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs });
    const now = 1_000_000;

    expect(limiter.check("ip-a", now).allowed).toBe(true);
    expect(limiter.check("ip-a", now).allowed).toBe(false);
    expect(limiter.check("ip-b", now).allowed).toBe(true);
  });
});
