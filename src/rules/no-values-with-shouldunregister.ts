import type { TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../utils/createRule.js";
import {
  getReactHookFormImportInfo,
  isReactHookFormCall,
} from "../utils/reactHookFormImports.js";

type MessageIds = "avoidValuesWithShouldUnregister";
type Options = [];

function unwrapExpression(
  expression: TSESTree.Expression,
): TSESTree.Expression {
  let currentExpression = expression;

  while (true) {
    if (
      currentExpression.type === "TSAsExpression" ||
      currentExpression.type === "TSTypeAssertion"
    ) {
      currentExpression = currentExpression.expression;
      continue;
    }

    return currentExpression;
  }
}

function getPropertyName(property: TSESTree.Property): string | null {
  if (!property.computed && property.key.type === "Identifier") {
    return property.key.name;
  }

  if (
    property.key.type === "Literal" &&
    typeof property.key.value === "string"
  ) {
    return property.key.value;
  }

  return null;
}

function isBooleanTrue(expression: TSESTree.Property["value"]): boolean {
  if (
    expression.type === "AssignmentPattern" ||
    expression.type === "TSEmptyBodyFunctionExpression"
  ) {
    return false;
  }

  const unwrappedExpression = unwrapExpression(expression);

  return (
    unwrappedExpression.type === "Literal" && unwrappedExpression.value === true
  );
}

function hasValuesOption(options: TSESTree.ObjectExpression): boolean {
  for (const property of options.properties) {
    if (property.type !== "Property") {
      continue;
    }

    if (getPropertyName(property) !== "values") {
      continue;
    }

    if (
      property.value.type === "Identifier" &&
      property.value.name === "undefined"
    ) {
      continue;
    }

    return true;
  }

  return false;
}

function getShouldUnregisterTrueProperty(
  options: TSESTree.ObjectExpression,
): TSESTree.Property | null {
  for (const property of options.properties) {
    if (property.type !== "Property") {
      continue;
    }

    if (getPropertyName(property) !== "shouldUnregister") {
      continue;
    }

    if (isBooleanTrue(property.value)) {
      return property;
    }
  }

  return null;
}

export default createRule<Options, MessageIds>({
  name: "no-values-with-shouldunregister",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "disallow combining useForm() values with shouldUnregister: true.",
      recommended: false,
      requiresTypeChecking: false,
      url: "https://github.com/nimaebrazeh/eslint-plugin-better-react-hook-form/blob/main/docs/rules/no-values-with-shouldunregister.md",
    },
    messages: {
      avoidValuesWithShouldUnregister:
        "Avoid combining useForm() values with shouldUnregister: true. Prefer defaultValues, reset(), or setValue() for externally synchronized state.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const importInfo = getReactHookFormImportInfo(context.sourceCode.ast);

    return {
      CallExpression(node) {
        if (!isReactHookFormCall(node.callee, importInfo, "useForm")) {
          return;
        }

        const optionsArgument = node.arguments[0];

        if (
          optionsArgument == null ||
          optionsArgument.type === "SpreadElement"
        ) {
          return;
        }

        const unwrappedOptionsArgument = unwrapExpression(optionsArgument);

        if (unwrappedOptionsArgument.type !== "ObjectExpression") {
          return;
        }

        const shouldUnregisterProperty = getShouldUnregisterTrueProperty(
          unwrappedOptionsArgument,
        );

        if (
          shouldUnregisterProperty == null ||
          !hasValuesOption(unwrappedOptionsArgument)
        ) {
          return;
        }

        context.report({
          node: shouldUnregisterProperty,
          messageId: "avoidValuesWithShouldUnregister",
        });
      },
    };
  },
});
