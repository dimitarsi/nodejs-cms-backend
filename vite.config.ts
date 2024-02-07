import path from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    alias: {
      "@db": path.resolve(__dirname, "./src/connect/db"),
      "@middleware/auth": path.resolve(__dirname, "./src/middleware/auth.ts"),
      "@middleware/projectAccess": path.resolve(
        __dirname,
        "./src/middleware/projectAccess.ts"
      ),
      "@config": path.resolve(__dirname, "./src/config/config.ts"),
      "@api/cms/": path.resolve(__dirname, "./src/api/cms/"),
      "@": path.resolve(__dirname, "./src"),
      "~": path.resolve(__dirname, "./src"),
    },
    environment: "node",
    globalSetup: [
      path.resolve(__dirname, "./src/tests/env.stub.ts"),
      path.resolve(__dirname, "./src/tests/teardown.ts"),
    ],
    testTimeout: 50 * 1000, // 50s timeout
    // setupFiles: [path.resolve(__dirname, "./src/tests/db.seed.ts")],
  },
})
