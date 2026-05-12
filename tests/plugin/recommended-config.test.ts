import type { Linter } from "eslint";

import tsParser from "@typescript-eslint/parser";
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

import plugin from "../../src/index.js";

describe("recommended config", () => {
  it("exports the non-recommended no-values-with-shouldunregister rule", () => {
    expect(plugin.rules).toHaveProperty("no-values-with-shouldunregister");
  });

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
        import {
          FormProvider,
          useFieldArray,
          useForm,
          useFormContext,
        } from "react-hook-form";

        function NestedErrors() {
          const { formState: { errors } } = useFormContext();

          return errors.firstName?.message ?? null;
        }

        function Example() {
          const methods = useForm();
          const formState = methods.formState;
          const { fields, append, remove } = useFieldArray({
            control: methods.control,
            name: "users",
          });

          methods.watch(() => undefined);
          methods.watch("firstName");

          useEffect(() => {
            methods.reset({ firstName: "Ada" });
          }, [methods]);

          return (
            <FormProvider {...methods}>
              <NestedErrors />
              <button disabled={!formState.isDirty || !formState.isValid} />
              {fields.map((field, index) => (
                <input key={index} {...methods.register("users[0].name")} />
              ))}
              <button
                type="button"
                onClick={() => {
                  append({ name: "Grace" });
                  remove(0);
                }}
              />
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

    expect(ruleIds).toContain("better-react-hook-form/destructuring-formstate");
    expect(ruleIds).toContain(
      "better-react-hook-form/no-deprecated-watch-callback",
    );
    expect(ruleIds).toContain(
      "better-react-hook-form/no-form-methods-object-in-deps",
    );
    expect(ruleIds).toContain("better-react-hook-form/no-use-watch");
    expect(ruleIds).toContain(
      "better-react-hook-form/prefer-useformstate-over-formstate-context",
    );
    expect(ruleIds).toContain(
      "better-react-hook-form/no-stacked-usefieldarray-actions",
    );
    expect(ruleIds).toContain(
      "better-react-hook-form/no-register-bracket-syntax",
    );
    expect(ruleIds).toContain(
      "better-react-hook-form/usefieldarray-require-field-id-key",
    );
  });
});
