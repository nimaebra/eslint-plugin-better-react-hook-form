import type { TSESTree } from "@typescript-eslint/utils";

export interface ReactHookFormImportInfo {
  namedImports: Map<string, string>;
  namespaceImports: Set<string>;
}

export function getReactHookFormImportInfo(
  program: TSESTree.Program,
): ReactHookFormImportInfo {
  const namedImports = new Map<string, string>();
  const namespaceImports = new Set<string>();

  for (const statement of program.body) {
    if (
      statement.type !== "ImportDeclaration" ||
      statement.source.value !== "react-hook-form"
    ) {
      continue;
    }

    for (const specifier of statement.specifiers) {
      if (specifier.type === "ImportNamespaceSpecifier") {
        namespaceImports.add(specifier.local.name);
        continue;
      }

      if (specifier.type === "ImportSpecifier") {
        const importedName =
          specifier.imported.type === "Identifier"
            ? specifier.imported.name
            : specifier.imported.value;

        namedImports.set(specifier.local.name, importedName);
      }
    }
  }

  return {
    namedImports,
    namespaceImports,
  };
}

function isReactHookFormMember(
  node: TSESTree.MemberExpression,
  importInfo: ReactHookFormImportInfo,
  importName: string,
): boolean {
  return (
    !node.computed &&
    node.object.type === "Identifier" &&
    node.property.type === "Identifier" &&
    importInfo.namespaceImports.has(node.object.name) &&
    node.property.name === importName
  );
}

export function isReactHookFormCall(
  callee: TSESTree.CallExpression["callee"],
  importInfo: ReactHookFormImportInfo,
  importName: string,
): boolean {
  if (callee.type === "Identifier") {
    return importInfo.namedImports.get(callee.name) === importName;
  }

  if (callee.type === "MemberExpression") {
    return isReactHookFormMember(callee, importInfo, importName);
  }

  return false;
}

export function isReactHookFormJsxElement(
  name: TSESTree.JSXTagNameExpression,
  importInfo: ReactHookFormImportInfo,
  importName: string,
): boolean {
  if (name.type === "JSXIdentifier") {
    return importInfo.namedImports.get(name.name) === importName;
  }

  if (
    name.type === "JSXMemberExpression" &&
    name.object.type === "JSXIdentifier" &&
    name.property.type === "JSXIdentifier"
  ) {
    return (
      importInfo.namespaceImports.has(name.object.name) &&
      name.property.name === importName
    );
  }

  return false;
}
