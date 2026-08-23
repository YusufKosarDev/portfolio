// WebGL sahnesinin yüklenip yüklenmeyeceğine karar veren saf kurallar.
// Tarayıcıya dokunmaz — ortam okuması environment.ts'te, böylece kurallar
// node ortamında test edilebilir.

/** Spec §3: sahne yalnızca geniş ekranlarda. */
export const MIN_WIDTH = 1024;

/** Spec §3: dört çekirdeğin altı ağır sahne için zayıf sayılır. */
export const MIN_CORES = 4;

export type EligibilityInput = {
  width: number;
  reducedMotion: boolean;
  webgl2: boolean;
  /** navigator.hardwareConcurrency — her tarayıcı bildirmiyor. */
  cores: number | undefined;
};

export function isSceneEligible({
  width,
  reducedMotion,
  webgl2,
  cores,
}: EligibilityInput): boolean {
  if (width < MIN_WIDTH) return false;
  if (reducedMotion) return false;
  if (!webgl2) return false;
  // Bilinmeyen çekirdek sayısı ret sebebi değil: Safari bu değeri kısıtlıyor
  // ve güçlü makineleri boş yere dışarıda bırakmak istemiyoruz.
  if (cores !== undefined && cores < MIN_CORES) return false;
  return true;
}
