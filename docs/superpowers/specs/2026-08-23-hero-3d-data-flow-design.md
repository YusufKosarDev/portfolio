# Hero 3D Veri Akışı Sahnesi — Tasarım

**Tarih:** 2026-08-23
**Durum:** Onaylandı, uygulanmayı bekliyor
**Not:** Doküman Türkçe, çünkü repodaki tüm kod yorumları Türkçe. Commit mesajları ve README İngilizce kalmaya devam ediyor.

---

## 1. Amaç

Portfolyonun frontend'ini 3D animasyonla daha dikkat çekici hâle getirmek. İki farklı beklenti aynı anda karşılanacak:

1. **Site "daha pahalı" görünsün** — her ziyaretçide, ek maliyet olmadan.
2. **3D bir yetenek olarak sergilensin** — gücü yeten cihazda, gerçek bir WebGL sahnesiyle.

Bu ikisi tek bir çözümle karşılanamaz, bu yüzden tasarım **kademeli**: ucuz bir derinlik katmanı her yerde çalışır, pahalı sahne yalnızca uygun cihazda devreye girer.

## 2. Alınan kararlar

| Karar | Seçim | Gerekçe |
| --- | --- | --- |
| Kapsam | Kademeli: site geneline CSS 3D + hero'da tek WebGL sahnesi | Hem hız hem gösteri; ağır parça tek bir yerde izole |
| Sahnenin konsepti | Veri akışı / telemetri | Pulse projesine hikâye bağı kurar; teknoloji yığını adaşı ve parçacık-isim kalıplarından daha özgün |
| Hero yerleşimi | A — tam ekran arka plan | Mevcut ortalanmış hero kimliği korunur; en sinematik seçenek |
| Kapsama | Masaüstü + güçlü fallback | Analytics: son 30 günde %100 masaüstü / Chrome. Fallback yine de ciddiye alınır (bkz. §9 risk) |
| Açık tema | Palet değişimi | Sahneyi kapatmak yerine renk setini temaya göre değiştirmek; efekt korunur, zemine saygı gösterilir |
| Uygulama | Saf three.js + ince React sarmalayıcı | Tek ve etkileşimsiz sahnede r3f'in deklaratif faydası küçük, reconciler maliyeti gereksiz; render döngüsünün tam kontrolü bu işte kritik |

### Reddedilen alternatifler

- **react-three-fiber + drei** — ~30–100KB daha ağır ve bu tek sahne için karşılığı yok. *Siteye ikinci bir 3D parça eklenirse bu karar yeniden değerlendirilmeli;* ikinci sahneden itibaren r3f kendini amorti eder.
- **OGL / elle yazılmış shader** — en ucuzu, ama portfolyo sinyali zayıf. Amaç yalnızca performans olsaydı doğru seçimdi.
- **Hero'da bölünmüş yerleşim (metin solda, sahne sağda)** — okunabilirliği en yüksek seçenek, ama sitenin ortalanmış hero kimliğini bozuyordu.

## 3. Mimari

**Kilit ilke: three.js kodu React'in dışında yaşar.** Sahne çerçeveden bağımsız bir fabrikadır; React tarafı yalnızca yaşam döngüsünü bağlar. Böylece sahne kendi başına anlaşılır, React bileşeni ince kalır ve saf mantık test edilebilir olur.

```
src/lib/scene/
  dataFlow.ts      createScene(canvas, opts) -> { start, stop, resize, setTheme, dispose }
  eligibility.ts   saf: { width, reducedMotion, webgl2, cores } -> boolean
  palette.ts       saf: theme -> renk seti
src/lib/
  tilt.ts          saf: (rect, clientX, clientY, maxDeg) -> { rotateX, rotateY }
  useTilt.ts       tilt.ts'i saran React hook'u
src/components/hero/
  HeroBackdrop.tsx    uygunluğu ölçer, hangisinin görüneceğine karar verir
  DataFlowCanvas.tsx  next/dynamic + ssr:false; canvas yaşam döngüsü
  CssBackdrop.tsx     mevcut konik halkanın geliştirilmiş hâli (Hero.tsx'ten çıkarılır)
```

### Yükleme zinciri

1. Sunucu **her zaman** `CssBackdrop`'u render eder. İlk HTML'de ağır hiçbir şey yoktur.
2. Hidrasyondan sonra `HeroBackdrop` uygunluğu ölçer. Eşikler:

   | Koşul | Kabul kriteri |
   | --- | --- |
   | Görünüm genişliği | ≥ 1024px |
   | `prefers-reduced-motion` | `reduce` **değil** |
   | WebGL2 bağlamı | oluşturulabiliyor |
   | `hardwareConcurrency` | ≥ 4 (bildirilmiyorsa geçer sayılır) |

3. Uygunsa `DataFlowCanvas` dinamik olarak indirilir ve `CssBackdrop`'un üstüne yumuşak bir opaklık geçişiyle biner.

Uygunluk ölçümü **asla sunucuda çalışmaz**, bu yüzden hidrasyon uyumsuzluğu doğmaz — repo bu konuda zaten titiz (bkz. `src/lib/theme-store.ts`). İlk boyamada ağır varlık bulunmadığı için **LCP etkilenmez**.

## 4. Sahne tasarımı

Perspektif bir hacimde kameraya doğru akan parçacıklar; arkalarında derinlikte kaybolan iz çizgileri.

**Renkler uydurulmaz, mevcut token'lardan gelir:** `--accent-from` (#8b5cf6) → `--accent-mid` (#6366f1) → `--accent-to` (#22d3ee). Arada bir tek parçacık **anomali** olarak pembeye döner ve nabız gibi atar — Pulse'taki z-score / EWMA anomali tespitine göndermedir.

Anomali başlangıç değerleri: aynı anda en fazla 1 anomali, ortalama 8 saniyede bir, 1.5 saniyelik nabız. Bunlar tarayıcıda ince ayar yapılacak başlangıç noktalarıdır, sözleşme değildir.

**Okunabilirlik:** A yerleşimi seçildiği için hero metninin arkasına radyal bir scrim konur. Böylece okunabilirlik sahnenin yoğunluğundan bağımsız olarak garanti altındadır.

### Performans bütçesi (baştan sabit)

| Kısıt | Değer |
| --- | --- |
| Çizim çağrısı | 1 |
| Parçacık sayısı | ~1500 |
| DPR tavanı | 1.5 |
| Döngü durur | sekme arkaplanda (`visibilitychange`) veya hero ekran dışında (IntersectionObserver) |

IntersectionObserver kalıbı `src/components/ProjectThumbnail.tsx`'teki mevcut kullanımla aynıdır.

### Tema paleti

Tema `<html data-theme>` üzerinde yaşar ve `src/lib/theme-store.ts` bunu izlenebilir bir kaynak olarak sunar. Sahne bu store'a abone olur ve **yeniden mount olmadan** `setTheme` ile renk setini değiştirir:

- **Koyu tema:** mevcut vurgu renkleri, tam opaklık.
- **Açık tema:** koyu mor/indigo tonları, düşük opaklık — efekt korunur, #f6f8fd zemin ezilmez.

## 5. Ucuz CSS 3D katmanı

Dört bölge de tek bir primitifi paylaşır: proje kartları, sertifika ve deneyim kartları, yetenek çipleri, hakkında istatistik kartları.

Matematik `tilt.ts` içinde saf bir fonksiyondur. `useTilt` sonucu **CSS değişkeni olarak** elemana yazar (`--tilt-x`, `--tilt-y`), rAF ile kısılmış şekilde. **React state kullanılmaz** — fare hareketinde yeniden render olmaz. Bu, projelerdeki spotlight'ın zaten kullandığı yaklaşımın aynısıdır.

Projeler bölümünde ayrı dinleyici eklenmez; mevcut `onMouseMove` genişletilerek tek elden `--mx`, `--my`, `--tilt-x`, `--tilt-y` yazılır.

**Açı disiplini:** kartlarda en fazla 6–8°, çiplerde ~3°. Bunun ötesi zarif değil, ucuz görünür.

**Devre dışı kaldığı durumlar:** dokunmatik cihazlar (`pointer: fine` sorgusu) ve `prefers-reduced-motion` açıkken.

## 6. Düşüş yolları

Belkemiği tek bir karar: **`CssBackdrop` her zaman mount edilmiş kalır, canvas üstüne biner.** Böylece her hata biçimi tek sonuca indirgenir — "canvas hiç görünmez" — ve ayrı bir hata arayüzü gerekmez.

| Durum | Davranış |
| --- | --- |
| Dinamik import başarısız (ağ) | Fallback kalır, kullanıcıya hata gösterilmez |
| WebGL bağlamı oluşmaz | Uygunluk zaten `false` döner, sahne hiç istenmez |
| `webglcontextlost` | Döngü durur, kaynaklar bırakılır, canvas gizlenir |
| Çalışma anında reduced-motion açılır | `matchMedia` değişimine abone olunur, döngü durur |
| Bileşen unmount olur | geometry / material / renderer `dispose`, rAF iptal, dinleyiciler sökülür |

Son madde teorik bir endişe değil: dil değiştirildiğinde tam sayfa yüklemesi olur ve bileşen gerçekten unmount olur.

## 7. Test stratejisi

Repo kalıbına uyulur: node ortamında vitest, yalnızca saf mantık. Sahnenin görsel doğruluğu birim testle kanıtlanamaz; gerçek tarayıcıda çalıştırılıp ekran görüntüsüyle doğrulanır.

- **`eligibility.ts`** — her ret koşulu ayrı ayrı (dar ekran, reduced-motion, WebGL yok, zayıf CPU) ve hepsi uygunken kabul.
- **`tilt.ts`** — merkez sıfır döndürür; köşeler sınıra dayanır ama taşmaz; işaretler doğru yönde; sıfır boyutlu `rect`'te NaN üretmez.
- **`palette.ts`** — her tema için renk seti döner, bilinmeyen tema varsayılana düşer.
- **Bundle regresyon testi** — `src/` içinde `@/lib/scene/dataFlow` modülüne yapılan **statik** import aranır ve bulunursa test kırılır. Biri bu modülü doğrudan import ederse three.js ana bundle'a girer ve tembel yüklemenin tamamı sessizce boşa gider.

## 8. Ölçüm

Uygulama sonunda rakamla raporlanacak, "hızlı oldu" denmeyecek:

- `next build` çıktısındaki **First Load JS**, değişiklikten önce ve sonra.
- three.js'in gerçek gzip maliyeti (§2'deki ~150KB bir tahmindir, doğrulanacak).
- Hero'da LCP — Speed Insights zaten kurulu.

## 9. Riskler ve açık noktalar

- **Analytics örneklemi küçük.** 34 ziyaretçinin tamamı masaüstü, ama link LinkedIn'de veya CV'de paylaşıldığı anda mobil oranı sıçrar. Bu yüzden fallback "idare eder" değil, kendi başına iyi görünmek zorunda.
- **Bundle tahmini doğrulanmadı.** ~150KB gzip beklentisi tutmazsa (örneğin 250KB çıkarsa) karar yeniden tartışılmalı; o noktada §2'deki OGL alternatifi masaya geri gelir.
- **Anomali parıltısı abartıya kaçabilir.** §4'teki başlangıç değerleri tarayıcıda ince ayar gerektirir; fazlası dikkat dağıtır.

## 10. Teslim sırası

İki katman **birbirinden bağımsızdır** ve ayrı ayrı değer üretir. Bu yüzden sırayla teslim edilir:

**Faz 1 — CSS 3D derinlik katmanı.** Yeni bağımlılık yok, bundle büyümez, her cihazda çalışır. Tek başına yayına alınabilir ve sitenin görünümünü hemen iyileştirir.

**Faz 2 — WebGL hero sahnesi.** three.js bağımlılığı, tembel yükleme, uygunluk kapısı, tema paleti. Faz 1'e bağımlı değildir ama ondan sonra gelmesi mantıklıdır: ucuz kazanç önce cebe girer, ağır parça ölçülerek eklenir.

Faz 2'nin bundle ölçümü beklentiyi aşarsa (§9) Faz 1 zaten yayında olduğu için geri çekilmek ucuzdur.

## 11. Kapsam dışı

Bu tasarıma dâhil **değil**: diğer bölümlere ek WebGL sahneleri, scroll'a bağlı 3D geçişler, model/GLTF yüklemesi, post-processing efektleri, sahnenin fare ile etkileşimli hâle getirilmesi. Hepsi ayrı birer karar; ihtiyaç doğarsa ayrıca ele alınır.
