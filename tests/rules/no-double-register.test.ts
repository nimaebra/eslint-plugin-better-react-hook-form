import { RuleTester } from "@typescript-eslint/rule-tester";

import rule from "../../src/rules/no-double-register.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run("no-double-register", rule, {
  valid: [
    {
      name: "register only",
      code: `
        import { useForm } from "react-hook-form";

        function Example() {
          const { register } = useForm();

          return <input {...register("email")} />;
        }
      `,
    },
    {
      name: "useController field only",
      code: `
        import { useController } from "react-hook-form";

        function Example() {
          const { field } = useController({ name: "email" });

          return <input {...field} />;
        }
      `,
    },
    {
      name: "Controller render prop only",
      code: `
        import { Controller } from "react-hook-form";

        function Example() {
          return (
            <Controller
              name="email"
              render={({ field }) => <input {...field} />}
            />
          );
        }
      `,
    },
    {
      name: "unrelated local register helper",
      code: `
        import { useController } from "react-hook-form";

        function Example() {
          const { field } = useController({ name: "email" });
          const register = () => ({ id: "helper" });

          return <input {...field} {...register()} />;
        }
      `,
    },
    {
      name: "register and field on different elements",
      code: `
        import { useController, useForm } from "react-hook-form";

        function Example() {
          const { register } = useForm();
          const { field } = useController({ name: "email" });

          return (
            <>
              <input {...register("email")} />
              <input {...field} />
            </>
          );
        }
      `,
    },
  ],
  invalid: [
    {
      name: "useController field with register",
      code: `
        import { useController, useForm } from "react-hook-form";

        function Example() {
          const { register } = useForm();
          const { field } = useController({ name: "email" });

          return <input {...field} {...register("email")} />;
        }
      `,
      errors: [{ messageId: "avoidDoubleRegister" }],
      output: null,
    },
    {
      name: "useController alias with methods.register",
      code: `
        import { useController, useForm } from "react-hook-form";

        function Example() {
          const methods = useForm();
          const { field: controlledField } = useController({ name: "email" });

          return <input {...controlledField} {...methods.register("email")} />;
        }
      `,
      errors: [{ messageId: "avoidDoubleRegister" }],
      output: null,
    },
    {
      name: "Controller render prop field with register",
      code: `
        import { Controller, useForm } from "react-hook-form";

        function Example() {
          const { register } = useForm();

          return (
            <Controller
              name="email"
              render={({ field }) => <input {...field} {...register("email")} />}
            />
          );
        }
      `,
      errors: [{ messageId: "avoidDoubleRegister" }],
      output: null,
    },
    {
      name: "namespace Controller render prop field with register alias",
      code: `
        import * as RHF from "react-hook-form";

        function Example() {
          const { register: rhfRegister } = RHF.useForm();

          return (
            <RHF.Controller
              name="email"
              render={({ field: inputField }) => <input {...rhfRegister("email")} {...inputField} />}
            />
          );
        }
      `,
      errors: [{ messageId: "avoidDoubleRegister" }],
      output: null,
    },
  ],
});
