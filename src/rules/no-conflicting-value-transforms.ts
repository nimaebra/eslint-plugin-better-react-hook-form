import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils/createRule.js";
import * as ast from "../utils/bindings.js";

export default createRule<[], "conflictingTransforms">({
  name: "no-conflicting-value-transforms",
  meta: {
    type: "problem",
    docs: {
      description: "disallow conflicting register value transforms.",
      recommended: true,
      requiresTypeChecking: false,
    },
    schema: [],
    messages: {
      conflictingTransforms:
        "Choose one value transform: valueAsNumber, valueAsDate, or setValueAs. The other transform is ignored.",
    },
  },
  defaultOptions: [],
  create(context) {
    const code = context.sourceCode;

    return {
      CallExpression(node) {
        if (
          !ast.isHook(
            ast.origin(code, node.callee),
            ["useForm", "useFormContext"],
            ["register"],
          )
        )
          return;
        const options = node.arguments[1];
        if (!options || options.type === "SpreadElement") return;
        const number = ast.objectProperty(code, options, "valueAsNumber");
        const date = ast.objectProperty(code, options, "valueAsDate");
        const custom = ast.objectProperty(code, options, "setValueAs");
        const enabled = (prop: ast.StaticProperty) =>
          prop.known &&
          prop.value &&
          ast.valueExpression(code, prop.value).type === "Literal" &&
          (ast.valueExpression(code, prop.value) as TSESTree.Literal).value ===
            true;
        if (
          (enabled(number) && enabled(date)) ||
          ((enabled(number) || enabled(date)) &&
            custom.known &&
            custom.value &&
            ast.isFunction(code, custom.value))
        )
          context.report({ node: options, messageId: "conflictingTransforms" });
      },
    };
  },
});
