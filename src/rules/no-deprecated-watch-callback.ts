import { createRule } from "../utils/createRule.js";
import * as ast from "../utils/bindings.js";

export default createRule<[], "useSubscribeInstead">({
  name: "no-deprecated-watch-callback",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "disallow the deprecated watch(callback) overload and prefer subscribe().",
      recommended: true,
      requiresTypeChecking: false,
    },
    schema: [],
    messages: {
      useSubscribeInstead:
        "watch(callback) is deprecated in react-hook-form. Use subscribe() for subscription-style updates instead.",
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
            ["watch"],
          )
        )
          return;
        const callback = node.arguments[0];
        if (callback && ast.isFunction(code, callback))
          context.report({ node: callback, messageId: "useSubscribeInstead" });
      },
    };
  },
});
