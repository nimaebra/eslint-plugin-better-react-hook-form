import type { TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../utils/createRule.js";
import {
  getReactHookFormImportInfo,
  isReactHookFormJsxElement,
} from "../utils/reactHookFormImports.js";
import type { ReactHookFormImportInfo } from "../utils/reactHookFormImports.js";

type MessageIds = "avoidNestedProvider";
type Options = [];

function isFormProviderElement(
  node: TSESTree.JSXElement,
  importInfo: ReactHookFormImportInfo,
): boolean {
  return isReactHookFormJsxElement(
    node.openingElement.name,
    importInfo,
    "FormProvider",
  );
}

export default createRule<Options, MessageIds>({
  name: "no-nested-form-provider",
  meta: {
    type: "problem",
    docs: {
      description: "disallow nesting react-hook-form FormProvider components.",
      recommended: true,
      requiresTypeChecking: false,
      url: "https://github.com/nimaebrazeh/eslint-plugin-better-react-hook-form/blob/main/docs/rules/no-nested-form-provider.md",
    },
    messages: {
      avoidNestedProvider:
        "Avoid nesting react-hook-form FormProvider components.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const importInfo = getReactHookFormImportInfo(context.sourceCode.ast);

    return {
      JSXElement(node) {
        if (!isFormProviderElement(node, importInfo)) {
          return;
        }

        const ancestors = context.sourceCode.getAncestors(node);

        for (const ancestor of ancestors) {
          if (
            ancestor.type === "JSXElement" &&
            isFormProviderElement(ancestor, importInfo)
          ) {
            context.report({
              node: node.openingElement.name,
              messageId: "avoidNestedProvider",
            });
            return;
          }
        }
      },
    };
  },
});
