import { ESLintUtils } from "@typescript-eslint/utils";

export interface BetterReactHookFormDocs {
  description: string;
  recommended?: boolean;
  requiresTypeChecking?: boolean;
}

export const createRule = ESLintUtils.RuleCreator<BetterReactHookFormDocs>(
  (name) =>
    `https://github.com/nimaebrazeh/eslint-plugin-better-react-hook-form/blob/main/docs/rules/${name}.md`,
);
