import type { TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../utils/createRule.js";
import {
  getReactHookFormImportInfo,
  isReactHookFormCall,
} from "../utils/reactHookFormImports.js";

type MessageIds = "avoidBracketSyntax";
type Options = [];

const bracketSyntaxPattern = /\[[^\]]+\]/;
const numericBracketSegmentPattern = /\[(\d+)\]/g;
const identifierBracketSegmentPattern = /\[['"]([A-Za-z_$][\w$]*)['"]\]/g;

function unwrapPathArgument(
  node: TSESTree.CallExpression["arguments"][0] | undefined,
): TSESTree.Expression | undefined {
  let current: TSESTree.Expression | undefined =
    node == null || node.type === "SpreadElement" ? undefined : node;

  while (
    current != null &&
    (current.type === "TSAsExpression" || current.type === "TSTypeAssertion")
  ) {
    current = current.expression;
  }

  return current;
}

function getStaticPathValue(
  node: TSESTree.CallExpression["arguments"][0] | undefined,
): string | null {
  const expression = unwrapPathArgument(node);

  if (expression == null) {
    return null;
  }

  if (expression.type === "Literal" && typeof expression.value === "string") {
    return expression.value;
  }

  if (
    expression.type === "TemplateLiteral" &&
    expression.expressions.length === 0
  ) {
    return expression.quasis[0]?.value.cooked ?? null;
  }

  return null;
}

function hasBracketSyntax(
  sourceCode: { getText(node: TSESTree.Node): string },
  node: TSESTree.CallExpression["arguments"][0] | undefined,
  staticPath: string | null,
): boolean {
  if (staticPath != null) {
    return bracketSyntaxPattern.test(staticPath);
  }

  const expression = unwrapPathArgument(node);

  return (
    expression?.type === "TemplateLiteral" &&
    bracketSyntaxPattern.test(sourceCode.getText(expression))
  );
}

function toDotSyntax(path: string): string | null {
  if (!bracketSyntaxPattern.test(path)) {
    return null;
  }

  const converted = path
    .replace(numericBracketSegmentPattern, ".$1")
    .replace(identifierBracketSegmentPattern, ".$1");

  if (converted.includes("[")) {
    return null;
  }

  return converted;
}

function replaceStringLiteral(
  node: TSESTree.Literal,
  nextValue: string,
): string {
  const raw = typeof node.raw === "string" ? node.raw : JSON.stringify("");
  const quote = raw.startsWith("'") ? "'" : '"';
  const escaped = nextValue
    .replaceAll("\\", "\\\\")
    .replaceAll(quote, `\\${quote}`);

  return `${quote}${escaped}${quote}`;
}

export default createRule<Options, MessageIds>({
  name: "no-register-bracket-syntax",
  meta: {
    type: "problem",
    docs: {
      description:
        "disallow bracket syntax in react-hook-form register field paths.",
      recommended: true,
      requiresTypeChecking: false,
      url: "https://github.com/nimaebrazeh/eslint-plugin-better-react-hook-form/blob/main/docs/rules/no-register-bracket-syntax.md",
    },
    fixable: "code",
    messages: {
      avoidBracketSyntax:
        "Use dot syntax in register paths instead of bracket syntax.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const importInfo = getReactHookFormImportInfo(context.sourceCode.ast);
    const registerNames = new Set<string>();
    const formMethodObjects = new Set<string>();

    function trackRegisterBinding(node: TSESTree.VariableDeclarator): void {
      if (
        node.init == null ||
        node.init.type !== "CallExpression" ||
        (!isReactHookFormCall(node.init.callee, importInfo, "useForm") &&
          !isReactHookFormCall(node.init.callee, importInfo, "useFormContext"))
      ) {
        return;
      }

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
          property.key.type !== "Identifier"
        ) {
          continue;
        }

        if (property.key.name !== "register") {
          continue;
        }

        if (property.value.type === "Identifier") {
          registerNames.add(property.value.name);
        }
      }
    }

    function reportPath(
      callExpression: TSESTree.CallExpression,
      argument: TSESTree.CallExpression["arguments"][0],
      path: string | null,
    ): void {
      const nextPath = path == null ? null : toDotSyntax(path);
      const expression = unwrapPathArgument(argument);

      context.report({
        node: expression ?? callExpression,
        messageId: "avoidBracketSyntax",
        fix:
          expression?.type === "Literal" &&
          typeof expression.value === "string" &&
          nextPath != null
            ? (fixer) =>
                fixer.replaceText(
                  argument,
                  replaceStringLiteral(expression, nextPath),
                )
            : undefined,
      });
    }

    return {
      VariableDeclarator: trackRegisterBinding,
      CallExpression(node) {
        const [firstArgument] = node.arguments;
        const path = getStaticPathValue(firstArgument);

        if (
          node.callee.type === "Identifier" &&
          registerNames.has(node.callee.name)
        ) {
          if (!hasBracketSyntax(context.sourceCode, firstArgument, path)) {
            return;
          }

          reportPath(node, firstArgument, path);
          return;
        }

        if (
          node.callee.type === "MemberExpression" &&
          !node.callee.computed &&
          node.callee.object.type === "Identifier" &&
          node.callee.property.type === "Identifier" &&
          formMethodObjects.has(node.callee.object.name) &&
          node.callee.property.name === "register"
        ) {
          if (!hasBracketSyntax(context.sourceCode, firstArgument, path)) {
            return;
          }

          reportPath(node, firstArgument, path);
        }
      },
    };
  },
});
