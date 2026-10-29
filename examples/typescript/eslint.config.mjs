import tseslint from "typescript-eslint";
import betterReactHookForm from "../../dist/index.mjs";
export default [
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  ...betterReactHookForm.flatConfigs.recommended,
];
