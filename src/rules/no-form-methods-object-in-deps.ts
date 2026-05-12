import type { TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../utils/createRule.js";
import {
  getReactHookFormImportInfo,
  isReactHookFormCall,
} from "../utils/reactHookFormImports.js";
import { getReactDependencyHookName } from "../utils/reactHooks.js";
import { getReactImportInfo } from "../utils/reactImports.js";

type MessageIds = "avoidWholeMethodsObject";
type Options = [];

export default createRule<Options, MessageIds>({
  name: "no-form-methods-object-in-deps",
  meta: {
    type: "problem",
    docs: {
      description:
        "disallow useForm() and useFormContext() method objects in React hook dependency arrays.",
      recommended: true,
      requiresTypeChecking: false,
      url: "https://github.com/nimaebrazeh/eslint-plugin-better-react-hook-form/blob/main/docs/rules/no-form-methods-object-in-deps.md",
    },
    messages: {
      avoidWholeMethodsObject:
        "Avoid using the entire react-hook-form methods object '{{name}}' in {{hook}} dependencies. Depend on the specific method you use instead.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const reactImportInfo = getReactImportInfo(context.sourceCode.ast);
    const reactHookFormImportInfo = getReactHookFormImportInfo(
      context.sourceCode.ast,
    );
    const methodsObjects = new Set<string>();

    function isMethodsObjectCall(
      callExpression: TSESTree.CallExpression,
    ): boolean {
      return (
        isReactHookFormCall(
          callExpression.callee,
          reactHookFormImportInfo,
          "useForm",
        ) ||
        isReactHookFormCall(
          callExpression.callee,
          reactHookFormImportInfo,
          "useFormContext",
        )
      );
    }

    return {
      VariableDeclarator(node) {
        if (
          node.id.type !== "Identifier" ||
          node.init == null ||
          node.init.type !== "CallExpression" ||
          !isMethodsObjectCall(node.init)
        ) {
          return;
        }

        methodsObjects.add(node.id.name);
      },
      CallExpression(node) {
        const hookName = getReactDependencyHookName(
          node.callee,
          reactImportInfo,
        );
        const dependencyArray = node.arguments[1];

        if (hookName == null || dependencyArray?.type !== "ArrayExpression") {
          return;
        }

        for (const element of dependencyArray.elements) {
          if (element?.type !== "Identifier") {
            continue;
          }

          if (!methodsObjects.has(element.name)) {
            continue;
          }

          context.report({
            node: element,
            messageId: "avoidWholeMethodsObject",
            data: {
              hook: hookName,
              name: element.name,
            },
          });
        }
      },
    };
  },
});
