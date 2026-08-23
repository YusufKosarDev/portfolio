import {
  renderOgImage,
  ogAlt,
  ogSize,
  ogContentType,
} from "@/lib/og-image";
import { LANGS } from "@/lib/i18n";

// Dil segmenti altında olduğu için parametreler açıkça bildirilir; aksi halde
// görsel her istekte yeniden üretilir.
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage();
}
