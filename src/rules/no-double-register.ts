import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils/createRule.js";
import * as ast from "../utils/bindings.js";

export default createRule<[], "avoidDoubleRegister">({
  name: "no-double-register",
  meta: {
    type: "problem",
    docs: {
      description:
        "disallow register() and Controller field props on the same element.",
      recommended: true,
      requiresTypeChecking: false,
    },
    schema: [],
    messages: {
      avoidDoubleRegister:
        "Do not combine register() with useController() or Controller field props on the same element.",
    },
  },
  defaultOptions: [],
  create(context) {
    const code = context.sourceCode;

    return {
      JSXOpeningElement(node) {
        const spreads = node.attributes.filter(
          (attr): attr is TSESTree.JSXSpreadAttribute =>
            attr.type === "JSXSpreadAttribute",
        );
        const field = spreads.some((attr) =>
          ast.isHook(
            ast.origin(code, attr.argument),
            ["useController", "Controller"],
            ["field"],
          ),
        );
        if (!field) return;
        const register = spreads.find((attr) => {
          const value = ast.unwrap(attr.argument);
          return (
            value.type === "CallExpression" &&
            ast.isHook(
              ast.origin(code, value.callee),
              ["useForm", "useFormContext"],
              ["register"],
            )
          );
        });
        if (register)
          context.report({
            node: register.argument,
            messageId: "avoidDoubleRegister",
          });
      },
    };
  },
});
