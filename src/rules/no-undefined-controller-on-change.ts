import { createRule } from "../utils/createRule.js";
import * as ast from "../utils/bindings.js";

export default createRule<[], "undefinedChangeValue">({
  name: "no-undefined-controller-on-change",
  meta: {
    type: "problem",
    docs: {
      description: "require a defined value for Controller field.onChange().",
      recommended: false,
      requiresTypeChecking: false,
    },
    schema: [],
    messages: {
      undefinedChangeValue:
        "Controller field.onChange() requires a defined value or change event. Choose a cleared value appropriate for the field.",
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
            ["useController", "Controller"],
            ["field", "onChange"],
          )
        )
          return;
        const value = node.arguments[0];
        if (value?.type === "SpreadElement") return;
        if (!value || ast.isUndefined(code, value))
          context.report({
            node: value ?? node,
            messageId: "undefinedChangeValue",
          });
      },
    };
  },
});
