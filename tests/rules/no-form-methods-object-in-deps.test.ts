import { RuleTester } from "@typescript-eslint/rule-tester";

import rule from "../../src/rules/no-form-methods-object-in-deps.js";

const ruleTester = new RuleTester();

ruleTester.run("no-form-methods-object-in-deps", rule, {
  valid: [
    {
      code: `
        import { useEffect } from "react";
        import { useForm } from "react-hook-form";

        function Example() {
          const { reset } = useForm();

          useEffect(() => {
            reset({ firstName: "Ada" });
          }, [reset]);
        }
      `,
    },
    {
      code: `
        import React from "react";
        import { useForm } from "react-hook-form";

        function Example() {
          const methods = useForm();

          React.useEffect(() => {
            methods.reset({ firstName: "Ada" });
          }, [methods.reset]);
        }
      `,
    },
    {
      code: `
        import { useEffect } from "react";
        import { useFormContext } from "react-hook-form";

        function Example() {
          const { reset } = useFormContext();

          useEffect(() => {
            reset();
          });
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        import { useEffect } from "react";
        import { useForm } from "react-hook-form";

        function Example() {
          const methods = useForm();

          useEffect(() => {
            methods.reset({ firstName: "Ada" });
          }, [methods]);
        }
      `,
      errors: [
        {
          data: {
            hook: "useEffect",
            name: "methods",
          },
          messageId: "avoidWholeMethodsObject",
        },
      ],
    },
    {
      code: `
        import { useCallback as useStableCallback } from "react";
        import { useFormContext as useRHFContext } from "react-hook-form";

        function Example() {
          const methods = useRHFContext();

          return useStableCallback(() => methods.reset(), [methods]);
        }
      `,
      errors: [
        {
          data: {
            hook: "useCallback",
            name: "methods",
          },
          messageId: "avoidWholeMethodsObject",
        },
      ],
    },
    {
      code: `
        import React from "react";
        import * as RHF from "react-hook-form";

        function Example() {
          const methods = RHF.useForm();

          return React.useMemo(() => methods.getValues(), [methods]);
        }
      `,
      errors: [
        {
          data: {
            hook: "useMemo",
            name: "methods",
          },
          messageId: "avoidWholeMethodsObject",
        },
      ],
    },
  ],
});
