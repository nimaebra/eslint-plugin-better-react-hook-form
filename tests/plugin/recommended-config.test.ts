import type { Linter } from "eslint";

import tsParser from "@typescript-eslint/parser";
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

import plugin from "../../src/index.js";

describe("recommended config", () => {
  it("enables the exported recommended rules in ESLint", async () => {
    const recommendedConfig = plugin.configs[
      "flat/recommended"
    ] as Linter.Config;
    const eslint = new ESLint({
      ignore: false,
      overrideConfig: [
        recommendedConfig,
        {
          files: ["**/*.{ts,tsx}"],
          languageOptions: {
            parser: tsParser,
            parserOptions: {
              ecmaFeatures: {
                jsx: true,
              },
              sourceType: "module",
            },
          },
        },
      ],
      overrideConfigFile: true,
    });

    const [result] = await eslint.lintText(
      `
        import { useEffect } from "react";
        import { FormProvider, useForm } from "react-hook-form";

        function Example() {
          const methods = useForm();

          useEffect(() => {
            methods.reset({ firstName: "Ada" });
          }, [methods]);

          return (
            <FormProvider {...methods}>
              <input {...methods.register("users[0].name")} />
            </FormProvider>
          );
        }
      `,
      {
        filePath: "fixtures/example.tsx",
      },
    );

    const ruleIds = result.messages
      .map((message) => message.ruleId)
      .filter((ruleId): ruleId is string => ruleId != null);

    expect(ruleIds).toContain(
      "better-react-hook-form/no-form-methods-object-in-deps",
    );
    expect(ruleIds).toContain(
      "better-react-hook-form/no-register-bracket-syntax",
    );
  });
});
