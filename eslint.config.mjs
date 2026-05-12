import js from "@eslint/js";
import eslintPlugin from "eslint-plugin-eslint-plugin";
import globals from "globals";
import tseslint from "typescript-eslint";

const docsUrlPattern =
  "https://github.com/nimaebrazeh/eslint-plugin-better-react-hook-form/blob/main/docs/rules/{{name}}.md";

export default tseslint.config(
  {
    ignores: ["dist", "coverage", ".eslint-doc-generatorrc.cjs"],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "eslint-plugin": eslintPlugin,
    },
  },
  {
    files: ["src/rules/**/*.ts"],
    rules: {
      "eslint-plugin/require-meta-default-options": "error",
      "eslint-plugin/require-meta-docs-description": "error",
      "eslint-plugin/require-meta-docs-url": [
        "error",
        {
          pattern: docsUrlPattern,
        },
      ],
      "eslint-plugin/require-meta-schema": "error",
      "eslint-plugin/require-meta-type": "error",
    },
  },
  {
    files: ["tests/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
);
