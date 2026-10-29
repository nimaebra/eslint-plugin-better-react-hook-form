import { ASTUtils } from "@typescript-eslint/utils";
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type SourceCode = TSESLint.SourceCode;
export interface Origin {
  source: string;
  name: string;
  call?: TSESTree.CallExpression | TSESTree.JSXOpeningElement;
  path: string[];
}

export function unwrap(node: TSESTree.Node): TSESTree.Node {
  while (
    node.type === "TSAsExpression" ||
    node.type === "TSTypeAssertion" ||
    node.type === "TSNonNullExpression" ||
    node.type === "TSSatisfiesExpression" ||
    node.type === "ChainExpression"
  )
    node = node.expression;
  return node;
}

export function propertyName(
  node: TSESTree.Node,
  computed = false,
): string | null {
  if (
    !computed &&
    (node.type === "Identifier" || node.type === "JSXIdentifier")
  )
    return node.name;
  if (node.type === "Literal" && typeof node.value === "string")
    return node.value;
  return null;
}

export function variableAt(
  code: SourceCode,
  node: TSESTree.Node,
  name: string,
) {
  return ASTUtils.findVariable(code.getScope(node), name);
}

/** Include assertions and optional-chain wrappers when walking out from a reference. */
function outerExpression(node: TSESTree.Node): TSESTree.Node {
  while (node.parent && unwrap(node.parent) === unwrap(node))
    node = node.parent;
  return node;
}

const mutators = {
  Object: new Set([
    "assign",
    "defineProperty",
    "defineProperties",
    "setPrototypeOf",
  ]),
  Reflect: new Set([
    "set",
    "defineProperty",
    "deleteProperty",
    "setPrototypeOf",
  ]),
};

function isMutationTarget(code: SourceCode, node: TSESTree.Node): boolean {
  const call = node.parent;
  if (call?.type !== "CallExpression" || call.arguments[0] !== node)
    return false;
  const callee = unwrap(call.callee);
  if (callee.type !== "MemberExpression") return false;
  const object = unwrap(callee.object);
  const method = propertyName(callee.property, callee.computed);
  return (
    object.type === "Identifier" &&
    (object.name === "Object" || object.name === "Reflect") &&
    method !== null &&
    mutators[object.name].has(method) &&
    !variableAt(code, object, object.name)?.defs.length
  );
}

function isWritten(code: SourceCode, node: TSESTree.Node): boolean {
  let current = node;
  for (;;) {
    current = outerExpression(current);
    const parent = current.parent;
    if (
      (parent?.type === "MemberExpression" && parent.object === current) ||
      (parent?.type === "AssignmentPattern" && parent.left === current) ||
      (parent?.type === "RestElement" && parent.argument === current) ||
      parent?.type === "ArrayPattern" ||
      parent?.type === "ObjectPattern"
    ) {
      current = parent;
      continue;
    }
    if (
      parent?.type === "Property" &&
      parent.value === current &&
      parent.parent.type === "ObjectPattern"
    ) {
      current = parent.parent;
      continue;
    }
    return (
      isMutationTarget(code, current) ||
      ((parent?.type === "AssignmentExpression" ||
        parent?.type === "ForInStatement" ||
        parent?.type === "ForOfStatement") &&
        parent.left === current) ||
      (parent?.type === "UpdateExpression" && parent.argument === current) ||
      (parent?.type === "UnaryExpression" &&
        parent.operator === "delete" &&
        parent.argument === current)
    );
  }
}

export function isStable(
  code: SourceCode,
  variable: TSESLint.Scope.Variable,
  seen = new Set<TSESLint.Scope.Variable>(),
): boolean {
  if (variable.defs.length > 1) return false;
  if (seen.has(variable)) return true;
  const nextSeen = new Set(seen).add(variable);
  return !variable.references.some((ref) => {
    if ((ref.isWrite() && !ref.init) || isWritten(code, ref.identifier))
      return true;
    let reference = outerExpression(ref.identifier);
    while (
      reference.parent?.type === "MemberExpression" &&
      reference.parent.object === reference
    )
      reference = outerExpression(reference.parent);
    const parent = reference.parent;
    if (parent?.type === "VariableDeclarator" && parent.init === reference) {
      return code
        .getDeclaredVariables(parent)
        .some(
          (alias) =>
            bindingPath(parent.id, alias.name) !== null &&
            !isStable(code, alias, nextSeen),
        );
    }
    return false;
  });
}

export function bindingPath(
  pattern: TSESTree.Node,
  name: string,
): string[] | null {
  if (pattern.type === "Identifier") return pattern.name === name ? [] : null;
  if (pattern.type !== "ObjectPattern") return null;
  for (const prop of pattern.properties) {
    if (prop.type !== "Property") continue;
    const key = propertyName(prop.key, prop.computed);
    const rest = bindingPath(prop.value, name);
    if (key !== null && rest !== null) return [key, ...rest];
  }
  return null;
}

/** Resolve lexical bindings, never spelling alone. Unknown writes or defaults stop resolution. */
export function origin(
  code: SourceCode,
  input: TSESTree.Node,
  seen = new Set<TSESLint.Scope.Variable>(),
): Origin | null {
  const node = unwrap(input);
  if (node.type === "Identifier" || node.type === "JSXIdentifier") {
    const variable = variableAt(code, node, node.name);
    if (!variable || seen.has(variable) || !isStable(code, variable))
      return null;
    const nextSeen = new Set(seen).add(variable);
    const def = variable.defs[0];
    if (def?.type === "ImportBinding") {
      const declaration = def.parent;
      if (
        declaration.type !== "ImportDeclaration" ||
        declaration.importKind === "type" ||
        def.node.type === "TSImportEqualsDeclaration"
      )
        return null;
      if (def.node.type === "ImportNamespaceSpecifier")
        return { source: declaration.source.value, name: "*", path: [] };
      if (def.node.type === "ImportDefaultSpecifier")
        return {
          source: declaration.source.value,
          name: declaration.source.value === "react" ? "*" : "default",
          path: [],
        };
      if (def.node.importKind === "type") return null;
      return {
        source: declaration.source.value,
        name: propertyName(def.node.imported) ?? "",
        path: [],
      };
    }
    if (def?.type === "Variable" && def.node.init) {
      const base = origin(code, def.node.init, nextSeen);
      const path = bindingPath(def.node.id, node.name);
      if (!base || !path) return null;
      if (base.name === "*" && !base.call && path.length)
        return { ...base, name: path[0], path: path.slice(1) };
      return { ...base, path: [...base.path, ...path] };
    }
    if (def?.type === "Parameter") {
      const fn = def.node;
      const container = outerExpression(fn).parent;
      const attribute =
        container?.type === "JSXExpressionContainer" ? container.parent : null;
      const opening =
        attribute?.type === "JSXAttribute" && attribute.name.name === "render"
          ? attribute.parent
          : null;
      if (
        opening?.type !== "JSXOpeningElement" ||
        !isImport(code, opening.name, "react-hook-form", "Controller")
      )
        return null;
      const render = jsxProperty(code, opening, "render");
      if (!render.known || !render.value || unwrap(render.value) !== fn)
        return null;
      const path = fn.params[0] ? bindingPath(fn.params[0], node.name) : null;
      return path
        ? { source: "react-hook-form", name: "Controller", call: opening, path }
        : null;
    }
    return null;
  }
  if (node.type === "MemberExpression" || node.type === "JSXMemberExpression") {
    const base = origin(code, node.object, seen);
    const name = propertyName(
      node.property,
      node.type === "MemberExpression" && node.computed,
    );
    if (!base || name === null) return null;
    return base.name === "*" && !base.call
      ? { ...base, name }
      : { ...base, path: [...base.path, name] };
  }
  if (node.type === "CallExpression") {
    const callee = origin(code, node.callee, seen);
    if (callee && !callee.call && callee.path.length === 0)
      return { ...callee, call: node };
  }
  return null;
}

export function isImport(
  code: SourceCode,
  node: TSESTree.Node,
  source: string,
  name: string,
): boolean {
  const result = origin(code, node);
  return (
    result?.source === source &&
    result.name === name &&
    !result.call &&
    result.path.length === 0
  );
}

export function isHook(
  result: Origin | null,
  names: readonly string[],
  path: readonly string[] = [],
): result is Origin {
  return (
    result?.source === "react-hook-form" &&
    names.includes(result.name) &&
    !!result.call &&
    result.path.length === path.length &&
    result.path.every((part, index) => part === path[index])
  );
}

/** Follow immutable value aliases without evaluating code. */
export function valueExpression(
  code: SourceCode,
  input: TSESTree.Node,
  seen = new Set<TSESLint.Scope.Variable>(),
): TSESTree.Node {
  const node = unwrap(input);
  if (node.type !== "Identifier") return node;
  const variable = variableAt(code, node, node.name);
  if (!variable || seen.has(variable) || !isStable(code, variable)) return node;
  const def = variable.defs[0];
  if (def?.type === "FunctionName") return def.node;
  if (
    def?.type === "Variable" &&
    def.node.id.type === "Identifier" &&
    def.node.init
  )
    return valueExpression(code, def.node.init, new Set(seen).add(variable));
  return node;
}

export function isUndefined(code: SourceCode, node: TSESTree.Node): boolean {
  node = valueExpression(code, node);
  return (
    (node.type === "Identifier" &&
      node.name === "undefined" &&
      !variableAt(code, node, node.name)?.defs.length) ||
    (node.type === "UnaryExpression" &&
      node.operator === "void" &&
      node.argument.type === "Literal" &&
      node.argument.value === 0)
  );
}

export interface StaticProperty {
  known: boolean;
  value?: TSESTree.Node;
  node?: TSESTree.Node;
}
/** Last-write semantics: an unknown spread invalidates earlier knowledge only. */
export function objectProperty(
  code: SourceCode,
  input: TSESTree.Node | undefined,
  name: string,
  seen = new Set<TSESTree.Node>(),
): StaticProperty {
  if (!input) return { known: true };
  const node = valueExpression(code, input);
  if (node.type !== "ObjectExpression" || seen.has(node))
    return { known: false };
  const nextSeen = new Set(seen).add(node);
  let result: StaticProperty = { known: true };
  for (const prop of node.properties) {
    if (prop.type === "SpreadElement") {
      const spread = objectProperty(code, prop.argument, name, nextSeen);
      if (!spread.known || spread.node) result = spread;
      continue;
    }
    const key = propertyName(prop.key, prop.computed);
    // A literal prototype setter can provide inherited options on direct reads.
    // Spreads copy only own properties; treating this as unknown is conservative for both.
    if (
      key === null ||
      (key === "__proto__" && !prop.computed && !prop.method && !prop.shorthand)
    )
      result = { known: false };
    else if (key === name)
      result =
        prop.kind === "init"
          ? { known: true, value: prop.value, node: prop }
          : { known: false };
  }
  return result;
}

export function jsxProperty(
  code: SourceCode,
  opening: TSESTree.JSXOpeningElement,
  name: string,
): StaticProperty {
  let result: StaticProperty = { known: true };
  for (const attr of opening.attributes) {
    if (attr.type === "JSXSpreadAttribute") {
      const spread = objectProperty(code, attr.argument, name);
      if (!spread.known || spread.node) result = spread;
    } else if (attr.name.type === "JSXIdentifier" && attr.name.name === name) {
      result = {
        known: true,
        node: attr,
        value:
          attr.value?.type === "JSXExpressionContainer"
            ? attr.value.expression
            : (attr.value ?? undefined),
      };
    }
  }
  return result;
}

export function isFunction(code: SourceCode, node: TSESTree.Node): boolean {
  const value = valueExpression(code, node);
  return (
    value.type === "ArrowFunctionExpression" ||
    value.type === "FunctionExpression" ||
    value.type === "FunctionDeclaration"
  );
}
