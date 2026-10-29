import { RuleTester } from "@typescript-eslint/rule-tester";
import { rules } from "../../src/rules/registry.js";

const tester = new RuleTester({
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

tester.run(
  "replaced methods never receive path fixes",
  rules["no-register-bracket-syntax"],
  {
    valid: [
      ...[
        "(form as any).register = replacement;",
        "((form as any)!).register = replacement;",
        "const alias = ((form as any)!); alias.register = replacement;",
        "(form satisfies unknown).register = replacement;",
        "form!.register = replacement;",
        "const alias = (form as any); alias.register = replacement;",
        "const alias = form!; delete alias.register;",
        "({register: form.register} = replacement);",
        "({register: form.register = fallback} = replacement);",
        "[form.register] = replacements;",
        "[...form.register] = replacements;",
        "for (form.register of replacements) {}",
        "for (form.register in replacements) {}",
        "form.register++;",
      ].map(
        (write) =>
          `import {useForm} from 'react-hook-form'; const form=useForm(); ${write} form.register('users[0].name');`,
      ),
      `import {useForm} from 'react-hook-form';const form=useForm();const alias=(form as any);const second=alias!;second.register=replacement;form.register('users[0].name');`,
      `import {useForm} from 'react-hook-form';const form=useForm();const alias=form;const cycle=alias;cycle.register=replacement;form.register('users[0].name');`,
    ],
    invalid: [
      {
        code: `import {useForm} from 'react-hook-form';const form=useForm();const alias=(form as any);alias.register('users[0].name');`,
        output: `import {useForm} from 'react-hook-form';const form=useForm();const alias=(form as any);alias.register('users.0.name');`,
        errors: [{ messageId: "avoidBracketSyntax" }],
      },
      {
        code: `import {useForm} from 'react-hook-form';const form=useForm();const other={};other.register=replacement;form.register('users[0].name');`,
        output: `import {useForm} from 'react-hook-form';const form=useForm();const other={};other.register=replacement;form.register('users.0.name');`,
        errors: [{ messageId: "avoidBracketSyntax" }],
      },
    ],
  },
);

tester.run(
  "field keys stop following overwritten values",
  rules["usefieldarray-require-field-id-key"],
  {
    valid: [
      ...[
        "let key=field.name;key=getKey(field);return <input key={key}/>;",
        "let {name:key}=field;key=getKey(field);return <input key={key}/>;",
        "field=getOtherRow();return <input key={field.name}/>;",
        "field.name=field.id;return <input key={field.name}/>;",
        "const alias=(field as any);alias.name=field.id;return <input key={field.name}/>;",
        "index=getKey(field);return <input key={index}/>;",
        "({name:field.name}=other);return <input key={field.name}/>;",
      ].map(
        (body) =>
          `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({name:'users'});fields.map((field,index)=>{${body}});`,
      ),
    ],
    invalid: [
      {
        code: `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({});fields.map(field=>{const {name:key}=field;return <input key={key}/>;});`,
        errors: [{ messageId: "useFieldIdKey" }],
      },
      {
        code: `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({});fields.map((field,index)=>{const key=index;return <input key={key}/>;});`,
        errors: [{ messageId: "useFieldIdKey" }],
      },
    ],
  },
);

tester.run(
  "transform argument positions must be known",
  rules["no-conflicting-value-transforms"],
  {
    valid: [
      `import {useForm} from 'react-hook-form';const {register}=useForm();register(...args,{valueAsNumber:true,valueAsDate:true});`,
      `import {useForm} from 'react-hook-form';const {register}=useForm();register('age',...args);`,
    ],
    invalid: [
      {
        code: `import {useForm} from 'react-hook-form';const {register}=useForm();register('age',{valueAsNumber:true,valueAsDate:true},...args);`,
        errors: [{ messageId: "conflictingTransforms" }],
      },
    ],
  },
);

tester.run(
  "built-in mutations stop path fixes",
  rules["no-register-bracket-syntax"],
  {
    valid: [
      ...[
        "Object.assign(form, {register: replacement});",
        "Object['assign'](form, replacement);",
        "Object.defineProperty(form, 'register', {value: replacement});",
        "Object.defineProperties(form, {register: {value: replacement}});",
        "Object.setPrototypeOf(form, replacement);",
        "Reflect.set(form, 'register', replacement);",
        "Reflect.defineProperty(form, 'register', {value: replacement});",
        "Reflect.deleteProperty(form, 'register');",
        "Reflect.setPrototypeOf(form, replacement);",
        "const alias = (form as any); Object.assign(alias, replacement);",
      ].map(
        (mutation) =>
          `import {useForm} from 'react-hook-form'; const form=useForm(); ${mutation} form.register('users[0].name');`,
      ),
    ],
    invalid: [
      ...[
        "Object.assign({}, form);",
        "Object.freeze(form);",
        "constructor.inspect(form);",
        "Object[method](form);",
        "function Object() {} Object.assign(form, replacement);",
        "const Reflect = {set() {}}; Reflect.set(form, 'register', replacement);",
      ].map((source) => ({
        code: `import {useForm} from 'react-hook-form';const form=useForm();${source}form.register('x[0]');`,
        output: `import {useForm} from 'react-hook-form';const form=useForm();${source}form.register('x.0');`,
        errors: [{ messageId: "avoidBracketSyntax" as const }],
      })),
    ],
  },
);

tester.run(
  "mutated payload aliases are unknown",
  rules["no-empty-usefieldarray-action"],
  {
    valid: [
      `import {useFieldArray} from 'react-hook-form';const {append}=useFieldArray({});const row={};Object.assign(row,{name:'Ada'});append(row);`,
      `import {useFieldArray} from 'react-hook-form';const {append}=useFieldArray({});const row={};Reflect.set(row,'name','Ada');append(row);`,
    ],
    invalid: [],
  },
);

tester.run(
  "nested aliases respect mutations",
  rules["usefieldarray-require-field-id-key"],
  {
    valid: [
      ...[
        "const {nested}=field; nested.id=field.id;",
        "const nested=field.nested; nested.id=field.id;",
        "const {nested: alias}=field; Object.assign(alias,{id:field.id});",
      ].map(
        (mutation) =>
          `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({});fields.map(field=>{${mutation}return <input key={field.nested.id}/>});`,
      ),
    ],
    invalid: [
      {
        code: `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({});fields.map(field=>{const {nested}=field;return <input key={nested.id}/>});`,
        errors: [{ messageId: "useFieldIdKey" }],
      },
    ],
  },
);

tester.run(
  "dependency argument positions must be known",
  rules["no-form-methods-object-in-deps"],
  {
    valid: [
      `import {useEffect} from 'react';import {useForm} from 'react-hook-form';const form=useForm();useEffect(...args,[form]);`,
    ],
    invalid: [
      {
        code: `import {useEffect} from 'react';import {useForm} from 'react-hook-form';const form=useForm();useEffect(()=>{},[form],...args);`,
        errors: [{ messageId: "avoidWholeMethodsObject" }],
      },
    ],
  },
);

tester.run(
  "undefined field keys are missing keys",
  rules["usefieldarray-require-field-id-key"],
  {
    valid: [
      `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({});fields.map((field,undefined)=><input key={getKey(undefined)}/>);`,
      `import {useFieldArray} from 'react-hook-form';function Component(undefined){const {fields}=useFieldArray({});return fields.map(field=><input key={undefined}/>);}`,
    ],
    invalid: [
      ...["undefined", "void 0", "missing"].map((value) => ({
        code: `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({});const missing=undefined;fields.map(field=><input key={${value}}/>);`,
        errors: [{ messageId: "useFieldIdKey" as const }],
      })),
    ],
  },
);

tester.run(
  "only effective Controller renders provide fields",
  rules["no-double-register"],
  {
    valid: [
      `import {Controller,useForm} from 'react-hook-form';const {register}=useForm();const view=<Controller render={({field})=><input {...field} {...register('x')}/>} {...props}/>;`,
      `import {Controller,useForm} from 'react-hook-form';const {register}=useForm();const view=<Controller render={({field})=><input {...field} {...register('x')}/>} render={()=>null}/>;`,
    ],
    invalid: [
      {
        code: `import {Controller,useForm} from 'react-hook-form';const {register}=useForm();const view=<Controller {...props} render={({field})=><input {...field} {...register('x')}/>}/>;`,
        errors: [{ messageId: "avoidDoubleRegister" }],
      },
      {
        code: `import {Controller,useForm} from 'react-hook-form';const {register}=useForm();const view=<Controller render={(({field})=><input {...field} {...register('x')}/>) as any}/>;`,
        errors: [{ messageId: "avoidDoubleRegister" }],
      },
    ],
  },
);

tester.run(
  "custom option prototypes are unknown",
  rules["usefieldarray-require-field-id-key"],
  {
    valid: [
      `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({__proto__:{keyName:'rowKey'}});fields.map(field=><input key={field.rowKey}/>);`,
    ],
    invalid: [
      {
        code: `import {useFieldArray} from 'react-hook-form';const {fields}=useFieldArray({__proto__:{keyName:'other'},keyName:'rowKey'});fields.map((field,index)=><input key={index}/>);`,
        errors: [{ messageId: "useFieldIdKey" }],
      },
    ],
  },
);
