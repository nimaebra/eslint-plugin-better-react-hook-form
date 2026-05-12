import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../utils/createRule.js";
import {
  getReactHookFormImportInfo,
  isReactHookFormCall,
} from "../utils/reactHookFormImports.js";

type MessageIds = "useSubscribeInstead";
type Options = [];

function findVariable(
  scope: TSESLint.Scope.Scope | null,
  name: string,
): TSESLint.Scope.Variable | null {
  let currentScope = scope;

  while (currentScope != null) {
    const variable = currentScope.set.get(name);

    if (variable != null) {
      return variable;
    }

    currentScope = currentScope.upper;
  }

  return null;
}

function isFunctionReference(
  argument: TSESTree.CallExpressionArgument,
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
): boolean {
  if (
    argument.type === "ArrowFunctionExpression" ||
    argument.type === "FunctionExpression"
  ) {
    return true;
  }

  if (argument.type !== "Identifier") {
    return false;
  }

  const variable = findVariable(
    context.sourceCode.getScope(argument),
    argument.name,
  );

  return (
    variable?.defs.some((definition) => {
      if (definition.type === "FunctionName") {
        return true;
      }

      return (
        definition.type === "Variable" &&
        definition.node.init != null &&
        (definition.node.init.type === "ArrowFunctionExpression" ||
          definition.node.init.type === "FunctionExpression")
      );
    }) ?? false
  );
}

export default createRule<Options, MessageIds>({
  name: "no-deprecated-watch-callback",
  meta: {
    type: "problem",
    docs: {
      description:
        "disallow the deprecated watch(callback) overload and prefer subscribe().",
      recommended: true,
      requiresTypeChecking: false,
      url: "https://github.com/nimaebrazeh/eslint-plugin-better-react-hook-form/blob/main/docs/rules/no-deprecated-watch-callback.md",
    },
    messages: {
      useSubscribeInstead:
        "watch(callback) is deprecated in react-hook-form. Use subscribe() for subscription-style updates instead.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const importInfo = getReactHookFormImportInfo(context.sourceCode.ast);
    const methodsObjects = new Set<string>();
    const watchBindings = new Set<string>();

    function isTrackedWatchCall(
      callee: TSESTree.CallExpression["callee"],
    ): boolean {
      if (callee.type === "Identifier") {
        return watchBindings.has(callee.name);
      }

      return (
        callee.type === "MemberExpression" &&
        !callee.computed &&
        callee.object.type === "Identifier" &&
        callee.property.type === "Identifier" &&
        methodsObjects.has(callee.object.name) &&
        callee.property.name === "watch"
      );
    }

    return {
      VariableDeclarator(node) {
        if (
          node.init?.type !== "CallExpression" ||
          (!isReactHookFormCall(node.init.callee, importInfo, "useForm") &&
            !isReactHookFormCall(
              node.init.callee,
              importInfo,
              "useFormContext",
            ))
        ) {
          return;
        }

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
            property.key.name !== "watch" ||
            property.value.type !== "Identifier"
          ) {
            continue;
          }

          watchBindings.add(property.value.name);
        }
      },
      CallExpression(node) {
        if (!isTrackedWatchCall(node.callee)) {
          return;
        }

        const callbackArgument = node.arguments[0];

        if (
          callbackArgument == null ||
          !isFunctionReference(callbackArgument, context)
        ) {
          return;
        }

        context.report({
          node: callbackArgument,
          messageId: "useSubscribeInstead",
        });
      },
    };
  },
});
