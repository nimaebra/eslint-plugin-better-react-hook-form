import { createRule } from "../utils/createRule.js";
import * as ast from "../utils/bindings.js";

export default createRule<[], "avoidWholeMethodsObject">({
  name: "no-form-methods-object-in-deps",
  meta: {
    type: "problem",
    docs: {
      description:
        "disallow whole form method objects in React hook dependency arrays.",
      recommended: true,
      requiresTypeChecking: false,
    },
    schema: [],
    messages: {
      avoidWholeMethodsObject:
        "Avoid using the entire react-hook-form methods object '{{name}}' in {{hook}} dependencies. Depend on the specific method you use instead.",
    },
  },
  defaultOptions: [],
  create(context) {
    const code = context.sourceCode;

    return {
      CallExpression(node) {
        const hook = ast.origin(code, node.callee);
        if (
          hook?.source !== "react" ||
          hook.call ||
          hook.path.length ||
          !["useEffect", "useLayoutEffect", "useMemo", "useCallback"].includes(
            hook.name,
          )
        )
          return;
        const deps = node.arguments[1];
        if (deps?.type !== "ArrayExpression") return;
        for (const item of deps.elements) {
          if (
            item?.type === "Identifier" &&
            ast.isHook(ast.origin(code, item), ["useForm", "useFormContext"])
          ) {
            context.report({
              node: item,
              messageId: "avoidWholeMethodsObject",
              data: { name: item.name, hook: hook.name },
            });
          }
        }
      },
    };
  },
});
