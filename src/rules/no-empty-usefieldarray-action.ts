import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils/createRule.js";
import * as ast from "../utils/bindings.js";

export default createRule<[], "provideNonEmptyValue">({
  name: "no-empty-usefieldarray-action",
  meta: {
    type: "problem",
    docs: {
      description: "require non-empty row values for useFieldArray actions.",
      recommended: true,
      requiresTypeChecking: false,
    },
    schema: [],
    messages: {
      provideNonEmptyValue:
        "{{action}}() from useFieldArray() requires a non-empty value argument.",
    },
  },
  defaultOptions: [],
  create(context) {
    const code = context.sourceCode;

    function empty(
      node: TSESTree.Node,
      seen = new Set<TSESTree.Node>(),
    ): boolean {
      const value = ast.valueExpression(code, node);
      if (seen.has(value)) return false;
      const nextSeen = new Set(seen).add(value);
      return (
        ast.isUndefined(code, value) ||
        (value.type === "Literal" && value.value === null) ||
        (value.type === "ObjectExpression" && value.properties.length === 0) ||
        (value.type === "ArrayExpression" &&
          value.elements.some((item) => item && empty(item, nextSeen)))
      );
    }
    return {
      CallExpression(node) {
        const binding = ast.origin(code, node.callee);
        if (
          !binding ||
          binding.path.length !== 1 ||
          !["append", "prepend", "insert", "update"].includes(
            binding.path[0],
          ) ||
          !ast.isHook({ ...binding, path: [] }, ["useFieldArray"])
        )
          return;
        const action = binding.path[0];
        const index = action === "insert" || action === "update" ? 1 : 0;
        // A spread before the payload makes argument positions unknowable.
        if (
          node.arguments
            .slice(0, index + 1)
            .some((arg) => arg.type === "SpreadElement")
        )
          return;
        const payload = node.arguments[index];
        if (!payload || empty(payload))
          context.report({
            node,
            messageId: "provideNonEmptyValue",
            data: { action },
          });
      },
    };
  },
});
