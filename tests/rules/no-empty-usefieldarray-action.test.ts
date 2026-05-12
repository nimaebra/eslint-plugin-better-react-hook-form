import { RuleTester } from "@typescript-eslint/rule-tester";

import rule from "../../src/rules/no-empty-usefieldarray-action.js";

const ruleTester = new RuleTester();

ruleTester.run("no-empty-usefieldarray-action", rule, {
  valid: [
    {
      name: "append with object value",
      code: `
        import { useFieldArray } from "react-hook-form";

        function Example() {
          const { append } = useFieldArray({ name: "contacts" });

          append({ email: "hello@example.com" });
        }
      `,
    },
    {
      name: "prepend with array value",
      code: `
        import { useFieldArray } from "react-hook-form";

        function Example() {
          const { prepend } = useFieldArray({ name: "contacts" });

          prepend([{ email: "hello@example.com" }]);
        }
      `,
    },
    {
      name: "insert with index and object value",
      code: `
        import { useFieldArray } from "react-hook-form";

        function Example() {
          const { insert } = useFieldArray({ name: "contacts" });

          insert(0, { email: "hello@example.com" });
        }
      `,
    },
    {
      name: "update with index and object value",
      code: `
        import * as RHF from "react-hook-form";

        function Example() {
          const { update } = RHF.useFieldArray({ name: "contacts" });

          update(0, { email: "hello@example.com" });
        }
      `,
    },
    {
      name: "unrelated append helper",
      code: `
        function Example() {
          const append = () => undefined;

          append({});
        }
      `,
    },
  ],
  invalid: [
    {
      name: "append without value",
      code: `
        import { useFieldArray } from "react-hook-form";

        function Example() {
          const { append } = useFieldArray({ name: "contacts" });

          append();
        }
      `,
      errors: [
        {
          data: {
            action: "append",
          },
          messageId: "provideNonEmptyValue",
        },
      ],
      output: null,
    },
    {
      name: "append empty object",
      code: `
        import { useFieldArray } from "react-hook-form";

        function Example() {
          const { append } = useFieldArray({ name: "contacts" });

          append({});
        }
      `,
      errors: [
        {
          data: {
            action: "append",
          },
          messageId: "provideNonEmptyValue",
        },
      ],
      output: null,
    },
    {
      name: "prepend empty object",
      code: `
        import { useFieldArray as useRHFFieldArray } from "react-hook-form";

        function Example() {
          const { prepend } = useRHFFieldArray({ name: "contacts" });

          prepend({});
        }
      `,
      errors: [
        {
          data: {
            action: "prepend",
          },
          messageId: "provideNonEmptyValue",
        },
      ],
      output: null,
    },
    {
      name: "insert without payload",
      code: `
        import { useFieldArray } from "react-hook-form";

        function Example() {
          const { insert } = useFieldArray({ name: "contacts" });

          insert(0);
        }
      `,
      errors: [
        {
          data: {
            action: "insert",
          },
          messageId: "provideNonEmptyValue",
        },
      ],
      output: null,
    },
    {
      name: "update empty object via alias",
      code: `
        import { useFieldArray } from "react-hook-form";

        function Example() {
          const { update: replaceItem } = useFieldArray({ name: "contacts" });

          replaceItem(0, {});
        }
      `,
      errors: [
        {
          data: {
            action: "update",
          },
          messageId: "provideNonEmptyValue",
        },
      ],
      output: null,
    },
    {
      name: "append empty object wrapped in a cast",
      code: `
        import { useFieldArray } from "react-hook-form";

        type FormValues = {
          contacts: Array<{
            email: string;
          }>;
        };

        function Example() {
          const { append } = useFieldArray<FormValues>({ name: "contacts" });

          append({} as FormValues["contacts"][number]);
        }
      `,
      errors: [
        {
          data: {
            action: "append",
          },
          messageId: "provideNonEmptyValue",
        },
      ],
      output: null,
    },
  ],
});
