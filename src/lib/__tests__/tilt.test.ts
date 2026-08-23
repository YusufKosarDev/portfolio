import { describe, expect, it } from "vitest";
import { tiltFromPointer } from "@/lib/tilt";

const BOX = { width: 400, height: 200, maxDeg: 7 };

describe("tiltFromPointer", () => {
  it("merkezde eğim yok", () => {
    const tilt = tiltFromPointer({ ...BOX, x: 200, y: 100 });

    expect(tilt.rotateX).toBe(0);
    expect(tilt.rotateY).toBe(0);
  });

  it("imleç üstteyken üst kenar geri gider", () => {
    // rotateX pozitif = alt kenar öne, üst kenar geri.
    const tilt = tiltFromPointer({ ...BOX, x: 200, y: 0 });

    expect(tilt.rotateX).toBe(7);
    expect(tilt.rotateY).toBe(0);
  });

  it("imleç sağdayken sağ kenar geri gider", () => {
    const tilt = tiltFromPointer({ ...BOX, x: 400, y: 100 });

    expect(tilt.rotateY).toBe(7);
    expect(tilt.rotateX).toBe(0);
  });

  it("karşı köşeler zıt işaret üretir", () => {
    const topLeft = tiltFromPointer({ ...BOX, x: 0, y: 0 });
    const bottomRight = tiltFromPointer({ ...BOX, x: 400, y: 200 });

    expect(topLeft.rotateX).toBe(7);
    expect(topLeft.rotateY).toBe(-7);
    expect(bottomRight.rotateX).toBe(-7);
    expect(bottomRight.rotateY).toBe(7);
  });

  it("kutu dışındaki imleç maksimumu aşmaz", () => {
    // Pointer capture sırasında imleç elemanın dışına çıkabiliyor.
    const tilt = tiltFromPointer({ ...BOX, x: 4000, y: -2000 });

    expect(tilt.rotateY).toBe(7);
    expect(tilt.rotateX).toBe(7);
  });

  it("sıfır boyutlu kutuda NaN üretmez", () => {
    // getBoundingClientRect gizli elemanlarda 0x0 döndürür.
    const tilt = tiltFromPointer({ width: 0, height: 0, x: 10, y: 10, maxDeg: 7 });

    expect(tilt.rotateX).toBe(0);
    expect(tilt.rotateY).toBe(0);
  });
});
