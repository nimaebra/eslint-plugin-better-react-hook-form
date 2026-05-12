import type { TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../utils/createRule.js";
import {
  getReactHookFormImportInfo,
  isReactHookFormCall,
} from "../utils/reactHookFormImports.js";

type MessageIds = "preferUseFormState";
type Options = [];

const subscribedFormStateProperties = new Set([
  "dirtyFields",
  "errors",
  "isDirty",
  "isValid",
  "isValidating",
  "touchedFields",
  "validatingFields",
]);

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

export default createRule<Options, MessageIds>({
  name: "prefer-useformstate-over-formstate-context",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "require useFormState() instead of formState subscriptions taken from useFormContext().",
      recommended: true,
      requiresTypeChecking: false,
      url: "https://github.com/nimaebrazeh/eslint-plugin-better-react-hook-form/blob/main/docs/rules/prefer-useformstate-over-formstate-context.md",
    },
    messages: {
      preferUseFormState:
        "Prefer useFormState() over useFormContext().formState when subscribing to '{{name}}'.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const importInfo = getReactHookFormImportInfo(context.sourceCode.ast);
    const methodsObjects = new Set<string>();
    const formStateBindings = new Set<string>();

    function reportSubscribedFormStateProperties(
      pattern: TSESTree.ObjectPattern,
    ): void {
      for (const property of pattern.properties) {
        if (
          property.type !== "Property" ||
          property.key.type !== "Identifier" ||
          !subscribedFormStateProperties.has(property.key.name)
        ) {
          continue;
        }

        context.report({
          node: property.key,
          messageId: "preferUseFormState",
          data: {
            name: property.key.name,
          },
        });
      }
    }

    function trackFormStateBinding(value: TSESTree.Property["value"]): void {
      if (value.type === "Identifier") {
        formStateBindings.add(value.name);
        return;
      }

      if (
        value.type === "AssignmentPattern" &&
        value.left.type === "Identifier"
      ) {
        formStateBindings.add(value.left.name);
      }
    }

    function handleMethodsObjectPattern(pattern: TSESTree.ObjectPattern): void {
      for (const property of pattern.properties) {
        if (
          property.type !== "Property" ||
          property.key.type !== "Identifier" ||
          property.key.name !== "formState"
        ) {
          continue;
        }

        if (property.value.type === "ObjectPattern") {
          reportSubscribedFormStateProperties(property.value);
          continue;
        }

        trackFormStateBinding(property.value);
      }
    }

    return {
      VariableDeclarator(node) {
        if (
          node.init?.type === "CallExpression" &&
          isReactHookFormCall(node.init.callee, importInfo, "useFormContext")
        ) {
          if (node.id.type === "Identifier") {
            methodsObjects.add(node.id.name);
            return;
          }

          if (node.id.type === "ObjectPattern") {
            handleMethodsObjectPattern(node.id);
          }

          return;
        }

        if (
          node.init?.type === "Identifier" &&
          methodsObjects.has(node.init.name)
        ) {
          if (node.id.type === "ObjectPattern") {
            handleMethodsObjectPattern(node.id);
          }

          return;
        }

        if (
          node.init?.type === "MemberExpression" &&
          isTrackedMethodsObjectMember(node.init, methodsObjects)
        ) {
          if (node.id.type === "Identifier") {
            formStateBindings.add(node.id.name);
            return;
          }

          if (node.id.type === "ObjectPattern") {
            reportSubscribedFormStateProperties(node.id);
          }

          return;
        }

        if (
          node.init?.type === "Identifier" &&
          formStateBindings.has(node.init.name)
        ) {
          if (node.id.type === "ObjectPattern") {
            reportSubscribedFormStateProperties(node.id);
          }
        }
      },
      MemberExpression(node) {
        if (
          node.computed ||
          node.property.type !== "Identifier" ||
          !subscribedFormStateProperties.has(node.property.name)
        ) {
          return;
        }

        if (
          (node.object.type === "Identifier" &&
            formStateBindings.has(node.object.name)) ||
          (node.object.type === "MemberExpression" &&
            isTrackedMethodsObjectMember(node.object, methodsObjects))
        ) {
          context.report({
            node: node.property,
            messageId: "preferUseFormState",
            data: {
              name: node.property.name,
            },
          });
        }
      },
    };
  },
});
