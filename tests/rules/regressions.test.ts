import { RuleTester } from "@typescript-eslint/rule-tester";
import { rules } from "../../src/rules/registry.js";
const tester = new RuleTester({
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});
tester.run(
  "scope-aware field-array payloads",
  rules["no-empty-usefieldarray-action"],
  {
    valid: [
      `import {useFieldArray} from 'react-hook-form';function A(){const {append}=useFieldArray({name:'a'});}function B(){const append=x=>x;append({})}`,
      `import {useFieldArray} from 'react-hook-form';function A(useFieldArray){const {append}=useFieldArray({});append({});}`,
      `import {useFieldArray} from 'react-hook-form';function A(){let {append}=useFieldArray({});append=()=>{};append({});}`,
      `import {useFieldArray} from 'react-hook-form';const fa=useFieldArray({});fa.append=()=>{};fa.append({});`,
      `import {useFieldArray} from 'react-hook-form';const {insert}=useFieldArray({});insert(...args);`,
      `import {useFieldArray} from 'react-hook-form';const {append}=useFieldArray({});append({...unknown});`,
      `import {useFieldArray} from 'react-hook-form';const fa=useFieldArray({});const alias=fa;alias.append=()=>{};fa.append({});`,
      `import {useFieldArray} from 'react-hook-form';const {append}=useFieldArray({});const recursive=[recursive];append(recursive);`,
    ],
    invalid: [
      {
        code: `import * as RHF from 'react-hook-form';const fa=RHF.useFieldArray({});const alias=fa;alias.append({});`,
        errors: [{ messageId: "provideNonEmptyValue" }],
      },
      {
        code: `import {useFieldArray} from 'react-hook-form';const {append}=useFieldArray({});const add=append;add(void 0);`,
        errors: [{ messageId: "provideNonEmptyValue" }],
      },
    ],
  },
);
tester.run(
  "field key regressions",
  rules["usefieldarray-require-field-id-key"],
  {
    valid: [
      `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({keyName:'key'});fields.map(field=><input key={field.key}/>);`,
      `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({});fields.map(({id:rowId})=><input key={rowId}/>);`,
      `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({});fields.map(field=><input {...props}/>);`,
      `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({keyName:dynamic});fields.map(field=><input key={field.custom}/>);`,
      `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({...opts});fields.map(field=><input key={field.custom}/>);`,
      `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({});fields.map(field=>{const id=field.id;return <input key={id}/>});`,
      `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({});fields.map(field=>{const {id}=field;return <input key={id}/>});`,
      `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({});fields.map(field=><input key={getKey(field)}/>);`,
    ],
    invalid: [
      {
        code: `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({});fields.map(field=><input/>);`,
        errors: [{ messageId: "useFieldIdKey" }],
      },
      {
        code: `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({});fields.map(field=><><input/></>);`,
        errors: [{ messageId: "useFieldIdKey" }],
      },
      {
        code: `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({keyName:'key'});fields.map(field=><input key={field.id}/>);`,
        errors: [{ messageId: "useFieldIdKey" }],
      },
    ],
  },
);
tester.run(
  "stacked action regressions",
  rules["no-stacked-usefieldarray-actions"],
  {
    valid: [
      `import {useFieldArray} from 'react-hook-form';const a=useFieldArray({name:'a'}),b=useFieldArray({name:'b'});function click(){a.append({x:1});b.append({x:2});}`,
      `import {useFieldArray} from 'react-hook-form';const {append,remove}=useFieldArray({});async function click(){append({x:1});await tick();remove(0);}`,
      `import {useFieldArray} from 'react-hook-form';const {append,remove}=useFieldArray({});function click(){if(ok){append({x:1})}else{remove(0)}}`,
    ],
    invalid: [
      {
        code: `import {useFieldArray} from 'react-hook-form';function A(){const {append,remove}=useFieldArray({});append({x:1});remove(0);}`,
        errors: [{ messageId: "avoidStackingActions" }],
      },
    ],
  },
);
tester.run("path regressions", rules["no-register-bracket-syntax"], {
  valid: [
    "import {useForm} from 'react-hook-form';const {register}=useForm();register(`users.${indexes[0]}.name`);",
    `import {useForm} from 'react-hook-form';function A(){const {register}=useForm()}function B(){const register=x=>x;register('a[0]')}`,
  ],
  invalid: [
    {
      code: `import {useForm} from 'react-hook-form';const {register}=useForm();register('a[0]' as const);`,
      output: `import {useForm} from 'react-hook-form';const {register}=useForm();register('a.0' as const);`,
      errors: [{ messageId: "avoidBracketSyntax" }],
    },
    {
      code: `import {useForm} from 'react-hook-form';const {register}=useForm();register("a['b.c']");`,
      output: null,
      errors: [{ messageId: "avoidBracketSyntax" }],
    },
  ],
});
tester.run(
  "dependency scope regressions",
  rules["no-form-methods-object-in-deps"],
  {
    valid: [
      `import {useForm} from 'react-hook-form';const form=useForm();function useEffect(){};useEffect(()=>{},[form]);`,
      `import {useEffect} from 'react';import {useForm} from 'react-hook-form';const form=useForm();function A(form){useEffect(()=>{},[form])}`,
      `import {useEffect} from 'react';import {useForm} from 'react-hook-form';const {formState}=useForm();useEffect(()=>{},[formState]);`,
    ],
    invalid: [],
  },
);
tester.run("Controller scope regressions", rules["no-double-register"], {
  valid: [
    `import {useForm,useController} from 'react-hook-form';function A(){const {register}=useForm();const {field}=useController({})}function B(){const register=()=>({});const field={};return <input {...field} {...register()}/>}`,
    `import {Controller,useForm} from 'react-hook-form';const {register}=useForm();const x=<Controller render={({field})=>{function Child(field){return <input {...field} {...register('x')}/>};return <Child/>}}/>;`,
  ],
  invalid: [
    {
      code: `import {Controller,useForm} from 'react-hook-form';const {register}=useForm();const x=<Controller render={(props)=><input {...props.field} {...register('x')}/>}/>;`,
      errors: [{ messageId: "avoidDoubleRegister" }],
    },
  ],
});
