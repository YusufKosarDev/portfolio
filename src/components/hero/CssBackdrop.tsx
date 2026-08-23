/**
 * Hero'nun arkasındaki dönen konik halka.
 *
 * WebGL sahnesi yüklenemediğinde (dar ekran, reduced-motion, WebGL yok, ağ
 * hatası) görünen şey budur. Sahne yüklendiğinde de unmount edilmez, sahne
 * bunun üstüne biner — böylece her hata biçimi tek sonuca iner: canvas görünmez.
 */
export function CssBackdrop() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2">
      <div className="spin-slow h-full w-full rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(139,92,246,0.25),transparent_30%,rgba(34,211,238,0.18),transparent_60%)] opacity-60 blur-2xl" />
    </div>
  );
}
