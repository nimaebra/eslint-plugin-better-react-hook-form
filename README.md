# eslint-plugin-better-react-hook-form

[![npm version](https://img.shields.io/npm/v/eslint-plugin-better-react-hook-form.svg)](https://www.npmjs.com/package/eslint-plugin-better-react-hook-form)
[![CI](https://github.com/nimaebra/eslint-plugin-better-react-hook-form/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/nimaebra/eslint-plugin-better-react-hook-form/actions/workflows/ci.yml)
[![code coverage](https://codecov.io/gh/nimaebra/eslint-plugin-better-react-hook-form/branch/main/graph/badge.svg)](https://codecov.io/gh/nimaebra/eslint-plugin-better-react-hook-form)
[![license](https://img.shields.io/npm/l/eslint-plugin-better-react-hook-form.svg)](LICENSE)
[![Node.js version](https://img.shields.io/node/v/eslint-plugin-better-react-hook-form.svg)](https://www.npmjs.com/package/eslint-plugin-better-react-hook-form)

[ESLint](https://eslint.org/) rules for safer, more maintainable [React Hook Form](https://react-hook-form.com/) usage.

`eslint-plugin-better-react-hook-form` helps catch double registration, incorrect field-array keys, ignored value transforms, and other documented React Hook Form mistakes.

The plugin ships with flat-config and legacy-config presets, plus individual rules you can enable as needed. The recommended preset focuses on correctness; stricter subscription and sequencing advice is opt-in.

## Rules

<!-- begin auto-generated rules list -->

💼 Configurations enabled in.\
⚠️ Configurations set to warn in.\
🌐 Set in the `all` configuration.\
✅ Set in the `recommended` configuration.\
🔒 Set in the `strict` configuration.\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).

| Name                                                                                                   | Description                                                              | 💼       | ⚠️    | 🔧  |
| :----------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------- | :------- | :---- | :-- |
| [no-conflicting-value-transforms](docs/rules/no-conflicting-value-transforms.md)                       | disallow conflicting register value transforms.                          | 🌐 ✅ 🔒 |       |     |
| [no-deprecated-watch-callback](docs/rules/no-deprecated-watch-callback.md)                             | disallow the deprecated watch(callback) overload and prefer subscribe(). | 🌐       | ✅ 🔒 |     |
| [no-double-register](docs/rules/no-double-register.md)                                                 | disallow register() and Controller field props on the same element.      | 🌐 ✅ 🔒 |       |     |
| [no-empty-usefieldarray-action](docs/rules/no-empty-usefieldarray-action.md)                           | require non-empty row values for useFieldArray actions.                  | 🌐 ✅ 🔒 |       |     |
| [no-form-methods-object-in-deps](docs/rules/no-form-methods-object-in-deps.md)                         | disallow whole form method objects in React hook dependency arrays.      | 🌐 ✅ 🔒 |       |     |
| [no-nested-form-provider](docs/rules/no-nested-form-provider.md)                                       | disallow nesting React Hook Form providers.                              | 🌐       | ✅ 🔒 |     |
| [no-register-bracket-syntax](docs/rules/no-register-bracket-syntax.md)                                 | require dot syntax in register field paths.                              | 🌐 ✅ 🔒 |       | 🔧  |
| [no-stacked-usefieldarray-actions](docs/rules/no-stacked-usefieldarray-actions.md)                     | disallow consecutive actions on the same field array.                    | 🌐       | 🔒    |     |
| [no-undefined-controller-default-value](docs/rules/no-undefined-controller-default-value.md)           | disallow explicit undefined Controller defaults.                         | 🌐 ✅ 🔒 |       |     |
| [prefer-useformstate-over-formstate-context](docs/rules/prefer-useformstate-over-formstate-context.md) | require useFormState() for context form-state subscriptions.             | 🌐       | 🔒    |     |
| [usefieldarray-require-field-id-key](docs/rules/usefieldarray-require-field-id-key.md)                 | require the generated field-array identifier as each row's key.          | 🌐 ✅ 🔒 |       |     |

<!-- end auto-generated rules list -->

Every rule has its own documentation page under [docs/rules](docs/rules).

## Installation

```sh
npm install --save-dev eslint eslint-plugin-better-react-hook-form
# or
pnpm add -D eslint eslint-plugin-better-react-hook-form
```

| Dependency      | Supported versions       |
| :-------------- | :----------------------- |
| Node.js         | `^22.13.0 \|\| >=24.0.0` |
| ESLint          | `^9.0.0 \|\| ^10.0.0`    |
| React Hook Form | `>=7.55.0 <8`            |

React Hook Form is an optional peer dependency: shared ESLint config packages do not need to install it. The rules inspect source code without loading React Hook Form at runtime. Applications must use the supported range for the rules' guidance to apply. RHF v8 beta is not supported yet; its field-array identifiers and payload semantics differ.

## Flat Config

For ESLint 9 and 10:

```js
// eslint.config.mjs
import betterReactHookForm from "eslint-plugin-better-react-hook-form";

export default [
  ...betterReactHookForm.flatConfigs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  },
];
```

Use `flatConfigs.strict` for additional warnings or `flatConfigs.all` to evaluate every rule. Flat presets are arrays. Configure file matching and your project's parser explicitly; the example above includes `.jsx` files and enables JSX parsing in JavaScript.

### CommonJS

The default export is also available to CommonJS consumers:

```cjs
// eslint.config.cjs
const betterReactHookForm =
  require("eslint-plugin-better-react-hook-form").default;

module.exports = [
  ...betterReactHookForm.flatConfigs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  },
];
```

## Legacy Config

Legacy configuration is supported with ESLint 9 and `ESLINT_USE_FLAT_CONFIG=false`. ESLint 10 requires flat configuration.

```js
// .eslintrc.cjs
module.exports = {
  extends: ["plugin:better-react-hook-form/recommended"],
};
```

Available legacy presets are:

- `plugin:better-react-hook-form/recommended`
- `plugin:better-react-hook-form/strict`
- `plugin:better-react-hook-form/all`

## TypeScript Projects

JavaScript consumers do not need a TypeScript parser. If you lint TypeScript or TSX, install `typescript` and `typescript-eslint` as development dependencies and compose their configuration with this plugin:

```js
import tseslint from "typescript-eslint";
import betterReactHookForm from "eslint-plugin-better-react-hook-form";

export default [
  ...tseslint.configs.recommended,
  ...betterReactHookForm.flatConfigs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  },
];
```

No rule requires type-aware linting. TypeScript consumers need TypeScript 5.3 or later; declarations for early ESLint 9 versions are included as a dependency.

## Config Presets

| Preset        | Intended use                                          | Notes                                                                                                        |
| :------------ | :---------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| `recommended` | Good default for most codebases                       | Seven correctness checks as errors; deprecated callbacks and nested providers as warnings.                   |
| `strict`      | Broader subscription and sequencing advice            | Includes recommended plus warnings for consecutive field-array actions and context form-state subscriptions. |
| `all`         | Evaluating every rule, or opting into new rules early | Enables every rule as an error. New rules can join it in minor releases.                                     |

See [docs/configs.md](docs/configs.md) for exact preset membership. The default export is the plugin; named `rules`, `configs`, `flatConfigs`, and configuration types are also available. The `configs["flat/recommended"]` object remains available as an alias.

## Individual Rules

To enable rules one by one, register the plugin and configure the rules you want:

```js
import betterReactHookForm from "eslint-plugin-better-react-hook-form";

export default [
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: {
      "better-react-hook-form": betterReactHookForm,
    },
    rules: {
      "better-react-hook-form/no-double-register": "error",
      "better-react-hook-form/no-register-bracket-syntax": "warn",
    },
  },
];
```

To override a preset, place your `rules` configuration after the preset. Set a rule to `"off"` to disable it.

## Examples

Working example setups live in this repository:

- [examples/flat](examples/flat): JavaScript with the recommended flat preset.
- [examples/legacy](examples/legacy): ESLint 9 legacy configuration.
- [examples/typescript](examples/typescript): TypeScript and TSX configuration.

Each setup includes valid and intentionally invalid fixtures. The [shared rule cases](examples/rule-cases.json) exercise every rule through all three presets.

## Supported Patterns and Limitations

Rules resolve named imports, namespace imports, lexical scopes, and immutable local aliases. Unrelated identifiers and shadowed bindings are ignored. Analysis is local to a file: custom hook wrappers, values imported from other files, unknown spreads, and arbitrary runtime control flow may not be provable. These cases are skipped rather than guessed.

Only unambiguous literal bracket-path conversions receive automatic fixes. Changing subscriptions, default values, field keys, or transforms requires a developer's decision, so those rules do not auto-rewrite code.

`watch()` and direct `formState` reads are valid APIs. With React Compiler, follow RHF's [watch guidance](https://react-hook-form.com/docs/useform/watch): use `useWatch` or opt out of compilation with `"use no memo"` where appropriate. Read the state you need during render to establish subscriptions; destructuring is useful but is not universally required.

The plugin targets documented API mistakes, not temporary library bugs. The [rule rationale and roadmap](docs/rule-audit.md) explains rule decisions, upstream evidence, and future improvements.

## Contributing

Contributor setup, checks, and rule authoring live in [CONTRIBUTING.md](CONTRIBUTING.md). See [Git conventions](CONTRIBUTING.md#git-conventions) for branch names, Conventional Commits, PR titles, and releases.

Report reproducible bugs through [GitHub Issues](https://github.com/nimaebra/eslint-plugin-better-react-hook-form/issues). Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE). This is an independent community plugin, not an official React Hook Form project.
