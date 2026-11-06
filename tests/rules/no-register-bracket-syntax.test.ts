import { RuleTester } from "@typescript-eslint/rule-tester";

import rule from "../../src/rules/no-register-bracket-syntax.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run("no-register-bracket-syntax", rule, {
  valid: [
    {
      name: "brackets used only inside a template interpolation are ignored",
      code: [
        'import { useForm } from "react-hook-form";',
        "const { register } = useForm();",
        "const indexes = [0];",
        "register(`users.${indexes[0]}.name`);",
      ].join("\n"),
    },
    {
      code: `
        import { useForm } from "react-hook-form";

        function Example() {
          const { register } = useForm();

          return <input {...register("users.0.name")} />;
        }
      `,
    },
    {
      code: `
        import { useFormContext } from "react-hook-form";

        function Example() {
          const { register: fieldRegister } = useFormContext();

          return <input {...fieldRegister("users.0.name")} />;
        }
      `,
    },
    {
      code: `
        const register = (name) => name;

        register("users[0].name");
      `,
    },
  ],
  invalid: [
    {
      name: "quoted property segments are fixed while preserving single quotes",
      code: `
        import { useForm } from "react-hook-form";
        const { register } = useForm();
        register('contact["email"]');
      `,
      errors: [{ messageId: "avoidBracketSyntax" }],
      output: `
        import { useForm } from "react-hook-form";
        const { register } = useForm();
        register('contact.email');
      `,
    },
    {
      name: "a quoted property containing a dot is reported without a fix",
      code: `
        import { useForm } from "react-hook-form";
        const { register } = useForm();
        register('contact["email.work"]');
      `,
      errors: [{ messageId: "avoidBracketSyntax" }],
      output: null,
    },
    {
      code: `
        import { useForm } from "react-hook-form";

        function Example() {
          const { register } = useForm();

          return <input {...register("users[0].name")} />;
        }
      `,
      errors: [{ messageId: "avoidBracketSyntax" }],
      output: `
        import { useForm } from "react-hook-form";

        function Example() {
          const { register } = useForm();

          return <input {...register("users.0.name")} />;
        }
      `,
    },
    {
      code: `
        import { useFormContext } from "react-hook-form";

        function Example() {
          const { register: rhfRegister } = useFormContext();

          return <input {...rhfRegister("participants[0].email")} />;
        }
      `,
      errors: [{ messageId: "avoidBracketSyntax" }],
      output: `
        import { useFormContext } from "react-hook-form";

        function Example() {
          const { register: rhfRegister } = useFormContext();

          return <input {...rhfRegister("participants.0.email")} />;
        }
      `,
    },
    {
      code: `
        import { useForm } from "react-hook-form";

        function Example() {
          const methods = useForm();

          return <input {...methods.register("contacts[0].phone")} />;
        }
      `,
      errors: [{ messageId: "avoidBracketSyntax" }],
      output: `
        import { useForm } from "react-hook-form";

        function Example() {
          const methods = useForm();

          return <input {...methods.register("contacts.0.phone")} />;
        }
      `,
    },
    {
      code: [
        'import { useForm } from "react-hook-form";',
        "",
        "function Example() {",
        "  const { register } = useForm();",
        "",
        "  return <input {...register(`users[${0}].name`)} />;",
        "}",
      ].join("\n"),
      errors: [{ messageId: "avoidBracketSyntax" }],
      output: null,
    },
    {
      code: `
        import { useForm } from "react-hook-form";

        function Example() {
          const { register } = useForm<{ contacts: Array<{ email: string }> }>();

          return (
            <input
              {...register("contacts[0].email" as "contacts.0.email")}
            />
          );
        }
      `,
      errors: [{ messageId: "avoidBracketSyntax" }],
      output: `
        import { useForm } from "react-hook-form";

        function Example() {
          const { register } = useForm<{ contacts: Array<{ email: string }> }>();

          return (
            <input
              {...register("contacts.0.email" as "contacts.0.email")}
            />
          );
        }
      `,
    },
  ],
});
