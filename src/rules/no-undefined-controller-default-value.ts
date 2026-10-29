import { createRule } from "../utils/createRule.js";
import * as ast from "../utils/bindings.js";

export default createRule<[], "undefinedDefaultValue">({
  name: "no-undefined-controller-default-value",
  meta: {
    type: "problem",
    docs: {
      description: "disallow explicit undefined Controller defaults.",
      recommended: true,
      requiresTypeChecking: false,
    },
    schema: [],
    messages: {
      undefinedDefaultValue:
        "Use a defined Controller default value, or omit it and provide useForm.defaultValues.",
    },
  },
  defaultOptions: [],
  create(context) {
    const code = context.sourceCode;

    function report(prop: ast.StaticProperty) {
      if (prop.known && prop.value && ast.isUndefined(code, prop.value))
        context.report({
          node: prop.node ?? prop.value,
          messageId: "undefinedDefaultValue",
        });
    }
    return {
      CallExpression(node) {
        if (ast.isImport(code, node.callee, "react-hook-form", "useController"))
          report(ast.objectProperty(code, node.arguments[0], "defaultValue"));
      },
      JSXOpeningElement(node) {
        if (ast.isImport(code, node.name, "react-hook-form", "Controller"))
          report(ast.jsxProperty(code, node, "defaultValue"));
      },
    };
  },
});
