import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils/createRule.js";
import * as ast from "../utils/bindings.js";

export default createRule<[], "preferUseFormState">({
  name: "prefer-useformstate-over-formstate-context",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "require useFormState() for context form-state subscriptions.",
      recommended: false,
      requiresTypeChecking: false,
    },
    schema: [],
    messages: {
      preferUseFormState:
        "Prefer useFormState() over useFormContext().formState when subscribing to '{{name}}'.",
    },
  },
  defaultOptions: [],
  create(context) {
    const code = context.sourceCode;

    const properties = new Set([
      "dirtyFields",
      "errors",
      "isDirty",
      "isValid",
      "isValidating",
      "touchedFields",
      "validatingFields",
    ]);
    function checkPattern(pattern: TSESTree.Node, path: string[]) {
      if (pattern.type !== "ObjectPattern") return;
      for (const prop of pattern.properties) {
        if (prop.type !== "Property") continue;
        const name = ast.propertyName(prop.key, prop.computed);
        if (!name) continue;
        if (
          path.length === 1 &&
          path[0] === "formState" &&
          properties.has(name)
        )
          context.report({
            node: prop.key,
            messageId: "preferUseFormState",
            data: { name },
          });
        else checkPattern(prop.value, [...path, name]);
      }
    }
    return {
      VariableDeclarator(node) {
        if (!node.init) return;
        const binding = ast.origin(code, node.init);
        if (
          binding?.name === "useFormContext" &&
          ast.isHook({ ...binding, path: [] }, ["useFormContext"])
        )
          checkPattern(node.id, binding.path);
      },
      MemberExpression(node) {
        const name = ast.propertyName(node.property, node.computed);
        if (
          name &&
          properties.has(name) &&
          ast.isHook(
            ast.origin(code, node.object),
            ["useFormContext"],
            ["formState"],
          )
        )
          context.report({
            node: node.property,
            messageId: "preferUseFormState",
            data: { name },
          });
      },
    };
  },
});
