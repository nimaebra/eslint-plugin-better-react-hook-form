import { createRule } from "../utils/createRule.js";
import * as ast from "../utils/bindings.js";

export default createRule<[], "avoidBracketSyntax">({
  name: "no-register-bracket-syntax",
  meta: {
    type: "problem",
    docs: {
      description: "require dot syntax in register field paths.",
      recommended: true,
      requiresTypeChecking: false,
    },
    fixable: "code",
    schema: [],
    messages: {
      avoidBracketSyntax:
        "Use dot syntax in register paths instead of bracket syntax.",
    },
  },
  defaultOptions: [],
  create(context) {
    const code = context.sourceCode;

    function convert(path: string): string | null {
      const converted = path
        .replace(/\[(0|[1-9]\d*)\]/g, ".$1")
        .replace(/\[(['"])([A-Za-z_$][\w$]*)\1\]/g, ".$2");
      return /^[A-Za-z_$][\w$]*(?:\.(?:[A-Za-z_$][\w$]*|0|[1-9]\d*))*$/.test(
        converted,
      )
        ? converted
        : null;
    }
    return {
      CallExpression(node) {
        if (
          !ast.isHook(
            ast.origin(code, node.callee),
            ["useForm", "useFormContext"],
            ["register"],
          )
        )
          return;
        const arg = node.arguments[0];
        if (!arg || arg.type === "SpreadElement") return;
        // Do not fix aliases at their declaration; only the actual argument's literal.
        const expression = ast.unwrap(arg);
        const text =
          expression.type === "Literal" && typeof expression.value === "string"
            ? expression.value
            : expression.type === "TemplateLiteral"
              ? expression.quasis
                  .map((part) => part.value.cooked ?? part.value.raw)
                  .join("\0")
              : null;
        if (text === null || !/\[[^\]]+\]/.test(text)) return;
        const next = expression.type === "Literal" ? convert(text) : null;
        context.report({
          node: expression,
          messageId: "avoidBracketSyntax",
          fix:
            expression.type === "Literal" && next !== null
              ? (fixer) => {
                  const quote = code.getText(expression)[0];
                  const replacement =
                    quote === "'" ? "'" + next + "'" : JSON.stringify(next);
                  return fixer.replaceText(expression, replacement);
                }
              : undefined,
        });
      },
    };
  },
});
