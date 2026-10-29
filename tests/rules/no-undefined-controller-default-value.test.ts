import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../../src/rules/no-undefined-controller-default-value.js";
const tester = new RuleTester({
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});
tester.run("no-undefined-controller-default-value", rule, {
  valid: [
    `import {Controller} from 'react-hook-form';const x=<Controller name='x'/>;`,
    `import {useController} from 'react-hook-form';useController({name:'x',defaultValue:''});`,
    `import {Controller} from 'react-hook-form';function A(undefined){return <Controller defaultValue={undefined}/>}`,
    `import {Controller} from 'react-hook-form';const x=<Controller defaultValue={undefined} {...props}/>;`,
    `import {useController} from 'react-hook-form';useController({defaultValue:undefined,...props});`,
    `import {Controller} from 'other';const x=<Controller defaultValue={undefined}/>;`,
    `import {useController} from 'react-hook-form';function A(useController){useController({defaultValue:undefined})}`,
    `import {useController} from 'react-hook-form';useController({defaultValue:null});`,
  ],
  invalid: [
    {
      code: `import {Controller} from 'react-hook-form';const x=<Controller defaultValue={undefined}/>;`,
      errors: [{ messageId: "undefinedDefaultValue" }],
    },
    {
      code: `import * as RHF from 'react-hook-form';const x=<RHF.Controller defaultValue={void 0}/>;`,
      errors: [{ messageId: "undefinedDefaultValue" }],
    },
    {
      code: `import {useController as uc} from 'react-hook-form';uc({defaultValue:undefined});`,
      errors: [{ messageId: "undefinedDefaultValue" }],
    },
    {
      code: `import {useController} from 'react-hook-form';useController({...props,defaultValue:void 0});`,
      errors: [{ messageId: "undefinedDefaultValue" }],
    },
    {
      code: `import {Controller} from 'react-hook-form';const defaults={defaultValue:undefined};const x=<Controller {...defaults}/>;`,
      errors: [{ messageId: "undefinedDefaultValue" }],
    },
  ],
});
