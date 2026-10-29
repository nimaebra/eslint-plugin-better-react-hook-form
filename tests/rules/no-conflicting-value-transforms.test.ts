import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../../src/rules/no-conflicting-value-transforms.js";
const tester = new RuleTester();
const wrap = (options: string) =>
  `import {useForm} from 'react-hook-form'; const {register}=useForm(); register('age',${options});`;
tester.run("no-conflicting-value-transforms", rule, {
  valid: [
    wrap("{valueAsNumber:true}"),
    wrap("{valueAsNumber:false,setValueAs:v=>v}"),
    wrap("{valueAsNumber:true,setValueAs:undefined}"),
    wrap("{valueAsNumber:true,valueAsDate:true,...unknown}"),
    wrap("{valueAsNumber:true,...{valueAsNumber:false},setValueAs:v=>v}"),
    `const register=()=>{};register('x',{valueAsNumber:true,valueAsDate:true});`,
    `import {useForm} from 'react-hook-form';function A(useForm){const {register}=useForm();register('x',{valueAsNumber:true,valueAsDate:true});}`,
  ],
  invalid: [
    ...[
      "{valueAsNumber:true,valueAsDate:true}",
      "{valueAsNumber:true,setValueAs:v=>v}",
      "{valueAsDate:true,setValueAs:v=>v}",
      "{...unknown,valueAsDate:true,valueAsNumber:true}",
      "{...{valueAsNumber:true},setValueAs:v=>v}",
    ].map((options) => ({
      code: wrap(options),
      errors: [{ messageId: "conflictingTransforms" as const }],
    })),
    {
      code: `import * as RHF from 'react-hook-form';const form=RHF.useForm();const alias=form.register;const transform=(v)=>v;alias('x',{valueAsNumber:true,setValueAs:transform});`,
      errors: [{ messageId: "conflictingTransforms" }],
    },
  ],
});
