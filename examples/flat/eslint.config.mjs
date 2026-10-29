import betterReactHookForm from "../../dist/index.mjs";
export default [
  ...betterReactHookForm.flatConfigs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  },
];
