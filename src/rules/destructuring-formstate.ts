import type { TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../utils/createRule.js";
import {
  getReactHookFormImportInfo,
  isReactHookFormCall,
} from "../utils/reactHookFormImports.js";

type MessageIds = "destructureFormState";
type Options = [];

function isTrackedMethodsObjectMember(
  node: TSESTree.MemberExpression,
  methodsObjects: ReadonlySet<string>,
): boolean {
  return (
    !node.computed &&
    node.object.type === "Identifier" &&
    methodsObjects.has(node.object.name) &&
    node.property.type === "Identifier" &&
    node.property.name === "formState"
  );
}

function isTrackedFormStatePropertyRead(
  node: TSESTree.MemberExpression,
  methodsObjects: ReadonlySet<string>,
  formStateBindings: ReadonlySet<string>,
): boolean {
  return (
    (node.object.type === "Identifier" &&
      formStateBindings.has(node.object.name)) ||
    (node.object.type === "MemberExpression" &&
      isTrackedMethodsObjectMember(node.object, methodsObjects))
  );
}

function trackFormStateBinding(
  value: TSESTree.Property["value"],
  formStateBindings: Set<string>,
): void {
  if (value.type === "Identifier") {
    formStateBindings.add(value.name);
    return;
  }

  if (value.type === "AssignmentPattern" && value.left.type === "Identifier") {
    formStateBindings.add(value.left.name);
  }
}

function handleMethodsObjectPattern(
  pattern: TSESTree.ObjectPattern,
  formStateBindings: Set<string>,
): void {
  for (const property of pattern.properties) {
    if (
      property.type !== "Property" ||
      property.key.type !== "Identifier" ||
      property.key.name !== "formState"
    ) {
      continue;
    }

    if (property.value.type === "ObjectPattern") {
      continue;
    }

    trackFormStateBinding(property.value, formStateBindings);
  }
}

export default createRule<Options, MessageIds>({
  name: "destructuring-formstate",
  meta: {
    type: "problem",
    docs: {
      description:
        "require destructuring formState properties instead of reading them from the proxy object.",
      recommended: true,
      requiresTypeChecking: false,
      url: "https://github.com/nimaebrazeh/eslint-plugin-better-react-hook-form/blob/main/docs/rules/destructuring-formstate.md",
    },
    messages: {
      destructureFormState:
        "Destructure '{{name}}' from formState so React Hook Form subscribes to that state during render.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const importInfo = getReactHookFormImportInfo(context.sourceCode.ast);
    const methodsObjects = new Set<string>();
    const formStateBindings = new Set<string>();

    function isTrackedUseFormCall(
      callee: TSESTree.CallExpression["callee"],
    ): boolean {
      return (
        isReactHookFormCall(callee, importInfo, "useForm") ||
        isReactHookFormCall(callee, importInfo, "useFormContext")
      );
    }

    return {
      VariableDeclarator(node) {
        if (
          node.init?.type === "CallExpression" &&
          isTrackedUseFormCall(node.init.callee)
        ) {
          if (node.id.type === "Identifier") {
            methodsObjects.add(node.id.name);
            return;
          }

          if (node.id.type === "ObjectPattern") {
            handleMethodsObjectPattern(node.id, formStateBindings);
          }

          return;
        }

        if (
          node.init?.type === "CallExpression" &&
          isReactHookFormCall(node.init.callee, importInfo, "useFormState")
        ) {
          if (node.id.type === "Identifier") {
            formStateBindings.add(node.id.name);
          }

          return;
        }

        if (
          node.init?.type === "Identifier" &&
          methodsObjects.has(node.init.name) &&
          node.id.type === "ObjectPattern"
        ) {
          handleMethodsObjectPattern(node.id, formStateBindings);
          return;
        }

        if (
          node.init?.type === "MemberExpression" &&
          isTrackedMethodsObjectMember(node.init, methodsObjects)
        ) {
          if (node.id.type === "Identifier") {
            formStateBindings.add(node.id.name);
          }

          return;
        }

        if (
          node.init?.type === "Identifier" &&
          formStateBindings.has(node.init.name) &&
          node.id.type === "Identifier"
        ) {
          formStateBindings.add(node.id.name);
        }
      },
      MemberExpression(node) {
        if (
          node.parent.type === "MemberExpression" &&
          node.parent.object === node
        ) {
          return;
        }

        if (
          node.computed ||
          node.property.type !== "Identifier" ||
          !isTrackedFormStatePropertyRead(
            node,
            methodsObjects,
            formStateBindings,
          )
        ) {
          return;
        }

        context.report({
          node: node.property,
          messageId: "destructureFormState",
          data: {
            name: node.property.name,
          },
        });
      },
    };
  },
});
