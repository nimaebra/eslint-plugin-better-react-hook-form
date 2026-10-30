import type { Linter, ESLint } from "eslint";
import type { TSESLint } from "@typescript-eslint/utils";
import type { BetterReactHookFormDocs } from "./utils/createRule.js";

export type PresetName = "recommended" | "strict" | "all";
export type RuleModule = NonNullable<ESLint.Plugin["rules"]>[string];
export interface RuleRegistryEntry {
  name: string;
  rule: TSESLint.RuleModule<string, unknown[], BetterReactHookFormDocs>;
  recommended?: "error" | "warn";
  strict?: "error" | "warn";
}
export type FlatConfigMap = Record<PresetName, Linter.Config[]>;
export type LegacyConfigMap = Record<PresetName, Linter.LegacyConfig>;
export interface BetterReactHookFormPlugin extends ESLint.Plugin {
  meta: { name: string; namespace: string; version: string };
  rules: Record<string, RuleModule>;
  configs: LegacyConfigMap & { "flat/recommended": Linter.Config };
  flatConfigs: FlatConfigMap;
}
