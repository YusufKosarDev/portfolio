// İletişim formunun saf mantığı: doğrulama, honeypot ve hız sınırlama.
// E-posta sağlayıcısından bağımsız tutuluyor ki ağ erişimi olmadan test edilebilsin.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Satır sonu dahil tüm kontrol karakterlerini yakalar.
 *
 * `name` doğrudan e-posta konu satırına girdiği için başlık enjeksiyonunu ve
 * bozuk konu satırlarını engeller. Mesaj gövdesinde satır sonu serbest
 * olduğundan bu kontrol ona uygulanmaz.
 */
function hasControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code < 32 || code === 127) return true;
  }
  return false;
}

export const CONTACT_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  emailMax: 200,
  messageMin: 10,
  messageMax: 5000,
} as const;

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export type ValidationReason = "invalid_body" | "name" | "email" | "message";

export type ValidationResult =
  | { ok: true; data: ContactPayload }
  | { ok: false; reason: ValidationReason };

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Sunucu tarafı doğrulama. İstemcideki kurallarla aynı, ek olarak üst sınırlar. */
export function validateContactPayload(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, reason: "invalid_body" };
  }

  const raw = body as Record<string, unknown>;
  const name = asTrimmedString(raw.name);
  const email = asTrimmedString(raw.email);
  const message = asTrimmedString(raw.message);

  if (
    name.length < CONTACT_LIMITS.nameMin ||
    name.length > CONTACT_LIMITS.nameMax ||
    hasControlChars(name)
  ) {
    return { ok: false, reason: "name" };
  }

  if (
    email.length > CONTACT_LIMITS.emailMax ||
    !EMAIL_RE.test(email) ||
    hasControlChars(email)
  ) {
    return { ok: false, reason: "email" };
  }

  if (
    message.length < CONTACT_LIMITS.messageMin ||
    message.length > CONTACT_LIMITS.messageMax
  ) {
    return { ok: false, reason: "message" };
  }

  return { ok: true, data: { name, email, message } };
}

/**
 * Honeypot: formdaki gizli `company` alanı yalnızca botlar tarafından doldurulur.
 * Gerçek kullanıcı alanı görmediği için boş kalır.
 */
export function isHoneypotTripped(body: unknown): boolean {
  if (typeof body !== "object" || body === null) return false;
  const value = (body as Record<string, unknown>).company;
  return typeof value === "string" && value.trim().length > 0;
}

/** Ters proxy arkasındaki gerçek istemci IP'si. Vercel `x-forwarded-for` doldurur. */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

export type RateLimitResult = {
  allowed: boolean;
  /** Reddedildiğinde istemcinin beklemesi gereken süre (saniye). */
  retryAfterSeconds: number;
};

export type RateLimiter = {
  check(key: string, now?: number): RateLimitResult;
};

/** Anahtar sayısı bunu aşınca süresi geçmiş kayıtlar temizlenir. */
const PRUNE_THRESHOLD = 500;

function pruneExpired(hits: Map<string, number[]>, cutoff: number): void {
  for (const [key, times] of hits) {
    const recent = times.filter((time) => time > cutoff);
    if (recent.length === 0) hits.delete(key);
    else hits.set(key, recent);
  }
}

/**
 * Kayan pencere hız sınırlayıcı (bellek içi).
 *
 * Süreç belleğinde tutulduğu için birden fazla sunucu örneği arasında
 * paylaşılmaz; kaba kuvvet ve otomatik gönderimleri durdurmaya yeter,
 * dağıtık bir garanti sunmaz.
 */
export function createRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    check(key: string, now: number = Date.now()): RateLimitResult {
      const cutoff = now - windowMs;
      const recent = (hits.get(key) ?? []).filter((time) => time > cutoff);

      if (recent.length >= limit) {
        hits.set(key, recent);
        const oldest = recent[0];
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
        };
      }

      recent.push(now);
      hits.set(key, recent);
      if (hits.size > PRUNE_THRESHOLD) pruneExpired(hits, cutoff);

      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}
