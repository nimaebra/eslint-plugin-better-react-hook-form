import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils/createRule.js";
import * as ast from "../utils/bindings.js";

export default createRule<[], "avoidStackingActions">({
  name: "no-stacked-usefieldarray-actions",
  meta: {
    type: "suggestion",
    docs: {
      description: "disallow consecutive actions on the same field array.",
      recommended: false,
      requiresTypeChecking: false,
    },
    schema: [],
    messages: {
      avoidStackingActions:
        "Avoid stacking multiple actions on the same useFieldArray() instance. Move {{action}}() into a later render/effect or a separate callback.",
    },
  },
  defaultOptions: [],
  create(context) {
    const code = context.sourceCode;

    const actions = new Set([
      "append",
      "prepend",
      "insert",
      "remove",
      "swap",
      "move",
      "update",
      "replace",
    ]);
    return {
      "BlockStatement:exit"(node) {
        const seen = new Set<TSESTree.Node>();
        for (const statement of node.body) {
          const call =
            statement.type === "ExpressionStatement"
              ? ast.unwrap(statement.expression)
              : null;
          const binding =
            call?.type === "CallExpression"
              ? ast.origin(code, call.callee)
              : null;
          if (
            !call ||
            !binding?.call ||
            binding.path.length !== 1 ||
            !actions.has(binding.path[0]) ||
            !ast.isHook({ ...binding, path: [] }, ["useFieldArray"])
          ) {
            seen.clear();
            continue;
          }
          if (seen.has(binding.call))
            context.report({
              node: call,
              messageId: "avoidStackingActions",
              data: { action: binding.path[0] },
            });
          seen.add(binding.call);
        }
      },
    };
  },
});
