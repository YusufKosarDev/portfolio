// Kart yüzeylerinin imleci takip eden 3D eğimi için saf matematik.
// DOM'a dokunmaz, böylece node ortamında test edilebilir.

export type Tilt = {
  /** Pozitif: alt kenar izleyiciye yaklaşır. */
  rotateX: number;
  /** Pozitif: sağ kenar izleyiciden uzaklaşır. */
  rotateY: number;
};

export type TiltInput = {
  width: number;
  height: number;
  /** İmlecin elemanın sol kenarına uzaklığı (px) */
  x: number;
  /** İmlecin elemanın üst kenarına uzaklığı (px) */
  y: number;
  /** Maksimum eğim açısı (derece) */
  maxDeg: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Negatif sıfırı sıfıra çevirir.
 *
 * Merkezde `-ny * maxDeg` ifadesi -0 üretiyor. Aritmetik olarak zararsız ama
 * `Object.is(-0, 0)` false döndürdüğü için karşılaştırmaları şaşırtıyor ve
 * CSS'e "-0deg" olarak yazılması anlamsız.
 */
function normalizeZero(value: number): number {
  return value === 0 ? 0 : value;
}

/**
 * İmleç konumunu eğim açılarına çevirir. His şu: imleç yüzeye bastırıyor,
 * yani imlecin bulunduğu kenar geri gidiyor.
 */
export function tiltFromPointer({ width, height, x, y, maxDeg }: TiltInput): Tilt {
  // Gizli veya henüz ölçülmemiş eleman 0x0 döner; sıfıra bölme yerine düz dur.
  if (width <= 0 || height <= 0) return { rotateX: 0, rotateY: 0 };

  // Merkeze göre -1..1 aralığına normalize et. Pointer capture sırasında imleç
  // kutunun dışına çıkabildiği için sınırlama şart.
  const nx = clamp((x / width) * 2 - 1, -1, 1);
  const ny = clamp((y / height) * 2 - 1, -1, 1);

  return {
    rotateX: normalizeZero(-ny * maxDeg),
    rotateY: normalizeZero(nx * maxDeg),
  };
}
