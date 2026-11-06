import { RuleTester } from "@typescript-eslint/rule-tester";

import rule from "../../src/rules/usefieldarray-require-field-id-key.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run("usefieldarray-require-field-id-key", rule, {
  valid: [
    {
      name: "null branches are allowed when the returned row uses the configured key",
      code: `
        import { useFieldArray } from "react-hook-form";
        function Example({ visible }) {
          const { fields } = useFieldArray({ name: "contacts", keyName: "rowKey" });
          return fields.map((field) => {
            if (!visible) return;
            return visible ? <input key={field.rowKey} /> : null;
          });
        }
      `,
    },
    {
      name: "tracked fields keyed by field.id",
      code: `
        import { useFieldArray } from "react-hook-form";

        function Example() {
          const { fields } = useFieldArray({ name: "contacts" });

          return fields.map((field) => <input key={field.id} />);
        }
      `,
    },
    {
      name: "aliased fields keyed by field.id",
      code: `
        import { useFieldArray } from "react-hook-form";

        function Example() {
          const { fields: contactFields } = useFieldArray({ name: "contacts" });

          return contactFields.map((item) => {
            return <input key={item.id} />;
          });
        }
      `,
    },
    {
      name: "methods object fields keyed by field.id",
      code: `
        import * as RHF from "react-hook-form";

        function Example() {
          const fieldArray = RHF.useFieldArray({ name: "contacts" });

          return fieldArray.fields.map((field) => <input key={field.id} />);
        }
      `,
    },
    {
      name: "unrelated fields map is ignored",
      code: `
        function Example() {
          const fields = [{ id: "1" }];

          return fields.map((field, index) => <input key={index} />);
        }
      `,
    },
  ],
  invalid: [
    {
      name: "only the returned branch with an index key is reported",
      code: `
        import { useFieldArray } from "react-hook-form";
        function Example({ editing }) {
          const { fields } = useFieldArray({ name: "contacts", keyName: undefined });
          return fields.map((field, index) => {
            if (editing) return <input key={field.id} />;
            else return <span key={index} />;
          });
        }
      `,
      errors: [{ messageId: "useFieldIdKey", line: 7 }],
      output: null,
    },
    {
      name: "index key in tracked fields map",
      code: `
        import { useFieldArray } from "react-hook-form";

        function Example() {
          const { fields } = useFieldArray({ name: "contacts" });

          return fields.map((field, index) => <input key={index} />);
        }
      `,
      errors: [{ messageId: "useFieldIdKey" }],
      output: null,
    },
    {
      name: "other field property used as key",
      code: `
        import { useFieldArray } from "react-hook-form";

        function Example() {
          const { fields: contactFields } = useFieldArray({ name: "contacts" });

          return contactFields.map((contact) => <input key={contact.email} />);
        }
      `,
      errors: [{ messageId: "useFieldIdKey" }],
      output: null,
    },
    {
      name: "methods object fields map with non-id key",
      code: `
        import * as RHF from "react-hook-form";

        function Example() {
          const fieldArray = RHF.useFieldArray({ name: "contacts" });

          return fieldArray.fields.map((row) => {
            return <input key={row.name} />;
          });
        }
      `,
      errors: [{ messageId: "useFieldIdKey" }],
      output: null,
    },
  ],
});
