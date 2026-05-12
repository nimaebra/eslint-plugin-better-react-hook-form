import type { TSESTree } from "@typescript-eslint/utils";

import type { ReactImportInfo } from "./reactImports.js";

const reactHookNames = new Set([
  "useCallback",
  "useEffect",
  "useLayoutEffect",
  "useMemo",
]);

export function getReactDependencyHookName(
  callee: TSESTree.CallExpression["callee"],
  importInfo: ReactImportInfo,
): string | null {
  if (callee.type === "Identifier") {
    if (reactHookNames.has(callee.name)) {
      return callee.name;
    }

    const importedName = importInfo.namedImports.get(callee.name);

    return importedName != null && reactHookNames.has(importedName)
      ? importedName
      : null;
  }

  if (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.object.type === "Identifier" &&
    callee.property.type === "Identifier" &&
    importInfo.memberImports.has(callee.object.name) &&
    reactHookNames.has(callee.property.name)
  ) {
    return callee.property.name;
  }

  return null;
}
