import type { BetterReactHookFormDocs } from "./utils/createRule.js";

import destructuringFormState from "./rules/destructuring-formstate.js";
import noDeprecatedWatchCallback from "./rules/no-deprecated-watch-callback.js";
import noDoubleRegister from "./rules/no-double-register.js";
import noEmptyUseFieldArrayAction from "./rules/no-empty-usefieldarray-action.js";
import noFormMethodsObjectInDeps from "./rules/no-form-methods-object-in-deps.js";
import noNestedFormProvider from "./rules/no-nested-form-provider.js";
import noUseWatch from "./rules/no-use-watch.js";
import noValuesWithShouldUnregister from "./rules/no-values-with-shouldunregister.js";
import preferUseFormStateOverFormStateContext from "./rules/prefer-useformstate-over-formstate-context.js";
import noRegisterBracketSyntax from "./rules/no-register-bracket-syntax.js";
import noStackedUseFieldArrayActions from "./rules/no-stacked-usefieldarray-actions.js";
import useFieldArrayRequireFieldIdKey from "./rules/usefieldarray-require-field-id-key.js";

const rules = {
  "destructuring-formstate": destructuringFormState,
  "no-deprecated-watch-callback": noDeprecatedWatchCallback,
  "no-double-register": noDoubleRegister,
  "no-empty-usefieldarray-action": noEmptyUseFieldArrayAction,
  "no-form-methods-object-in-deps": noFormMethodsObjectInDeps,
  "no-nested-form-provider": noNestedFormProvider,
  "no-use-watch": noUseWatch,
  "no-values-with-shouldunregister": noValuesWithShouldUnregister,
  "prefer-useformstate-over-formstate-context":
    preferUseFormStateOverFormStateContext,
  "no-register-bracket-syntax": noRegisterBracketSyntax,
  "no-stacked-usefieldarray-actions": noStackedUseFieldArrayActions,
  "usefieldarray-require-field-id-key": useFieldArrayRequireFieldIdKey,
} satisfies Record<string, { meta: { docs?: BetterReactHookFormDocs } }>;

const plugin = {
  meta: {
    name: "eslint-plugin-better-react-hook-form",
    namespace: "better-react-hook-form",
    version: "0.1.0",
  },
  configs: {} as Record<string, unknown>,
  rules,
};

Object.assign(plugin.configs, {
  "flat/recommended": {
    plugins: {
      "better-react-hook-form": plugin,
    },
    rules: {
      "better-react-hook-form/destructuring-formstate": "error",
      "better-react-hook-form/no-deprecated-watch-callback": "error",
      "better-react-hook-form/no-double-register": "error",
      "better-react-hook-form/no-empty-usefieldarray-action": "error",
      "better-react-hook-form/no-form-methods-object-in-deps": "error",
      "better-react-hook-form/no-nested-form-provider": "error",
      "better-react-hook-form/no-use-watch": "error",
      "better-react-hook-form/prefer-useformstate-over-formstate-context":
        "error",
      "better-react-hook-form/no-register-bracket-syntax": "error",
      "better-react-hook-form/no-stacked-usefieldarray-actions": "error",
      "better-react-hook-form/usefieldarray-require-field-id-key": "error",
    },
  },
  recommended: {
    plugins: ["better-react-hook-form"],
    rules: {
      "better-react-hook-form/destructuring-formstate": "error",
      "better-react-hook-form/no-deprecated-watch-callback": "error",
      "better-react-hook-form/no-double-register": "error",
      "better-react-hook-form/no-empty-usefieldarray-action": "error",
      "better-react-hook-form/no-form-methods-object-in-deps": "error",
      "better-react-hook-form/no-nested-form-provider": "error",
      "better-react-hook-form/no-use-watch": "error",
      "better-react-hook-form/prefer-useformstate-over-formstate-context":
        "error",
      "better-react-hook-form/no-register-bracket-syntax": "error",
      "better-react-hook-form/no-stacked-usefieldarray-actions": "error",
      "better-react-hook-form/usefieldarray-require-field-id-key": "error",
    },
  },
});

export default plugin;
