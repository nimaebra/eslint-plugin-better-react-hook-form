import { RuleTester } from "@typescript-eslint/rule-tester";

import rule from "../../src/rules/no-use-watch.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run("no-use-watch", rule, {
  valid: [
    {
      name: "useWatch with useForm control",
      code: `
        import { useForm, useWatch } from "react-hook-form";

        function Example() {
          const { control } = useForm();
          const watchedValues = useWatch({ control });

          return watchedValues;
        }
      `,
    },
    {
      name: "useWatch with useFormContext control",
      code: `
        import { useFormContext, useWatch } from "react-hook-form";

        function Example() {
          const { control } = useFormContext();
          const watchedValues = useWatch({ control });

          return watchedValues;
        }
      `,
    },
    {
      name: "local watch helper is ignored",
      code: `
        function Example() {
          const watch = () => undefined;

          return watch();
        }
      `,
    },
    {
      name: "useForm without watch is allowed",
      code: `
        import { useForm } from "react-hook-form";

        function Example() {
          const { register } = useForm();

          return <input {...register("firstName")} />;
        }
      `,
    },
  ],
  invalid: [
    {
      name: "destructure watch from useForm",
      code: `
        import { useForm } from "react-hook-form";

        function Example() {
          const { watch } = useForm();

          return watch("firstName");
        }
      `,
      errors: [
        { messageId: "useUseWatchInstead" },
        { messageId: "useUseWatchInstead" },
      ],
      output: null,
    },
    {
      name: "destructure aliased watch from useFormContext",
      code: `
        import { useFormContext } from "react-hook-form";

        function Example() {
          const { watch: observe } = useFormContext();

          return observe("firstName");
        }
      `,
      errors: [
        { messageId: "useUseWatchInstead" },
        { messageId: "useUseWatchInstead" },
      ],
      output: null,
    },
    {
      name: "methods.watch call from useForm",
      code: `
        import * as RHF from "react-hook-form";

        function Example() {
          const methods = RHF.useForm();

          return methods.watch("firstName");
        }
      `,
      errors: [{ messageId: "useUseWatchInstead" }],
      output: null,
    },
    {
      name: "methods.watch alias assignment",
      code: `
        import { useForm } from "react-hook-form";

        function Example() {
          const methods = useForm();
          const observe = methods.watch;

          return observe("firstName");
        }
      `,
      errors: [
        { messageId: "useUseWatchInstead" },
        { messageId: "useUseWatchInstead" },
      ],
      output: null,
    },
  ],
});
