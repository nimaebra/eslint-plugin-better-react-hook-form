import { RuleTester } from "@typescript-eslint/rule-tester";

import rule from "../../src/rules/no-stacked-usefieldarray-actions.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run("no-stacked-usefieldarray-actions", rule, {
  valid: [
    {
      name: "single action in a callback",
      code: `
        import { useFieldArray } from "react-hook-form";

        function Example() {
          const { append } = useFieldArray({ name: "contacts" });

          return (
            <button
              type="button"
              onClick={() => {
                append({ email: "hello@example.com" });
              }}
            />
          );
        }
      `,
    },
    {
      name: "actions split across blocks",
      code: `
        import { useEffect } from "react";
        import { useFieldArray } from "react-hook-form";

        function Example() {
          const { append, remove } = useFieldArray({ name: "contacts" });

          useEffect(() => {
            remove(0);
          }, [remove]);

          return (
            <button
              type="button"
              onClick={() => {
                append({ email: "hello@example.com" });
              }}
            />
          );
        }
      `,
    },
    {
      name: "unrelated helper names are ignored",
      code: `
        function Example() {
          const append = () => undefined;
          const remove = () => undefined;

          append();
          remove();
        }
      `,
    },
    {
      name: "single methods object action",
      code: `
        import * as RHF from "react-hook-form";

        function Example() {
          const fieldArray = RHF.useFieldArray({ name: "contacts" });

          fieldArray.append({ email: "hello@example.com" });
        }
      `,
    },
  ],
  invalid: [
    {
      name: "append and remove in the same click handler",
      code: `
        import { useFieldArray } from "react-hook-form";

        function Example() {
          const { append, remove } = useFieldArray({ name: "contacts" });

          return (
            <button
              type="button"
              onClick={() => {
                append({ email: "hello@example.com" });
                remove(0);
              }}
            />
          );
        }
      `,
      errors: [{ messageId: "avoidStackingActions" }],
      output: null,
    },
    {
      name: "aliased actions in the same function",
      code: `
        import { useFieldArray } from "react-hook-form";

        function Example() {
          const { append: addContact, replace } = useFieldArray({ name: "contacts" });

          function handleClick() {
            addContact({ email: "hello@example.com" });
            replace([]);
          }

          return <button type="button" onClick={handleClick} />;
        }
      `,
      errors: [{ messageId: "avoidStackingActions" }],
      output: null,
    },
    {
      name: "methods object actions in one block",
      code: `
        import * as RHF from "react-hook-form";

        function Example() {
          const fieldArray = RHF.useFieldArray({ name: "contacts" });

          const handleClick = () => {
            fieldArray.swap(0, 1);
            fieldArray.move(1, 0);
          };

          return <button type="button" onClick={handleClick} />;
        }
      `,
      errors: [{ messageId: "avoidStackingActions" }],
      output: null,
    },
  ],
});
