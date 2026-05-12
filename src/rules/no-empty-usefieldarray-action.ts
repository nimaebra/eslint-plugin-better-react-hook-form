import type { TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../utils/createRule.js";
import {
  getReactHookFormImportInfo,
  isReactHookFormCall,
} from "../utils/reactHookFormImports.js";

type MessageIds = "provideNonEmptyValue";
type Options = [];
type ActionName = "append" | "insert" | "prepend" | "update";

const actionNames = new Set<ActionName>([
  "append",
  "insert",
  "prepend",
  "update",
]);

function getPayloadIndex(actionName: ActionName): number {
  return actionName === "insert" || actionName === "update" ? 1 : 0;
}

function unwrapPayloadExpression(
  node: TSESTree.Expression,
): TSESTree.Expression {
  let currentNode = node;

  while (true) {
    if (
      currentNode.type === "TSAsExpression" ||
      currentNode.type === "TSTypeAssertion"
    ) {
      currentNode = currentNode.expression;
      continue;
    }

    return currentNode;
  }
}

export default createRule<Options, MessageIds>({
  name: "no-empty-usefieldarray-action",
  meta: {
    type: "problem",
    docs: {
      description:
        "require non-empty values for append(), prepend(), insert(), and update() returned by useFieldArray().",
      recommended: true,
      requiresTypeChecking: false,
      url: "https://github.com/nimaebrazeh/eslint-plugin-better-react-hook-form/blob/main/docs/rules/no-empty-usefieldarray-action.md",
    },
    messages: {
      provideNonEmptyValue:
        "{{action}}() from useFieldArray() requires a non-empty value argument.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const importInfo = getReactHookFormImportInfo(context.sourceCode.ast);
    const actionBindings = new Map<string, ActionName>();

    return {
      VariableDeclarator(node) {
        if (
          node.id.type !== "ObjectPattern" ||
          node.init?.type !== "CallExpression" ||
          !isReactHookFormCall(node.init.callee, importInfo, "useFieldArray")
        ) {
          return;
        }

        for (const property of node.id.properties) {
          if (
            property.type !== "Property" ||
            property.key.type !== "Identifier" ||
            !actionNames.has(property.key.name as ActionName)
          ) {
            continue;
          }

          if (property.value.type === "Identifier") {
            actionBindings.set(
              property.value.name,
              property.key.name as ActionName,
            );
          }
        }
      },
      CallExpression(node) {
        if (node.callee.type !== "Identifier") {
          return;
        }

        const actionName = actionBindings.get(node.callee.name);

        if (actionName == null) {
          return;
        }

        const payloadArgument = node.arguments[getPayloadIndex(actionName)];
        const unwrappedPayloadArgument =
          payloadArgument == null || payloadArgument.type === "SpreadElement"
            ? null
            : unwrapPayloadExpression(payloadArgument);

        if (
          payloadArgument == null ||
          (unwrappedPayloadArgument?.type === "ObjectExpression" &&
            unwrappedPayloadArgument.properties.length === 0)
        ) {
          context.report({
            node,
            messageId: "provideNonEmptyValue",
            data: {
              action: actionName,
            },
          });
        }
      },
    };
  },
});
