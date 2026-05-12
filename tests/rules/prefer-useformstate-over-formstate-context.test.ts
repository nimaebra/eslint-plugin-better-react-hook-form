import { RuleTester } from "@typescript-eslint/rule-tester";

import rule from "../../src/rules/prefer-useformstate-over-formstate-context.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run("prefer-useformstate-over-formstate-context", rule, {
  valid: [
    {
      name: "register only from useFormContext",
      code: `
        import { useFormContext } from "react-hook-form";

        function Example() {
          const { register } = useFormContext();

          return <input {...register("firstName")} />;
        }
      `,
    },
    {
      name: "useFormState is used for errors subscription",
      code: `
        import { useFormContext, useFormState } from "react-hook-form";

        function Example() {
          const { control } = useFormContext();
          const { errors } = useFormState({ control });

          return errors.firstName?.message ?? null;
        }
      `,
    },
    {
      name: "non-targeted formState property is ignored",
      code: `
        import { useFormContext } from "react-hook-form";

        function Example() {
          const { formState } = useFormContext();

          return formState.submitCount;
        }
      `,
    },
    {
      name: "useForm is outside the rule scope",
      code: `
        import { useForm } from "react-hook-form";

        function Example() {
          const { formState: { errors } } = useForm();

          return errors.firstName?.message ?? null;
        }
      `,
    },
  ],
  invalid: [
    {
      name: "nested errors destructuring from useFormContext",
      code: `
        import { useFormContext } from "react-hook-form";

        function Example() {
          const { formState: { errors } } = useFormContext();

          return errors.firstName?.message ?? null;
        }
      `,
      errors: [
        {
          data: {
            name: "errors",
          },
          messageId: "preferUseFormState",
        },
      ],
      output: null,
    },
    {
      name: "aliased nested isDirty destructuring from useFormContext",
      code: `
        import { useFormContext as useRHFContext } from "react-hook-form";

        function Example() {
          const { formState: { isDirty: dirty } } = useRHFContext();

          return dirty;
        }
      `,
      errors: [
        {
          data: {
            name: "isDirty",
          },
          messageId: "preferUseFormState",
        },
      ],
      output: null,
    },
    {
      name: "tracked formState binding member access",
      code: `
        import { useFormContext } from "react-hook-form";

        function Example() {
          const { formState } = useFormContext();

          return formState.errors?.firstName?.message ?? null;
        }
      `,
      errors: [
        {
          data: {
            name: "errors",
          },
          messageId: "preferUseFormState",
        },
      ],
      output: null,
    },
    {
      name: "methods object formState member access",
      code: `
        import * as RHF from "react-hook-form";

        function Example() {
          const methods = RHF.useFormContext();

          return methods.formState.isValid;
        }
      `,
      errors: [
        {
          data: {
            name: "isValid",
          },
          messageId: "preferUseFormState",
        },
      ],
      output: null,
    },
    {
      name: "destructuring from tracked formState alias",
      code: `
        import { useFormContext } from "react-hook-form";

        function Example() {
          const { formState: state } = useFormContext();
          const { dirtyFields } = state;

          return dirtyFields;
        }
      `,
      errors: [
        {
          data: {
            name: "dirtyFields",
          },
          messageId: "preferUseFormState",
        },
      ],
      output: null,
    },
    {
      name: "destructuring from methods.formState",
      code: `
        import { useFormContext } from "react-hook-form";

        function Example() {
          const methods = useFormContext();
          const { touchedFields } = methods.formState;

          return touchedFields;
        }
      `,
      errors: [
        {
          data: {
            name: "touchedFields",
          },
          messageId: "preferUseFormState",
        },
      ],
      output: null,
    },
  ],
});
