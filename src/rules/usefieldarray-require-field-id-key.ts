import type { TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../utils/createRule.js";
import {
  getReactHookFormImportInfo,
  isReactHookFormCall,
} from "../utils/reactHookFormImports.js";

type MessageIds = "useFieldIdKey";
type Options = [];

function isTrackedFieldsMap(
  callee: TSESTree.CallExpression["callee"],
  fieldsBindings: ReadonlySet<string>,
  fieldArrayObjects: ReadonlySet<string>,
): boolean {
  if (
    callee.type !== "MemberExpression" ||
    callee.computed ||
    callee.property.type !== "Identifier" ||
    callee.property.name !== "map"
  ) {
    return false;
  }

  if (
    callee.object.type === "Identifier" &&
    fieldsBindings.has(callee.object.name)
  ) {
    return true;
  }

  return (
    callee.object.type === "MemberExpression" &&
    !callee.object.computed &&
    callee.object.object.type === "Identifier" &&
    callee.object.property.type === "Identifier" &&
    fieldArrayObjects.has(callee.object.object.name) &&
    callee.object.property.name === "fields"
  );
}

function getReturnedOpeningElement(
  callback: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
): TSESTree.JSXOpeningElement | null {
  if (callback.body.type === "JSXElement") {
    return callback.body.openingElement;
  }

  if (callback.body.type !== "BlockStatement") {
    return null;
  }

  for (const statement of callback.body.body) {
    if (
      statement.type === "ReturnStatement" &&
      statement.argument?.type === "JSXElement"
    ) {
      return statement.argument.openingElement;
    }
  }

  return null;
}

function getKeyExpression(
  openingElement: TSESTree.JSXOpeningElement,
): TSESTree.Expression | null {
  for (const attribute of openingElement.attributes) {
    if (
      attribute.type !== "JSXAttribute" ||
      attribute.name.type !== "JSXIdentifier" ||
      attribute.name.name !== "key" ||
      attribute.value?.type !== "JSXExpressionContainer" ||
      attribute.value.expression.type === "JSXEmptyExpression"
    ) {
      continue;
    }

    return attribute.value.expression;
  }

  return null;
}

function isFieldIdExpression(
  expression: TSESTree.Expression,
  itemName: string,
): boolean {
  return (
    expression.type === "MemberExpression" &&
    !expression.computed &&
    expression.object.type === "Identifier" &&
    expression.object.name === itemName &&
    expression.property.type === "Identifier" &&
    expression.property.name === "id"
  );
}

export default createRule<Options, MessageIds>({
  name: "usefieldarray-require-field-id-key",
  meta: {
    type: "problem",
    docs: {
      description:
        "require rows rendered from useFieldArray().fields.map() to use field.id as their key.",
      recommended: true,
      requiresTypeChecking: false,
      url: "https://github.com/nimaebrazeh/eslint-plugin-better-react-hook-form/blob/main/docs/rules/usefieldarray-require-field-id-key.md",
    },
    messages: {
      useFieldIdKey:
        "Use {{item}}.id as the key for rows rendered from useFieldArray().fields.map().",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const importInfo = getReactHookFormImportInfo(context.sourceCode.ast);
    const fieldsBindings = new Set<string>();
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
            property.key.name !== "fields" ||
            property.value.type !== "Identifier"
          ) {
            continue;
          }

          fieldsBindings.add(property.value.name);
        }
      },
      CallExpression(node) {
        if (
          !isTrackedFieldsMap(node.callee, fieldsBindings, fieldArrayObjects)
        ) {
          return;
        }

        const callback = node.arguments[0];

        if (
          callback == null ||
          callback.type === "SpreadElement" ||
          (callback.type !== "ArrowFunctionExpression" &&
            callback.type !== "FunctionExpression") ||
          callback.params[0]?.type !== "Identifier"
        ) {
          return;
        }

        const openingElement = getReturnedOpeningElement(callback);

        if (openingElement == null) {
          return;
        }

        const keyExpression = getKeyExpression(openingElement);

        if (
          keyExpression == null ||
          isFieldIdExpression(keyExpression, callback.params[0].name)
        ) {
          return;
        }

        context.report({
          node: keyExpression,
          messageId: "useFieldIdKey",
          data: {
            item: callback.params[0].name,
          },
        });
      },
    };
  },
});
