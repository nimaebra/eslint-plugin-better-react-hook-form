import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils/createRule.js";
import * as ast from "../utils/bindings.js";

export default createRule<[], "useFieldIdKey">({
  name: "usefieldarray-require-field-id-key",
  meta: {
    type: "problem",
    docs: {
      description:
        "require the generated field-array identifier as each row's key.",
      recommended: true,
      requiresTypeChecking: false,
    },
    schema: [],
    messages: {
      useFieldIdKey:
        "Use the generated {{item}}.{{key}} as the key for rows rendered from useFieldArray().fields.map().",
    },
  },
  defaultOptions: [],
  create(context) {
    const code = context.sourceCode;
    function roots(
      node: TSESTree.Node,
    ): Array<TSESTree.JSXElement | TSESTree.JSXFragment> {
      node = ast.unwrap(node);
      if (node.type === "JSXElement" || node.type === "JSXFragment")
        return [node];
      if (node.type === "ConditionalExpression")
        return [...roots(node.consequent), ...roots(node.alternate)];
      return [];
    }
    function returns(
      node: TSESTree.Node,
    ): Array<TSESTree.JSXElement | TSESTree.JSXFragment> {
      if (node.type === "ReturnStatement")
        return node.argument ? roots(node.argument) : [];
      if (node.type === "BlockStatement") return node.body.flatMap(returns);
      if (node.type === "IfStatement")
        return [
          ...returns(node.consequent),
          ...(node.alternate ? returns(node.alternate) : []),
        ];
      return [];
    }
    return {
      CallExpression(node) {
        const member = ast.unwrap(node.callee);
        if (
          member.type !== "MemberExpression" ||
          ast.propertyName(member.property, member.computed) !== "map"
        )
          return;
        const fields = ast.origin(code, member.object);
        if (
          !ast.isHook(fields, ["useFieldArray"], ["fields"]) ||
          fields.call?.type !== "CallExpression"
        )
          return;
        const keyOption = ast.objectProperty(
          code,
          fields.call.arguments[0],
          "keyName",
        );
        if (!keyOption.known) return;
        let key = "id";
        if (keyOption.value && !ast.isUndefined(code, keyOption.value)) {
          const value = ast.valueExpression(code, keyOption.value);
          if (value.type !== "Literal" || typeof value.value !== "string")
            return;
          key = value.value;
        }
        const callback = node.arguments[0];
        if (
          !callback ||
          (callback.type !== "ArrowFunctionExpression" &&
            callback.type !== "FunctionExpression") ||
          !callback.params[0]
        )
          return;
        const param = callback.params[0];
        const indexParam = callback.params[1];
        const item = param.type === "Identifier" ? param.name : "field";
        const elements =
          callback.body.type === "BlockStatement"
            ? returns(callback.body)
            : roots(callback.body);
        function keyPath(
          input: TSESTree.Node,
          seen = new Set<TSESTree.Node>(),
        ): string[] | null {
          const value = ast.valueExpression(code, input);
          if (seen.has(value)) return null;
          const nextSeen = new Set(seen).add(value);
          if (value.type === "MemberExpression") {
            const base = keyPath(value.object, nextSeen);
            const property = ast.propertyName(value.property, value.computed);
            return base && property !== null ? [...base, property] : null;
          }
          if (value.type !== "Identifier") return null;
          const variable = ast.variableAt(code, value, value.name);
          if (!variable || !ast.isStable(code, variable)) return null;
          const def = variable?.defs[0];
          if (def?.type === "Parameter" && def.node === callback)
            return ast.bindingPath(param, value.name);
          if (def?.type === "Variable" && def.node.init) {
            const base = keyPath(def.node.init, nextSeen);
            const path = ast.bindingPath(def.node.id, value.name);
            return base && path ? [...base, ...path] : null;
          }
          return null;
        }
        function incorrectKey(input: TSESTree.Node): boolean {
          const path = keyPath(input);
          if (path) return path.length !== 1 || path[0] !== key;
          const value = ast.valueExpression(code, input);
          if (value.type === "Literal") return true;
          // The second map parameter is an index, even when aliased.
          if (
            value.type === "Identifier" &&
            indexParam?.type === "Identifier"
          ) {
            const variable = ast.variableAt(code, value, value.name);
            return (
              !!variable &&
              ast.isStable(code, variable) &&
              variable === ast.variableAt(code, indexParam, indexParam.name)
            );
          }
          return false;
        }
        for (const element of elements) {
          if (element.type === "JSXFragment") {
            context.report({
              node: element.openingFragment,
              messageId: "useFieldIdKey",
              data: { item, key },
            });
            continue;
          }
          const prop = ast.jsxProperty(code, element.openingElement, "key");
          if (!prop.known || (prop.value && !incorrectKey(prop.value)))
            continue;
          context.report({
            node: prop.node ?? element.openingElement,
            messageId: "useFieldIdKey",
            data: { item, key },
          });
        }
      },
    };
  },
});
