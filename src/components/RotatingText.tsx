"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type RotatingTextProps = {
  /** Sırayla gösterilecek kelimeler */
  words: string[];
  /** Kelime başına bekleme süresi (ms) */
  interval?: number;
  className?: string;
};

/**
 * Belirli aralıklarla kelimeleri yumuşak bir geçişle değiştiren metin.
 * prefers-reduced-motion açıksa dönüş durur, ilk kelime sabit gösterilir.
 */
export function RotatingText({
  words,
  interval = 2400,
  className,
}: RotatingTextProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || words.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => clearInterval(id);
  }, [reduceMotion, words.length, interval]);

  // Hareket azaltılmışsa ilk kelimeyi sabit göster.
  if (reduceMotion) {
    return <span className={className}>{words[0]}</span>;
  }

  return (
    <span
      className={className}
      style={{ display: "inline-block", position: "relative" }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: "0.4em" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "-0.4em" }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "inline-block" }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
