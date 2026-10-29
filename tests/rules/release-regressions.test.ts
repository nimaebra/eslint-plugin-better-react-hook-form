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
