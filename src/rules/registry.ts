import type { RuleRegistryEntry, PresetName } from "../types.js";
import noDeprecatedWatchCallback from "./no-deprecated-watch-callback.js";
import noDoubleRegister from "./no-double-register.js";
import noEmptyUsefieldarrayAction from "./no-empty-usefieldarray-action.js";
import noFormMethodsObjectInDeps from "./no-form-methods-object-in-deps.js";
import noNestedFormProvider from "./no-nested-form-provider.js";
import noRegisterBracketSyntax from "./no-register-bracket-syntax.js";
import noStackedUsefieldarrayActions from "./no-stacked-usefieldarray-actions.js";
import preferUseformstateOverFormstateContext from "./prefer-useformstate-over-formstate-context.js";
import usefieldarrayRequireFieldIdKey from "./usefieldarray-require-field-id-key.js";
import noConflictingValueTransforms from "./no-conflicting-value-transforms.js";
import noUndefinedControllerDefaultValue from "./no-undefined-controller-default-value.js";
import noUndefinedSetValue from "./no-undefined-set-value.js";
import noUndefinedControllerOnChange from "./no-undefined-controller-on-change.js";
import noDuplicateUsefieldarray from "./no-duplicate-usefieldarray.js";

export const ruleRegistry: readonly RuleRegistryEntry[] = [
  {
    name: "no-deprecated-watch-callback",
    rule: noDeprecatedWatchCallback,
    recommended: "warn",
  },
  { name: "no-double-register", rule: noDoubleRegister, recommended: "error" },
  {
    name: "no-empty-usefieldarray-action",
    rule: noEmptyUsefieldarrayAction,
    recommended: "error",
  },
  {
    name: "no-form-methods-object-in-deps",
    rule: noFormMethodsObjectInDeps,
    recommended: "error",
  },
  {
    name: "no-nested-form-provider",
    rule: noNestedFormProvider,
    recommended: "warn",
  },
  {
    name: "no-register-bracket-syntax",
    rule: noRegisterBracketSyntax,
    recommended: "error",
  },
  {
    name: "no-stacked-usefieldarray-actions",
    rule: noStackedUsefieldarrayActions,
    strict: "warn",
  },
  {
    name: "prefer-useformstate-over-formstate-context",
    rule: preferUseformstateOverFormstateContext,
    strict: "warn",
  },
  {
    name: "usefieldarray-require-field-id-key",
    rule: usefieldarrayRequireFieldIdKey,
    recommended: "error",
  },
  {
    name: "no-conflicting-value-transforms",
    rule: noConflictingValueTransforms,
    recommended: "error",
  },
  {
    name: "no-undefined-controller-default-value",
    rule: noUndefinedControllerDefaultValue,
    recommended: "error",
  },
  { name: "no-undefined-set-value", rule: noUndefinedSetValue },
  {
    name: "no-undefined-controller-on-change",
    rule: noUndefinedControllerOnChange,
  },
  { name: "no-duplicate-usefieldarray", rule: noDuplicateUsefieldarray },
];
export const rules = Object.fromEntries(
  ruleRegistry.map((entry) => [entry.name, entry.rule]),
);
export function presetRules(preset: PresetName) {
  return Object.fromEntries(
    ruleRegistry.flatMap((entry) => {
      const severity =
        preset === "all"
          ? "error"
          : (entry.recommended ??
            (preset === "strict" ? entry.strict : undefined));
      return severity
        ? [[`better-react-hook-form/${entry.name}`, severity]]
        : [];
    }),
  );
}
