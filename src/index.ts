import type { BetterReactHookFormDocs } from "./utils/createRule.js";

import noDoubleRegister from "./rules/no-double-register.js";
import noEmptyUseFieldArrayAction from "./rules/no-empty-usefieldarray-action.js";
import noFormMethodsObjectInDeps from "./rules/no-form-methods-object-in-deps.js";
import noNestedFormProvider from "./rules/no-nested-form-provider.js";
import noRegisterBracketSyntax from "./rules/no-register-bracket-syntax.js";

const rules = {
  "no-double-register": noDoubleRegister,
  "no-empty-usefieldarray-action": noEmptyUseFieldArrayAction,
  "no-form-methods-object-in-deps": noFormMethodsObjectInDeps,
  "no-nested-form-provider": noNestedFormProvider,
  "no-register-bracket-syntax": noRegisterBracketSyntax,
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
      "better-react-hook-form/no-double-register": "error",
      "better-react-hook-form/no-empty-usefieldarray-action": "error",
      "better-react-hook-form/no-form-methods-object-in-deps": "error",
      "better-react-hook-form/no-nested-form-provider": "error",
      "better-react-hook-form/no-register-bracket-syntax": "error",
    },
  },
  recommended: {
    plugins: ["better-react-hook-form"],
    rules: {
      "better-react-hook-form/no-double-register": "error",
      "better-react-hook-form/no-empty-usefieldarray-action": "error",
      "better-react-hook-form/no-form-methods-object-in-deps": "error",
      "better-react-hook-form/no-nested-form-provider": "error",
      "better-react-hook-form/no-register-bracket-syntax": "error",
    },
  },
});

export default plugin;
