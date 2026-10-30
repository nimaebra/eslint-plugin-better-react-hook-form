import { createRule } from "../utils/createRule.js";
import * as ast from "../utils/bindings.js";

export default createRule<[], "undefinedValue">({
  name: "no-undefined-set-value",
  meta: {
    type: "problem",
    docs: {
      description: "require a defined value argument for setValue().",
      recommended: false,
      requiresTypeChecking: false,
    },
    schema: [],
    messages: {
      undefinedValue:
        "setValue() requires a defined value argument. Choose a value appropriate for the field.",
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
            ["setValue"],
          ) ||
          node.arguments.slice(0, 2).some((arg) => arg.type === "SpreadElement")
        )
          return;
        const value = node.arguments[1];
        if (!value || ast.isUndefined(code, value))
          context.report({ node: value ?? node, messageId: "undefinedValue" });
      },
    };
  },
});
