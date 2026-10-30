import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../../src/rules/no-duplicate-usefieldarray.js";

const tester = new RuleTester();
const wrap = (body: string) =>
  `import {useForm,useFieldArray} from 'react-hook-form';function Example(){const {control}=useForm();${body}}`;
const first = "useFieldArray({control,name:'items'});";
const error = {
  messageId: "duplicateFieldArray" as const,
  data: { name: "items" },
};

tester.run("no-duplicate-usefieldarray", rule, {
  valid: [
    wrap(first),
    wrap(first + "useFieldArray({control,name:'users'});"),
    wrap(
      first +
        "const other=useForm();useFieldArray({control:other.control,name:'items'});",
    ),
    ...[
      "useFieldArray({name:'items'});",
      "useFieldArray({control:unknown,name:'items'});",
      "useFieldArray({control,name});",
      "useFieldArray({control,name:`items.${index}`});",
      "useFieldArray({control,name:'items',disabled:true});",
      "useFieldArray({control,name:'items',disabled:unknown});",
      "useFieldArray({control,name:'items',...unknown});",
      "useFieldArray({...unknown,control,name:'items'});",
      "useFieldArray({...unknown,control,name:'items',disabled:false,get name(){return 'items'}});",
      "useFieldArray({...unknown,control,name:'items',disabled:false,get control(){return control}});",
      "useFieldArray(...args);",
      "useFieldArray();",
      "if(ready)useFieldArray({control,name:'items'});",
      "ready && useFieldArray({control,name:'items'});",
      "const array=ready?useFieldArray({control,name:'items'}):other;",
      "{useFieldArray({control,name:'items'});}",
      "function Child(){useFieldArray({control,name:'items'});}",
      "const child=()=>useFieldArray({control,name:'items'});",
      "consume(useFieldArray({control,name:'items'}));",
      "return;useFieldArray({control,name:'items'});",
      "throw error;useFieldArray({control,name:'items'});",
    ].map((second) => wrap(first + second)),
    wrap("useFieldArray({control,name:'items',disabled:true});" + first),
    wrap(
      "const options={control,name:'items'};options.name='users';useFieldArray(options);" +
        first,
    ),
    wrap(
      "const options={control,name:'items'};const alias=options;Object.assign(alias,replacement);useFieldArray(options);" +
        first,
    ),
    wrap(
      "const options={control,name:'items'};useFieldArray(options);delete options.control;" +
        first,
    ),
    wrap(
      "function inner(control){useFieldArray({control,name:'items'});useFieldArray({control,name:'items'});}",
    ),
    `import {useFieldArray} from 'react-hook-form';function Example(control){useFieldArray({control,name:'items'});useFieldArray({control,name:'items'});}`,
    `import {useForm,useFieldArray} from 'other';function Example(){const {control}=useForm();${first}${first}}`,
    `import {useForm,useFieldArray} from 'react-hook-form';function Example(useFieldArray){const {control}=useForm();${first}${first}}`,
    `import {useForm,useFieldArray} from 'react-hook-form';const {control}=useForm();${first}${first}`,
    `import {useForm,useFieldArray} from 'react-hook-form';const form=useForm();function One(){useFieldArray({control:form.control,name:'items'})}function Two(){useFieldArray({control:form.control,name:'items'})}`,
    `import {useForm,useFieldArray} from 'react-hook-form';function Example(){let {control}=useForm();control=other;${first}${first}}`,
  ],
  invalid: [
    ...[
      first + first,
      "const one=useFieldArray({control,name:'items'});const two=useFieldArray({control,name:'items'});",
      "const one=useFieldArray({control,name:'items'}),two=useFieldArray({control,name:'items'});",
      first + "useFieldArray({control,name:`items`,disabled:false});",
      first +
        "useFieldArray({...unknown,control,name:'items',disabled:undefined});",
      "const name='items';const alias=name;useFieldArray({control,name});useFieldArray({control,name:alias});",
      "const options={control,name:'items'};useFieldArray(options);useFieldArray({...options});",
      "const alias=control;" +
        first +
        "useFieldArray({control:alias,name:'items'});",
      "const one=(useFieldArray({control,name:'items'}) as any)!;const two=useFieldArray({control,name:'items'}) satisfies unknown;",
    ].map((body) => ({ code: wrap(body), errors: [error], output: null })),
    {
      code: wrap(first + first + first),
      errors: [error, error],
      output: null,
    },
    {
      code: `import * as RHF from 'react-hook-form';const Example=()=>{const methods=RHF.useFormContext();const {control:inputControl}=methods;const array=RHF.useFieldArray;array({control:inputControl,name:'items'});array({control:methods.control,name:'items'});};`,
      errors: [error],
      output: null,
    },
    {
      code: `import {useForm,useFieldArray} from 'react-hook-form';const Example=function(){const form=useForm();const {control}=form;${first}${first}};`,
      errors: [error],
      output: null,
    },
  ],
});
