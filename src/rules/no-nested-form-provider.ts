import { createRule } from "../utils/createRule.js";
import * as ast from "../utils/bindings.js";

export default createRule<[], "avoidNestedProvider">({
  name: "no-nested-form-provider",
  meta: {
    type: "suggestion",
    docs: {
      description: "disallow nesting React Hook Form providers.",
      recommended: true,
      requiresTypeChecking: false,
    },
    schema: [],
    messages: {
      avoidNestedProvider:
        "Avoid nesting react-hook-form FormProvider components.",
    },
  },
  defaultOptions: [],
  create(context) {
    const code = context.sourceCode;

    return {
      JSXElement(node) {
        if (
          !ast.isImport(
            code,
            node.openingElement.name,
            "react-hook-form",
            "FormProvider",
          )
        )
          return;
        if (
          code
            .getAncestors(node)
            .some(
              (parent) =>
                parent.type === "JSXElement" &&
                ast.isImport(
                  code,
                  parent.openingElement.name,
                  "react-hook-form",
                  "FormProvider",
                ),
            )
        ) {
          context.report({
            node: node.openingElement.name,
            messageId: "avoidNestedProvider",
          });
        }
      },
    };
  },
});
