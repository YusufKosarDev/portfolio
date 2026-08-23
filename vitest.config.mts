import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Testler saf mantığı hedefliyor (veri tutarlılığı, doğrulama, blog ayrıştırma),
// bu yüzden DOM ortamına ve React test kütüphanelerine gerek yok — node ortamı
// hem yeterli hem çok daha hızlı.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // `server-only` yalnızca istemci paketine sızmayı engellemek için var;
      // node ortamında çalıştırılan testlerde karşılığı boş bir modül.
      "server-only": fileURLToPath(new URL("./test/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
