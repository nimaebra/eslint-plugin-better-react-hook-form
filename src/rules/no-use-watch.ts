import type { TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../utils/createRule.js";
import {
  getReactHookFormImportInfo,
  isReactHookFormCall,
} from "../utils/reactHookFormImports.js";

type MessageIds = "useUseWatchInstead";
type Options = [];

function isTrackedMethodsWatchMember(
  node: TSESTree.MemberExpression,
  methodsObjects: ReadonlySet<string>,
): boolean {
  return (
    !node.computed &&
    node.object.type === "Identifier" &&
    methodsObjects.has(node.object.name) &&
    node.property.type === "Identifier" &&
    node.property.name === "watch"
  );
}

function trackWatchBinding(
  value: TSESTree.Property["value"],
  watchBindings: Set<string>,
): void {
  if (value.type === "Identifier") {
    watchBindings.add(value.name);
    return;
  }

  if (value.type === "AssignmentPattern" && value.left.type === "Identifier") {
    watchBindings.add(value.left.name);
  }
}

function isTrackedHookCall(
  callee: TSESTree.CallExpression["callee"],
  importInfo: ReturnType<typeof getReactHookFormImportInfo>,
): boolean {
  return (
    isReactHookFormCall(callee, importInfo, "useForm") ||
    isReactHookFormCall(callee, importInfo, "useFormContext")
  );
}

export default createRule<Options, MessageIds>({
  name: "no-use-watch",
  meta: {
    type: "problem",
    docs: {
      description:
        "disallow the watch() method and require useWatch() instead.",
      recommended: true,
      requiresTypeChecking: false,
      url: "https://github.com/nimaebrazeh/eslint-plugin-better-react-hook-form/blob/main/docs/rules/no-use-watch.md",
    },
    messages: {
      useUseWatchInstead:
        "Do not use watch(). Prefer useWatch() so subscriptions remain stable with React Compiler.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const importInfo = getReactHookFormImportInfo(context.sourceCode.ast);
    const methodsObjects = new Set<string>();
    const watchBindings = new Set<string>();

    return {
      VariableDeclarator(node) {
        if (
          node.init?.type === "CallExpression" &&
          isTrackedHookCall(node.init.callee, importInfo)
        ) {
          if (node.id.type === "Identifier") {
            methodsObjects.add(node.id.name);
            return;
          }

          if (node.id.type !== "ObjectPattern") {
            return;
          }

          for (const property of node.id.properties) {
            if (
              property.type !== "Property" ||
              property.key.type !== "Identifier" ||
              property.key.name !== "watch"
            ) {
              continue;
            }

            context.report({
              node: property.key,
              messageId: "useUseWatchInstead",
            });
            trackWatchBinding(property.value, watchBindings);
          }

          return;
        }

        if (
          node.init?.type === "MemberExpression" &&
          isTrackedMethodsWatchMember(node.init, methodsObjects)
        ) {
          if (node.id.type === "Identifier") {
            watchBindings.add(node.id.name);
          }

          context.report({
            node: node.init.property,
            messageId: "useUseWatchInstead",
          });
        }
      },
      MemberExpression(node) {
        if (
          node.parent.type === "VariableDeclarator" &&
          node.parent.init === node
        ) {
          return;
        }

        if (isTrackedMethodsWatchMember(node, methodsObjects)) {
          context.report({
            node: node.property,
            messageId: "useUseWatchInstead",
          });

          return;
        }

        if (
          node.object.type === "Identifier" &&
          watchBindings.has(node.object.name) &&
          node.property.type === "Identifier" &&
          (node.parent.type !== "VariableDeclarator" ||
            node.parent.init !== node)
        ) {
          context.report({
            node: node.object,
            messageId: "useUseWatchInstead",
          });
        }
      },
      CallExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          watchBindings.has(node.callee.name)
        ) {
          context.report({
            node: node.callee,
            messageId: "useUseWatchInstead",
          });
        }
      },
    };
  },
});
