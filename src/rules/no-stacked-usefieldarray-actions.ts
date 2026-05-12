import type { TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../utils/createRule.js";
import {
  getReactHookFormImportInfo,
  isReactHookFormCall,
} from "../utils/reactHookFormImports.js";

type MessageIds = "avoidStackingActions";
type Options = [];
type ActionName =
  | "append"
  | "insert"
  | "move"
  | "prepend"
  | "remove"
  | "replace"
  | "swap"
  | "update";

const actionNames = new Set<ActionName>([
  "append",
  "insert",
  "move",
  "prepend",
  "remove",
  "replace",
  "swap",
  "update",
]);

function getTrackedActionName(
  callee: TSESTree.CallExpression["callee"],
  actionBindings: ReadonlyMap<string, ActionName>,
  fieldArrayObjects: ReadonlySet<string>,
): ActionName | null {
  if (callee.type === "Identifier") {
    return actionBindings.get(callee.name) ?? null;
  }

  if (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.object.type === "Identifier" &&
    callee.property.type === "Identifier" &&
    fieldArrayObjects.has(callee.object.name) &&
    actionNames.has(callee.property.name as ActionName)
  ) {
    return callee.property.name as ActionName;
  }

  return null;
}

export default createRule<Options, MessageIds>({
  name: "no-stacked-usefieldarray-actions",
  meta: {
    type: "problem",
    docs: {
      description:
        "disallow stacking multiple useFieldArray() actions in the same synchronous block.",
      recommended: true,
      requiresTypeChecking: false,
      url: "https://github.com/nimaebrazeh/eslint-plugin-better-react-hook-form/blob/main/docs/rules/no-stacked-usefieldarray-actions.md",
    },
    messages: {
      avoidStackingActions:
        "Avoid stacking multiple useFieldArray() actions in the same synchronous block. Move {{action}}() into a later render/effect or a separate callback.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const importInfo = getReactHookFormImportInfo(context.sourceCode.ast);
    const actionBindings = new Map<string, ActionName>();
    const fieldArrayObjects = new Set<string>();

    return {
      VariableDeclarator(node) {
        if (
          node.init?.type !== "CallExpression" ||
          !isReactHookFormCall(node.init.callee, importInfo, "useFieldArray")
        ) {
          return;
        }

        if (node.id.type === "Identifier") {
          fieldArrayObjects.add(node.id.name);
          return;
        }

        if (node.id.type !== "ObjectPattern") {
          return;
        }

        for (const property of node.id.properties) {
          if (
            property.type !== "Property" ||
            property.key.type !== "Identifier" ||
            !actionNames.has(property.key.name as ActionName) ||
            property.value.type !== "Identifier"
          ) {
            continue;
          }

          actionBindings.set(
            property.value.name,
            property.key.name as ActionName,
          );
        }
      },
      BlockStatement(node) {
        const trackedCalls: Array<{
          actionName: ActionName;
          callExpression: TSESTree.CallExpression;
        }> = [];

        for (const statement of node.body) {
          if (
            statement.type !== "ExpressionStatement" ||
            statement.expression.type !== "CallExpression"
          ) {
            continue;
          }

          const actionName = getTrackedActionName(
            statement.expression.callee,
            actionBindings,
            fieldArrayObjects,
          );

          if (actionName == null) {
            continue;
          }

          trackedCalls.push({
            actionName,
            callExpression: statement.expression,
          });
        }

        if (trackedCalls.length < 2) {
          return;
        }

        for (const trackedCall of trackedCalls.slice(1)) {
          context.report({
            node: trackedCall.callExpression,
            messageId: "avoidStackingActions",
            data: {
              action: trackedCall.actionName,
            },
          });
        }
      },
    };
  },
});
