import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils/createRule.js";
import * as ast from "../utils/bindings.js";

/** Only direct statements/initializers in a function body are unconditional here. */
function functionBody(node: TSESTree.CallExpression) {
  let expression: TSESTree.Node = node;
  while (expression.parent && ast.unwrap(expression.parent) === node)
    expression = expression.parent;
  const parent = expression.parent;
  const statement =
    parent?.type === "VariableDeclarator" && parent.init === expression
      ? parent.parent
      : parent?.type === "ExpressionStatement"
        ? parent
        : null;
  const body = statement?.parent;
  const fn = body?.parent;
  if (
    body?.type !== "BlockStatement" ||
    !fn ||
    ![
      "FunctionDeclaration",
      "FunctionExpression",
      "ArrowFunctionExpression",
    ].includes(fn.type)
  )
    return null;
  // Do not report calls in code that cannot execute after a direct exit.
  for (const previous of body.body) {
    if (previous === statement) return body;
    if (
      previous.type === "ReturnStatement" ||
      previous.type === "ThrowStatement"
    )
      return null;
  }
  return null;
}

export default createRule<[], "duplicateFieldArray">({
  name: "no-duplicate-usefieldarray",
  meta: {
    type: "problem",
    docs: {
      description:
        "disallow duplicate field arrays for the same name and control.",
      recommended: false,
      requiresTypeChecking: false,
    },
    schema: [],
    messages: {
      duplicateFieldArray:
        "Use a single useFieldArray() instance for '{{name}}' on this control. Share its fields/actions or use useWatch() for read-only values.",
    },
  },
  defaultOptions: [],
  create(context) {
    const code = context.sourceCode;
    const instances = new Map<
      TSESTree.BlockStatement,
      Map<TSESTree.Node, Set<string>>
    >();
    return {
      CallExpression(node) {
        if (
          !ast.isImport(code, node.callee, "react-hook-form", "useFieldArray")
        )
          return;
        const body = functionBody(node);
        if (!body || node.arguments[0]?.type === "SpreadElement") return;
        const options = node.arguments[0];
        const disabled = ast.objectProperty(code, options, "disabled");
        if (!disabled.known) return;
        if (disabled.value && !ast.isUndefined(code, disabled.value)) {
          const value = ast.valueExpression(code, disabled.value);
          if (value.type !== "Literal" || value.value !== false) return;
        }
        const name = ast.objectProperty(code, options, "name");
        const control = ast.objectProperty(code, options, "control");
        if (!name.known || !name.value || !control.known || !control.value)
          return;
        const value = ast.valueExpression(code, name.value);
        const fieldName =
          value.type === "Literal" && typeof value.value === "string"
            ? value.value
            : value.type === "TemplateLiteral" && value.expressions.length === 0
              ? value.quasis[0].value.cooked
              : null;
        const binding = ast.origin(code, control.value);
        if (
          fieldName === null ||
          !ast.isHook(binding, ["useForm", "useFormContext"], ["control"])
        )
          return;
        let controls = instances.get(body);
        if (!controls) instances.set(body, (controls = new Map()));
        let names = controls.get(binding.call!);
        if (!names) controls.set(binding.call!, (names = new Set()));
        if (names.has(fieldName))
          context.report({
            node,
            messageId: "duplicateFieldArray",
            data: { name: fieldName },
          });
        names.add(fieldName);
      },
    };
  },
});
