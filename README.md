# eslint-plugin-better-react-hook-form

ESLint rules for safer React Hook Form usage.

## Installation

```sh
pnpm add -D eslint eslint-plugin-better-react-hook-form
```

## Usage

```js
// eslint.config.js
import { defineConfig } from "eslint/config";
import betterReactHookForm from "eslint-plugin-better-react-hook-form";

export default defineConfig([
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "better-react-hook-form": betterReactHookForm,
    },
    extends: ["better-react-hook-form/recommended"],
  },
]);
```

## Rules

<!-- begin auto-generated rules list -->

💼 Configurations enabled in.\
✅ Set in the `recommended` configuration.\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).

| Name                                                                                                   | Description                                                                                           | 💼  | 🔧  |
| :----------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- | :-- | :-- |
| [destructuring-formstate](docs/rules/destructuring-formstate.md)                                       | require destructuring formState properties instead of reading them from the proxy object.             | ✅  |     |
| [no-deprecated-watch-callback](docs/rules/no-deprecated-watch-callback.md)                             | disallow the deprecated watch(callback) overload and prefer subscribe().                              | ✅  |     |
| [no-double-register](docs/rules/no-double-register.md)                                                 | disallow combining register() with useController() or Controller field props on the same element.     | ✅  |     |
| [no-empty-usefieldarray-action](docs/rules/no-empty-usefieldarray-action.md)                           | require non-empty values for append(), prepend(), insert(), and update() returned by useFieldArray(). | ✅  |     |
| [no-form-methods-object-in-deps](docs/rules/no-form-methods-object-in-deps.md)                         | disallow useForm() and useFormContext() method objects in React hook dependency arrays.               | ✅  |     |
| [no-nested-form-provider](docs/rules/no-nested-form-provider.md)                                       | disallow nesting react-hook-form FormProvider components.                                             | ✅  |     |
| [no-register-bracket-syntax](docs/rules/no-register-bracket-syntax.md)                                 | disallow bracket syntax in react-hook-form register field paths.                                      | ✅  | 🔧  |
| [no-stacked-usefieldarray-actions](docs/rules/no-stacked-usefieldarray-actions.md)                     | disallow stacking multiple useFieldArray() actions in the same synchronous block.                     | ✅  |     |
| [no-use-watch](docs/rules/no-use-watch.md)                                                             | disallow the watch() method and require useWatch() instead.                                           | ✅  |     |
| [no-values-with-shouldunregister](docs/rules/no-values-with-shouldunregister.md)                       | disallow combining useForm() values with shouldUnregister: true.                                      |     |     |
| [prefer-useformstate-over-formstate-context](docs/rules/prefer-useformstate-over-formstate-context.md) | require useFormState() instead of formState subscriptions taken from useFormContext().                | ✅  |     |
| [usefieldarray-require-field-id-key](docs/rules/usefieldarray-require-field-id-key.md)                 | require rows rendered from useFieldArray().fields.map() to use field.id as their key.                 | ✅  |     |

<!-- end auto-generated rules list -->

## Configs

<!-- begin auto-generated configs list -->

|     | Name          |
| :-- | :------------ |
| ✅  | `recommended` |

<!-- end auto-generated configs list -->

## Development

```sh
pnpm install
pnpm lint
pnpm typecheck
pnpm test
```
