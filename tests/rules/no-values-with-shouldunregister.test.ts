import { RuleTester } from "@typescript-eslint/rule-tester";

import rule from "../../src/rules/no-values-with-shouldunregister.js";

const ruleTester = new RuleTester();

ruleTester.run("no-values-with-shouldunregister", rule, {
  valid: [
    {
      name: "defaultValues with shouldUnregister is allowed",
      code: `
        import { useForm } from "react-hook-form";

        function Example(serverData) {
          useForm({
            defaultValues: serverData,
            shouldUnregister: true,
          });
        }
      `,
    },
    {
      name: "values without shouldUnregister is allowed",
      code: `
        import { useForm } from "react-hook-form";

        function Example(serverData) {
          useForm({ values: serverData });
        }
      `,
    },
    {
      name: "shouldUnregister false is ignored",
      code: `
        import { useForm } from "react-hook-form";

        function Example(serverData) {
          useForm({
            values: serverData,
            shouldUnregister: false,
          });
        }
      `,
    },
    {
      name: "indirect options object is ignored for now",
      code: `
        import { useForm } from "react-hook-form";

        function Example(serverData) {
          const options = {
            values: serverData,
            shouldUnregister: true,
          };

          useForm(options);
        }
      `,
    },
    {
      name: "values explicitly undefined is ignored",
      code: `
        import * as RHF from "react-hook-form";

        function Example() {
          RHF.useForm({
            values: undefined,
            shouldUnregister: true,
          });
        }
      `,
    },
  ],
  invalid: [
    {
      name: "direct useForm call with values and shouldUnregister true",
      code: `
        import { useForm } from "react-hook-form";

        function Example(serverData) {
          useForm({
            values: serverData,
            shouldUnregister: true,
          });
        }
      `,
      errors: [{ messageId: "avoidValuesWithShouldUnregister" }],
      output: null,
    },
    {
      name: "aliased useForm import",
      code: `
        import { useForm as useRHFForm } from "react-hook-form";

        function Example(values) {
          useRHFForm({
            shouldUnregister: true,
            values,
          });
        }
      `,
      errors: [{ messageId: "avoidValuesWithShouldUnregister" }],
      output: null,
    },
    {
      name: "namespace useForm call",
      code: `
        import * as RHF from "react-hook-form";

        function Example(serverData) {
          RHF.useForm({
            values: serverData,
            shouldUnregister: true,
          });
        }
      `,
      errors: [{ messageId: "avoidValuesWithShouldUnregister" }],
      output: null,
    },
    {
      name: "casted shouldUnregister true still reports",
      code: `
        import { useForm } from "react-hook-form";

        function Example(serverData) {
          useForm({
            values: serverData,
            shouldUnregister: true as const,
          });
        }
      `,
      errors: [{ messageId: "avoidValuesWithShouldUnregister" }],
      output: null,
    },
  ],
});
