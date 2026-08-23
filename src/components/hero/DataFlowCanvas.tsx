"use client";

import { useEffect, useRef, useState } from "react";
import { getThemeSnapshot, subscribeTheme } from "@/lib/theme-store";

/**
 * Sahne tutamacının biçimi.
 *
 * Bilinçli olarak burada yeniden tanımlanıyor, `@/lib/scene/dataFlow`'dan
 * import edilmiyor: tip import'u derlemede silinse bile modül adını statik
 * yazmak, ileride birinin `type` kelimesini kaldırıp gerçek import'a
 * çevirmesini kolaylaştırırdı — ve o an three.js ana bundle'a girerdi.
 * Bkz. scene-isolation testi.
 */
type SceneHandle = {
  start(): void;
  stop(): void;
  resize(): void;
  setTheme(theme: string): void;
  dispose(): void;
};

/**
 * Sahnenin yaşam döngüsünü taşır. three.js modülü burada dinamik olarak
 * indirilir — statik import ana bundle'a girerdi.
 *
 * Canvas yüklenene kadar şeffaf; sahne kurulduktan sonra belirir, böylece
 * boş bir dikdörtgen bir an için CSS halkasını örtmez.
 */
export function DataFlowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let handle: SceneHandle | null = null;
    let cancelled = false;

    const onResize = () => handle?.resize();
    const onVisibility = () => {
      if (document.hidden) handle?.stop();
      else handle?.start();
    };
    // WebGL bağlamı kaybolursa (GPU sıfırlama, sekme baskısı) sahneyi bırak.
    const onContextLost = (event: Event) => {
      event.preventDefault();
      handle?.stop();
      setReady(false);
    };

    void import("@/lib/scene/dataFlow")
      .then(({ createScene }) => {
        // Modül inerken bileşen unmount olmuş olabilir.
        if (cancelled) return;
        handle = createScene(canvas, { theme: getThemeSnapshot() });
        handle.start();
        setReady(true);

        window.addEventListener("resize", onResize, { passive: true });
        document.addEventListener("visibilitychange", onVisibility);
      })
      .catch(() => {
        // Ağ hatası: CSS halkası zaten altta duruyor, kullanıcı bir şey kaybetmez.
      });

    // Tema değişimi sahneyi yeniden kurmaz, yalnızca renkleri değiştirir.
    const unsubscribe = subscribeTheme(() => handle?.setTheme(getThemeSnapshot()));

    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      handle?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 h-full w-full transition-opacity duration-1000 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
