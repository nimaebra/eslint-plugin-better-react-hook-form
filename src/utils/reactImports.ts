import type { TSESTree } from "@typescript-eslint/utils";

export interface ReactImportInfo {
  memberImports: Set<string>;
  namedImports: Map<string, string>;
}

export function getReactImportInfo(program: TSESTree.Program): ReactImportInfo {
  const memberImports = new Set<string>();
  const namedImports = new Map<string, string>();

  for (const statement of program.body) {
    if (
      statement.type !== "ImportDeclaration" ||
      statement.source.value !== "react"
    ) {
      continue;
    }

    for (const specifier of statement.specifiers) {
      if (
        specifier.type === "ImportDefaultSpecifier" ||
        specifier.type === "ImportNamespaceSpecifier"
      ) {
        memberImports.add(specifier.local.name);
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
    memberImports,
    namedImports,
  };
}
