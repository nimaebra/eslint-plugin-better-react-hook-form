import packageJson from "../package.json";
import { createFlatConfigs, legacyConfigs } from "./configs/index.js";
import { rules as internalRules } from "./rules/registry.js";
import type { BetterReactHookFormPlugin } from "./types.js";

// typescript-eslint retains ESLint 9 context types; the public API uses the installed ESLint types.
// Listeners only use sourceCode APIs shared by ESLint 9 and 10 (verified by package smoke tests).
const plugin = {
  meta: {
    name: packageJson.name,
    namespace: "better-react-hook-form",
    version: packageJson.version,
  },
  rules: internalRules,
  configs: { ...legacyConfigs },
} as unknown as BetterReactHookFormPlugin;
export const flatConfigs = createFlatConfigs(plugin);
plugin.flatConfigs = flatConfigs;
plugin.configs["flat/recommended"] = flatConfigs.recommended[0];
export const configs = plugin.configs;
export const rules: BetterReactHookFormPlugin["rules"] = plugin.rules;
export default plugin;
