import type { TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../utils/createRule.js";
import {
  getReactHookFormImportInfo,
  isReactHookFormCall,
  isReactHookFormJsxElement,
  type ReactHookFormImportInfo,
} from "../utils/reactHookFormImports.js";

type MessageIds = "avoidDoubleRegister";
type Options = [];

type ControllerRenderFunction =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionExpression;

function getFieldNamesFromControllerRenderParam(
  parameter: TSESTree.Parameter | undefined,
): Set<string> {
  const fieldNames = new Set<string>();

  if (parameter?.type !== "ObjectPattern") {
    return fieldNames;
  }

  for (const property of parameter.properties) {
    if (
      property.type !== "Property" ||
      property.key.type !== "Identifier" ||
      property.key.name !== "field"
    ) {
      continue;
    }

    if (property.value.type === "Identifier") {
      fieldNames.add(property.value.name);
    }
  }

  return fieldNames;
}

function getControllerRenderFunction(
  attribute: TSESTree.JSXAttribute,
): ControllerRenderFunction | null {
  if (
    attribute.name.type !== "JSXIdentifier" ||
    attribute.name.name !== "render" ||
    attribute.value?.type !== "JSXExpressionContainer"
  ) {
    return null;
  }

  const { expression } = attribute.value;

  return expression.type === "ArrowFunctionExpression" ||
    expression.type === "FunctionExpression"
    ? expression
    : null;
}

function isRegisterSpread(
  attribute: TSESTree.JSXAttribute | TSESTree.JSXSpreadAttribute,
  registerNames: ReadonlySet<string>,
  formMethodObjects: ReadonlySet<string>,
): attribute is TSESTree.JSXSpreadAttribute {
  if (attribute.type !== "JSXSpreadAttribute") {
    return false;
  }

  const { argument } = attribute;

  if (argument.type !== "CallExpression") {
    return false;
  }

  if (
    argument.callee.type === "Identifier" &&
    registerNames.has(argument.callee.name)
  ) {
    return true;
  }

  return (
    argument.callee.type === "MemberExpression" &&
    !argument.callee.computed &&
    argument.callee.object.type === "Identifier" &&
    argument.callee.property.type === "Identifier" &&
    formMethodObjects.has(argument.callee.object.name) &&
    argument.callee.property.name === "register"
  );
}

function isControllerFieldSpread(
  attribute: TSESTree.JSXAttribute | TSESTree.JSXSpreadAttribute,
  useControllerFieldNames: ReadonlySet<string>,
  renderFunctionFieldNames: ReadonlyMap<ControllerRenderFunction, Set<string>>,
  ancestors: readonly TSESTree.Node[],
): attribute is TSESTree.JSXSpreadAttribute {
  if (
    attribute.type !== "JSXSpreadAttribute" ||
    attribute.argument.type !== "Identifier"
  ) {
    return false;
  }

  if (useControllerFieldNames.has(attribute.argument.name)) {
    return true;
  }

  for (let index = ancestors.length - 1; index >= 0; index -= 1) {
    const ancestor = ancestors[index];

    if (
      ancestor.type !== "ArrowFunctionExpression" &&
      ancestor.type !== "FunctionExpression"
    ) {
      continue;
    }

    const fieldNames = renderFunctionFieldNames.get(ancestor);

    if (fieldNames?.has(attribute.argument.name)) {
      return true;
    }
  }

  return false;
}

function isControllerElement(
  openingElement: TSESTree.JSXOpeningElement,
  importInfo: ReactHookFormImportInfo,
): boolean {
  return isReactHookFormJsxElement(
    openingElement.name,
    importInfo,
    "Controller",
  );
}

export default createRule<Options, MessageIds>({
  name: "no-double-register",
  meta: {
    type: "problem",
    docs: {
      description:
        "disallow combining register() with useController() or Controller field props on the same element.",
      recommended: true,
      requiresTypeChecking: false,
      url: "https://github.com/nimaebrazeh/eslint-plugin-better-react-hook-form/blob/main/docs/rules/no-double-register.md",
    },
    messages: {
      avoidDoubleRegister:
        "Do not combine register() with useController() or Controller field props on the same element.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const importInfo = getReactHookFormImportInfo(context.sourceCode.ast);
    const formMethodObjects = new Set<string>();
    const registerNames = new Set<string>();
    const useControllerFieldNames = new Set<string>();
    const renderFunctionFieldNames = new Map<
      ControllerRenderFunction,
      Set<string>
    >();

    return {
      VariableDeclarator(node) {
        if (node.init?.type !== "CallExpression") {
          return;
        }

        if (
          isReactHookFormCall(node.init.callee, importInfo, "useForm") ||
          isReactHookFormCall(node.init.callee, importInfo, "useFormContext")
        ) {
          if (node.id.type === "Identifier") {
            formMethodObjects.add(node.id.name);
            return;
          }

          if (node.id.type !== "ObjectPattern") {
            return;
          }

          for (const property of node.id.properties) {
            if (
              property.type !== "Property" ||
              property.key.type !== "Identifier" ||
              property.key.name !== "register"
            ) {
              continue;
            }

            if (property.value.type === "Identifier") {
              registerNames.add(property.value.name);
            }
          }

          return;
        }

        if (
          !isReactHookFormCall(node.init.callee, importInfo, "useController") ||
          node.id.type !== "ObjectPattern"
        ) {
          return;
        }

        for (const property of node.id.properties) {
          if (
            property.type !== "Property" ||
            property.key.type !== "Identifier" ||
            property.key.name !== "field"
          ) {
            continue;
          }

          if (property.value.type === "Identifier") {
            useControllerFieldNames.add(property.value.name);
          }
        }
      },
      JSXOpeningElement(node) {
        if (isControllerElement(node, importInfo)) {
          for (const attribute of node.attributes) {
            if (attribute.type !== "JSXAttribute") {
              continue;
            }

            const renderFunction = getControllerRenderFunction(attribute);

            if (renderFunction == null) {
              continue;
            }

            const fieldNames = getFieldNamesFromControllerRenderParam(
              renderFunction.params[0],
            );

            if (fieldNames.size > 0) {
              renderFunctionFieldNames.set(renderFunction, fieldNames);
            }
          }
        }

        const ancestors = context.sourceCode.getAncestors(node);
        const controllerFieldSpread = node.attributes.find((attribute) =>
          isControllerFieldSpread(
            attribute,
            useControllerFieldNames,
            renderFunctionFieldNames,
            ancestors,
          ),
        );
        const registerSpread = node.attributes.find((attribute) =>
          isRegisterSpread(attribute, registerNames, formMethodObjects),
        );

        if (controllerFieldSpread == null || registerSpread == null) {
          return;
        }

        context.report({
          node: registerSpread.argument,
          messageId: "avoidDoubleRegister",
        });
      },
    };
  },
});
