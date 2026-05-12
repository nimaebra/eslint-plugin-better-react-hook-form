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

| Name                                                                           | Description                                                                             | 💼  | 🔧  |
| :----------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- | :-- | :-- |
| [no-form-methods-object-in-deps](docs/rules/no-form-methods-object-in-deps.md) | disallow useForm() and useFormContext() method objects in React hook dependency arrays. | ✅  |     |
| [no-nested-form-provider](docs/rules/no-nested-form-provider.md)               | disallow nesting react-hook-form FormProvider components.                               | ✅  |     |
| [no-register-bracket-syntax](docs/rules/no-register-bracket-syntax.md)         | disallow bracket syntax in react-hook-form register field paths.                        | ✅  | 🔧  |

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
