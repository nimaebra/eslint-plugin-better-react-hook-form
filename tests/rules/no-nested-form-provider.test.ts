import { RuleTester } from "@typescript-eslint/rule-tester";

import rule from "../../src/rules/no-nested-form-provider.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run("no-nested-form-provider", rule, {
  valid: [
    {
      code: `
        import { FormProvider, useForm } from "react-hook-form";

        function Example() {
          const methods = useForm();

          return (
            <FormProvider {...methods}>
              <section />
            </FormProvider>
          );
        }
      `,
    },
    {
      code: `
        import * as RHF from "react-hook-form";

        function Example() {
          const methods = RHF.useForm();

          return (
            <RHF.FormProvider {...methods}>
              <OtherProvider>
                <section />
              </OtherProvider>
            </RHF.FormProvider>
          );
        }
      `,
    },
    {
      code: `
        const FormProvider = ({ children }) => children;

        function Example() {
          return (
            <FormProvider>
              <FormProvider>
                <section />
              </FormProvider>
            </FormProvider>
          );
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        import { FormProvider, useForm } from "react-hook-form";

        function Example() {
          const outerMethods = useForm();
          const innerMethods = useForm();

          return (
            <FormProvider {...outerMethods}>
              <FormProvider {...innerMethods}>
                <section />
              </FormProvider>
            </FormProvider>
          );
        }
      `,
      errors: [{ messageId: "avoidNestedProvider" }],
    },
    {
      code: `
        import { FormProvider as RHFProvider, useForm } from "react-hook-form";

        function Example() {
          const outerMethods = useForm();
          const innerMethods = useForm();

          return (
            <RHFProvider {...outerMethods}>
              <div>
                <RHFProvider {...innerMethods}>
                  <section />
                </RHFProvider>
              </div>
            </RHFProvider>
          );
        }
      `,
      errors: [{ messageId: "avoidNestedProvider" }],
    },
    {
      code: `
        import * as RHF from "react-hook-form";

        function Example() {
          const outerMethods = RHF.useForm();
          const innerMethods = RHF.useForm();

          return (
            <RHF.FormProvider {...outerMethods}>
              <RHF.FormProvider {...innerMethods}>
                <section />
              </RHF.FormProvider>
            </RHF.FormProvider>
          );
        }
      `,
      errors: [{ messageId: "avoidNestedProvider" }],
    },
  ],
});
