import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../../src/rules/no-undefined-controller-on-change.js";

const tester = new RuleTester({
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});
const wrap = (body: string) =>
  `import {useController} from 'react-hook-form';const {field}=useController({name:'name'});${body}`;

tester.run("no-undefined-controller-on-change", rule, {
  valid: [
    ...[
      "null",
      "false",
      "0",
      "''",
      "event",
      "{target:{value:''}}",
      "{target:{value:undefined}}",
      "void work()",
    ].map((value) => wrap(`field.onChange(${value});`)),
    wrap("field.onChange(...args);"),
    wrap("field.onChange(...args,undefined);"),
    wrap("field.onBlur();"),
    wrap("function clear(undefined){field.onChange(undefined)}"),
    wrap("function clear(field){field.onChange(undefined)}"),
    wrap("field.onChange=replacement;field.onChange(undefined);"),
    wrap(
      "const alias=field;Reflect.set(alias,'onChange',replacement);field.onChange(undefined);",
    ),
    wrap("let empty=undefined;empty='';field.onChange(empty);"),
    `const field={onChange(){}};field.onChange(undefined);`,
    `import {useController} from 'other';useController().field.onChange(undefined);`,
    `import {useController} from 'react-hook-form';function Example(useController){useController().field.onChange(undefined)}`,
    `import {Controller} from 'other';const view=<Controller render={({field})=>field.onChange(undefined)}/>;`,
    `import {Controller} from 'react-hook-form';const view=<Controller render={({field})=>field.onChange(undefined)} {...props}/>;`,
    `import {Controller} from 'react-hook-form';const view=<Controller render={({field})=>field.onChange(undefined)} render={()=>null}/>;`,
    `import {Controller} from 'react-hook-form';const view=<Controller {...{render:({field})=>field.onChange(undefined)}}/>;`,
    `import {Controller} from 'react-hook-form';function Example(Controller){return <Controller render={({field})=>field.onChange(undefined)}/>}`,
    `import {Controller} from 'react-hook-form';const view=<Controller render={({field=other})=>field.onChange(undefined)}/>;`,
    `import {Controller} from 'react-hook-form';const view=<Controller render={({field})=>{field=other;field.onChange(undefined);return null}}/>;`,
    `import {Controller} from 'react-hook-form';const render=({field})=>field.onChange(undefined);const view=<Controller render={render}/>;`,
  ],
  invalid: [
    ...[
      "field.onChange();",
      "field.onChange(undefined);",
      "field.onChange(void 0);",
      "const empty=undefined;const alias=empty;field.onChange(alias);",
      "field.onChange(undefined,...rest);",
    ].map((body) => ({
      code: wrap(body),
      errors: [{ messageId: "undefinedChangeValue" as const }],
      output: null,
    })),
    {
      code: `import * as RHF from 'react-hook-form';const {field:{onChange:change}}=RHF.useController({name:'name'});const alias=change;alias((undefined as any)!);`,
      errors: [{ messageId: "undefinedChangeValue" }],
      output: null,
    },
    {
      code: `import {Controller as Field} from 'react-hook-form';const view=<Field render={({field:input})=><button onClick={()=>input.onChange(undefined)}/>}/>;`,
      errors: [{ messageId: "undefinedChangeValue" }],
      output: null,
    },
    {
      code: `import * as RHF from 'react-hook-form';const view=<RHF.Controller render={({field:{onChange:change}})=>{const alias=change;alias();return null}}/>;`,
      errors: [{ messageId: "undefinedChangeValue" }],
      output: null,
    },
    {
      code: `import {Controller} from 'react-hook-form';const view=<Controller {...props} render={(({field})=>field['onChange'](void 0)) as any}/>;`,
      errors: [{ messageId: "undefinedChangeValue" }],
      output: null,
    },
    {
      code: `import {Controller} from 'react-hook-form';const view=<Controller render={args=>args.field.onChange(undefined)}/>;`,
      errors: [{ messageId: "undefinedChangeValue" }],
      output: null,
    },
  ],
});
