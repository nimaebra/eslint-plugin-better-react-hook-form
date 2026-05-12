import { RuleTester } from "@typescript-eslint/rule-tester";

import rule from "../../src/rules/no-deprecated-watch-callback.js";

const ruleTester = new RuleTester();

ruleTester.run("no-deprecated-watch-callback", rule, {
  valid: [
    {
      name: "watch a single field value",
      code: `
        import { useForm } from "react-hook-form";

        function Example() {
          const { watch } = useForm();

          return watch("firstName");
        }
      `,
    },
    {
      name: "watch multiple fields from methods object",
      code: `
        import * as RHF from "react-hook-form";

        function Example() {
          const methods = RHF.useForm();

          return methods.watch(["firstName", "lastName"]);
        }
      `,
    },
    {
      name: "local watch helper is ignored",
      code: `
        function Example() {
          const watch = (callback) => callback();

          return watch(() => undefined);
        }
      `,
    },
  ],
  invalid: [
    {
      name: "direct watch callback overload",
      code: `
        import { useForm } from "react-hook-form";

        function Example() {
          const { watch } = useForm();

          watch(() => undefined);
        }
      `,
      errors: [{ messageId: "useSubscribeInstead" }],
      output: null,
    },
    {
      name: "aliased watch binding with callback reference",
      code: `
        import { useFormContext } from "react-hook-form";

        function Example() {
          const { watch: observe } = useFormContext();
          const handleChange = () => undefined;

          observe(handleChange);
        }
      `,
      errors: [{ messageId: "useSubscribeInstead" }],
      output: null,
    },
    {
      name: "methods watch with function expression",
      code: `
        import * as RHF from "react-hook-form";

        function Example() {
          const methods = RHF.useForm();

          methods.watch(function handleChange() {
            return undefined;
          });
        }
      `,
      errors: [{ messageId: "useSubscribeInstead" }],
      output: null,
    },
    {
      name: "watch callback reference from function declaration",
      code: `
        import { useForm } from "react-hook-form";

        function Example() {
          const { watch } = useForm();

          function handleChange() {
            return undefined;
          }

          watch(handleChange);
        }
      `,
      errors: [{ messageId: "useSubscribeInstead" }],
      output: null,
    },
  ],
});
