"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { CssBackdrop } from "@/components/hero/CssBackdrop";
import {
  getEligibilitySnapshot,
  getEligibilityServerSnapshot,
  subscribeEligibility,
} from "@/lib/scene/environment";

// ssr:false: sahne yalnızca tarayıcıda anlamlı ve sunucuda üretilen HTML'e
// girmemeli — ilk boyamada ağır hiçbir şey olmasın diye (spec §3).
const DataFlowCanvas = dynamic(
  () => import("@/components/hero/DataFlowCanvas").then((m) => m.DataFlowCanvas),
  { ssr: false }
);

/**
 * Hero'nun arka planı.
 *
 * CSS halkası her zaman render edilir ve hiç unmount edilmez; WebGL sahnesi
 * uygun cihazlarda onun üstüne biner. Böylece sahnenin başarısız olabileceği
 * her yol (dar ekran, WebGL yok, reduced-motion, ağ hatası, bağlam kaybı)
 * tek bir sonuca iner: canvas görünmez, halka görünür.
 *
 * Uygunluk harici bir store'dan okunur (theme-store.ts'teki kalıbın aynısı):
 * sunucu anlık görüntüsü daima false olduğu için hidrasyon uyumsuzluğu doğmaz,
 * ölçüm de effect içinde setState çağırmadan tek turda yapılır.
 */
export function HeroBackdrop() {
  const eligible = useSyncExternalStore(
    subscribeEligibility,
    getEligibilitySnapshot,
    getEligibilityServerSnapshot
  );

  return (
    <>
      <CssBackdrop />
      {eligible && (
        <>
          <DataFlowCanvas />
          {/* Okunabilirlik karartması: sahnenin yoğunluğu ne olursa olsun
              isim ve butonlar okunur kalsın diye metnin arkasında durur. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, var(--background) 30%, color-mix(in oklab, var(--background) 55%, transparent) 62%, transparent 100%)",
            }}
          />
        </>
      )}
    </>
  );
}
