import js from "@eslint/js";
import eslintPlugin from "eslint-plugin-eslint-plugin";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "coverage/**", "examples/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  { languageOptions: { globals: globals.node } },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
    rules: { "@typescript-eslint/consistent-type-imports": "error" },
  },
  {
    files: ["src/rules/**/*.ts"],
    ignores: ["src/rules/registry.ts"],
    plugins: { "eslint-plugin": eslintPlugin },
    rules: {
      "eslint-plugin/require-meta-default-options": "error",
      "eslint-plugin/require-meta-docs-description": "error",
      "eslint-plugin/require-meta-schema": "error",
      "eslint-plugin/require-meta-type": "error",
      "eslint-plugin/no-identical-tests": "error",
    },
  },
);
