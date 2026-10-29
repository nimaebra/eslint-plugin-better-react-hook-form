import { defineConfig } from "tsup";
export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  tsconfig: "tsconfig.build.json",
  external: ["@typescript-eslint/utils", "eslint", "react-hook-form"],
  format: ["esm", "cjs"],
  sourcemap: true,
  splitting: false,
  target: "node22",
  outExtension: ({ format }) => ({ js: format === "cjs" ? ".cjs" : ".mjs" }),
});
