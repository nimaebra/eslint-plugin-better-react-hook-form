import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../../src/rules/no-undefined-set-value.js";

const tester = new RuleTester();
const wrap = (body: string) =>
  `import {useForm} from 'react-hook-form';const {setValue}=useForm();${body}`;

tester.run("no-undefined-set-value", rule, {
  valid: [
    ...[
      "null",
      "false",
      "0",
      "''",
      "'Ada'",
      "{}",
      "[]",
      "unknown",
      "void work()",
    ].map((value) => wrap(`setValue('name',${value});`)),
    wrap("setValue(...args);"),
    wrap("setValue('name',...args);"),
    wrap("setValue(...args,undefined);"),
    wrap("function clear(undefined){setValue('name',undefined)}"),
    wrap("function clear(setValue){setValue('name',undefined)}"),
    wrap("let value=undefined;value='Ada';setValue('name',value);"),
    wrap("setValue.call(null,'name',undefined);"),
    `const setValue=()=>{};setValue('name',undefined);`,
    `import {useForm} from 'other';useForm().setValue('name',undefined);`,
    `import {useForm} from 'react-hook-form';function Example(useForm){useForm().setValue('name',undefined)}`,
    `import {useForm} from 'react-hook-form';const form=useForm();form.setValue=replacement;form.setValue('name',undefined);`,
    `import {useForm} from 'react-hook-form';const form=useForm();const alias=form;Object.assign(alias,replacement);form.setValue('name',undefined);`,
    `import {useForm} from 'react-hook-form';let {setValue}=useForm();setValue=replacement;setValue('name',undefined);`,
    `import {useForm} from 'react-hook-form';const {setValue=other}=useForm();setValue('name',undefined);`,
    `import type {useForm} from 'react-hook-form';useForm().setValue('name',undefined);`,
  ],
  invalid: [
    ...[
      "setValue();",
      "setValue('name');",
      "setValue('name',undefined);",
      "setValue('name',void 0);",
      "const empty=undefined;const alias=empty;setValue('name',alias);",
      "setValue('name',undefined,...options);",
    ].map((body) => ({
      code: wrap(body),
      errors: [{ messageId: "undefinedValue" as const }],
      output: null,
    })),
    {
      code: `import {useFormContext as useContext} from 'react-hook-form';const methods=useContext();const {setValue:write}=methods;const alias=write;alias('name',undefined);`,
      errors: [{ messageId: "undefinedValue" }],
      output: null,
    },
    {
      code: `import * as RHF from 'react-hook-form';const methods=RHF.useForm();(methods as any)!.setValue?.('name',(undefined satisfies unknown));`,
      errors: [{ messageId: "undefinedValue" }],
      output: null,
    },
    {
      code: `import {useForm} from 'react-hook-form';useForm()['setValue']('name',undefined);`,
      errors: [{ messageId: "undefinedValue" }],
      output: null,
    },
  ],
});
