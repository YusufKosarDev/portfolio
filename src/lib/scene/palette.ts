// Sahne renkleri globals.css'teki tema token'larından türetilir; burada
// serbest renk uydurulmaz. Açık tema için tonlar koyulaştırılır ve opaklık
// düşürülür, çünkü siyah üzerine tasarlanmış camgöbeği #f6f8fd zeminde kaybolur.

export type ScenePalette = {
  /** accent-from → accent-mid → accent-to */
  particles: readonly [string, string, string];
  /** Anomali parıltısı (spec §4) */
  anomaly: string;
  opacity: number;
};

const DARK: ScenePalette = {
  particles: ["#8b5cf6", "#6366f1", "#22d3ee"],
  anomaly: "#f472b6",
  opacity: 1,
};

const LIGHT: ScenePalette = {
  particles: ["#6d28d9", "#4338ca", "#0e7490"],
  anomaly: "#be185d",
  opacity: 0.55,
};

export function paletteForTheme(theme: string): ScenePalette {
  return theme === "light" ? LIGHT : DARK;
}
