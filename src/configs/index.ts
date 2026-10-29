import type { Linter, ESLint } from "eslint";
import type { FlatConfigMap, LegacyConfigMap, PresetName } from "../types.js";
import { presetRules } from "../rules/registry.js";

export const presetNames: readonly PresetName[] = [
  "recommended",
  "strict",
  "all",
];
export function createFlatConfigs(plugin: ESLint.Plugin): FlatConfigMap {
  return Object.fromEntries(
    presetNames.map((name) => [
      name,
      [
        {
          name: `better-react-hook-form/${name}`,
          plugins: { "better-react-hook-form": plugin },
          rules: presetRules(name),
        } satisfies Linter.Config,
      ],
    ]),
  ) as unknown as FlatConfigMap;
}
export const legacyConfigs = Object.fromEntries(
  presetNames.map((name) => [
    name,
    {
      plugins: ["better-react-hook-form"],
      rules: presetRules(name),
    },
  ]),
) as LegacyConfigMap;
