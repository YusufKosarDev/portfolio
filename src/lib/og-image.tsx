import { ImageResponse } from "next/og";

// Tüm OG/Twitter görsellerinde paylaşılan sabitler ve render mantığı.
// Manuel görsel yüklemeye gerek yok — görsel istek anında dinamik üretilir.
export const ogAlt = "Yusuf Koşar — Full Stack Developer";
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const NAME = "Yusuf Koşar";
const TITLE = "Full Stack Developer";
const STACK = "React · Next.js · TypeScript · Node.js · PostgreSQL";
const BADGE = "Yeni projelere açık · Open to work";

/**
 * Google Fonts'tan (Türkçe glifleri kapsayan) TTF font verisini çeker.
 * Bilinen UA dışında Google truetype döndürür; Satori woff2 desteklemediği
 * için bu yöntem gereklidir. Başarısız olursa görsel varsayılan fontla üretilir.
 */
async function loadGoogleFont(family: string, weight: number, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(
    / /g,
    "+"
  )}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/
  );
  if (!resource) throw new Error(`font url not found for ${family}`);
  const res = await fetch(resource[1]);
  if (!res.ok) throw new Error(`font fetch failed for ${family}`);
  return res.arrayBuffer();
}

export async function renderOgImage() {
  const allText = `${NAME}${TITLE}${STACK}${BADGE}`;

  let fonts:
    | { name: string; data: ArrayBuffer; weight: 400 | 700 | 800; style: "normal" }[]
    | undefined;

  try {
    const [bold, regular] = await Promise.all([
      loadGoogleFont("Space Grotesk", 700, allText),
      loadGoogleFont("Inter", 400, allText),
    ]);
    fonts = [
      { name: "Space Grotesk", data: bold, weight: 700, style: "normal" },
      { name: "Inter", data: regular, weight: 400, style: "normal" },
    ];
  } catch {
    // Font çekilemezse varsayılan fontla devam et (görsel yine üretilir).
    fonts = undefined;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "90px",
          backgroundColor: "#0a0a0f",
          fontFamily: fonts ? "Inter" : undefined,
          position: "relative",
        }}
      >
        {/* Tema ile uyumlu radyal gradient katmanları */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(60rem 60rem at 12% -10%, rgba(139,92,246,0.30), transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(55rem 55rem at 95% 110%, rgba(34,211,238,0.22), transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(50rem 50rem at 90% 0%, rgba(99,102,241,0.20), transparent 55%)",
          }}
        />

        {/* Durum rozeti */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "10px 22px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.12)",
            backgroundColor: "rgba(255,255,255,0.04)",
            color: "#8b93a7",
            fontSize: "26px",
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "999px",
              backgroundColor: "#22d3ee",
            }}
          />
          {BADGE}
        </div>

        {/* İsim — büyük ve gradient */}
        <div
          style={{
            display: "flex",
            marginTop: "30px",
            fontSize: "140px",
            fontWeight: 700,
            letterSpacing: "-4px",
            lineHeight: 1,
            fontFamily: fonts ? "Space Grotesk" : undefined,
            backgroundImage:
              "linear-gradient(100deg, #8b5cf6 0%, #6366f1 45%, #22d3ee 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          {NAME}
        </div>

        {/* Ünvan */}
        <div
          style={{
            display: "flex",
            marginTop: "24px",
            fontSize: "52px",
            color: "#e6e9f0",
            fontWeight: fonts ? 700 : undefined,
            fontFamily: fonts ? "Space Grotesk" : undefined,
          }}
        >
          {TITLE}
        </div>

        {/* Teknoloji yığını */}
        <div
          style={{
            display: "flex",
            marginTop: "22px",
            fontSize: "30px",
            color: "#8b93a7",
          }}
        >
          {STACK}
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: fonts?.map((f) => ({
        name: f.name,
        data: f.data,
        weight: f.weight,
        style: f.style,
      })),
    }
  );
}
