import { NextResponse } from "next/server";
import { Resend } from "resend";
import { personal } from "@/lib/data";
import {
  createRateLimiter,
  getClientIp,
  isHoneypotTripped,
  validateContactPayload,
} from "@/lib/contact";

// Modül düzeyinde tutulur: aynı sunucu örneğine gelen istekler sayacı paylaşır.
const rateLimiter = createRateLimiter({ limit: 3, windowMs: 10 * 60 * 1000 });

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  // Honeypot dolduysa bota başarılı görün ki yeniden denemesin; e-posta gitmez.
  if (isHoneypotTripped(body)) {
    return NextResponse.json({ ok: true });
  }

  const result = validateContactPayload(body);
  if (!result.ok) {
    return NextResponse.json({ error: "validation" }, { status: 422 });
  }
  const { name, email, message } = result.data;

  // Sınır yalnızca gerçekten e-posta gönderen yolda işletilir. Doğrulama
  // hatası kota harcamadığı için, form hatası yapan kullanıcıyı cezalandırmaz.
  const limit = rateLimiter.check(getClientIp(req.headers));
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Anahtar yoksa formun çökmesini önle, anlaşılır hata dön.
    console.error("RESEND_API_KEY tanımlı değil. .env.local dosyasına ekleyin.");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  // Gönderen adresi: doğrulanmış bir alan adın yoksa Resend'in test adresini kullan.
  // onboarding@resend.dev yalnızca hesabının e-postasına (yani sana) gönderebilir.
  const from = process.env.CONTACT_FROM || "Portföy <onboarding@resend.dev>";
  const to = process.env.CONTACT_TO || personal.email;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Portföy iletişim — ${name}`,
      text: `İsim: ${name}\nE-posta: ${email}\n\nMesaj:\n${message}`,
      html: `
        <div style="font-family:system-ui,sans-serif;line-height:1.6">
          <h2 style="margin:0 0 12px">Yeni iletişim mesajı</h2>
          <p><strong>İsim:</strong> ${escapeHtml(name)}</p>
          <p><strong>E-posta:</strong> ${escapeHtml(email)}</p>
          <p><strong>Mesaj:</strong></p>
          <p style="white-space:pre-wrap;padding:12px;background:#f4f4f8;border-radius:8px">${escapeHtml(
            message
          )}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend gönderim hatası:", error);
      return NextResponse.json({ error: "send_failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("İletişim API hatası:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
