import { RuleTester } from "@typescript-eslint/rule-tester";

import rule from "../../src/rules/destructuring-formstate.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run("destructuring-formstate", rule, {
  valid: [
    {
      name: "destructure from useFormState directly",
      code: `
        import { useFormState } from "react-hook-form";

        function Example() {
          const { isDirty } = useFormState();

          return isDirty;
        }
      `,
    },
    {
      name: "destructure from tracked formState binding",
      code: `
        import { useForm } from "react-hook-form";

        function Example() {
          const { formState } = useForm();
          const { isDirty, isValid } = formState;

          return <button disabled={!isDirty || !isValid} />;
        }
      `,
    },
    {
      name: "nested destructuring from useForm is allowed",
      code: `
        import { useForm } from "react-hook-form";

        function Example() {
          const {
            formState: { isDirty, isValid },
          } = useForm();

          return <button disabled={!isDirty || !isValid} />;
        }
      `,
    },
    {
      name: "non-react-hook-form useFormState is ignored",
      code: `
        function useFormState() {
          return { isDirty: true };
        }

        function Example() {
          const formState = useFormState();

          return formState.isDirty;
        }
      `,
    },
  ],
  invalid: [
    {
      name: "read properties from useFormState proxy",
      code: `
        import { useFormState } from "react-hook-form";

        function Example() {
          const formState = useFormState();

          return <button disabled={!formState.isDirty || !formState.isValid} />;
        }
      `,
      errors: [
        { data: { name: "isDirty" }, messageId: "destructureFormState" },
        { data: { name: "isValid" }, messageId: "destructureFormState" },
      ],
      output: null,
    },
    {
      name: "read property from useForm formState binding",
      code: `
        import { useForm } from "react-hook-form";

        function Example() {
          const { formState } = useForm();

          return formState.isDirty;
        }
      `,
      errors: [
        { data: { name: "isDirty" }, messageId: "destructureFormState" },
      ],
      output: null,
    },
    {
      name: "read property from methods.formState directly",
      code: `
        import * as RHF from "react-hook-form";

        function Example() {
          const methods = RHF.useForm();

          return methods.formState.submitCount;
        }
      `,
      errors: [
        {
          data: { name: "submitCount" },
          messageId: "destructureFormState",
        },
      ],
      output: null,
    },
    {
      name: "read property from aliased formState binding",
      code: `
        import { useFormContext } from "react-hook-form";

        function Example() {
          const { formState: state } = useFormContext();

          return state.errors;
        }
      `,
      errors: [{ data: { name: "errors" }, messageId: "destructureFormState" }],
      output: null,
    },
    {
      name: "read property from re-aliased formState binding",
      code: `
        import { useFormState } from "react-hook-form";

        function Example() {
          const state = useFormState();
          const formState = state;

          return formState.isSubmitting;
        }
      `,
      errors: [
        {
          data: { name: "isSubmitting" },
          messageId: "destructureFormState",
        },
      ],
      output: null,
    },
  ],
});
