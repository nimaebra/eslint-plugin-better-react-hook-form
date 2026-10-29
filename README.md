# eslint-plugin-better-react-hook-form

ESLint rules for safer, more maintainable React Hook Form usage.

Catch double registration, incorrect field-array keys, ignored value transforms, and other documented RHF mistakes. The recommended preset focuses on correctness; stricter subscription and sequencing advice is opt-in.

**Publication status:** the first npm release is pending. The commands below describe the package after publication. To try the current source, clone this repository, run `pnpm install && pnpm build`, and use an [example configuration](examples).

## Compatibility

| Dependency      | Supported versions |
| :-------------- | :----------------- |
| Node.js         | `^22.13.0          |     | >=24.0.0` |
| ESLint          | `^9.0.0            |     | ^10.0.0`  |
| React Hook Form | `>=7.55.0 <8`      |

RHF is an optional peer dependency: the plugin does not import or execute your form library. Applications must use the supported RHF range for the rules' guidance to apply. RHF v8 beta is not supported yet; its field-array identifiers and payload semantics differ.

JavaScript projects do not need a TypeScript parser. TypeScript/TSX projects should configure `typescript-eslint`. No rule requires type-aware linting.

## Installation

After the first npm release:

```sh
npm install --save-dev eslint eslint-plugin-better-react-hook-form
# or
pnpm add -D eslint eslint-plugin-better-react-hook-form
```

## Flat configuration

ESLint 9 and 10:

```js
// eslint.config.mjs
import betterReactHookForm from "eslint-plugin-better-react-hook-form";

export default [...betterReactHookForm.flatConfigs.recommended];
```

For TypeScript and TSX:

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

Enable `flatConfigs.strict` for the additional warnings or `flatConfigs.all` to evaluate every rule. Flat presets are arrays. The existing `configs["flat/recommended"]` object remains available as an alias.

## Legacy configuration

Legacy configuration is supported with ESLint 9 and `ESLINT_USE_FLAT_CONFIG=false`. ESLint 10 requires flat configuration.

```js
// .eslintrc.cjs
module.exports = {
  extends: ["plugin:better-react-hook-form/recommended"],
};
```

Legacy presets are `recommended`, `strict`, and `all` under `plugin.configs`.

## Presets and overrides

| Preset        | Purpose                                                                                             |
| :------------ | :-------------------------------------------------------------------------------------------------- |
| `recommended` | Seven correctness checks as errors; deprecated callbacks and nested providers as warnings.          |
| `strict`      | Recommended plus warnings for consecutive field-array actions and context form-state subscriptions. |
| `all`         | Every rule as an error. New rules can join this preset in minor releases.                           |

See [exact preset membership](docs/configs.md). To enable individual rules or override a preset:

```js
import betterReactHookForm from "eslint-plugin-better-react-hook-form";

export default [
  ...betterReactHookForm.flatConfigs.recommended,
  {
    rules: {
      "better-react-hook-form/no-nested-form-provider": "off",
      "better-react-hook-form/no-stacked-usefieldarray-actions": "warn",
    },
  },
];
```

The default export is the plugin. Named `rules`, `configs`, and `flatConfigs` exports and configuration types are also available. CommonJS consumers can use `require("eslint-plugin-better-react-hook-form").default`.

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

## Supported patterns and limitations

Rules resolve named imports, namespace imports, lexical scopes, and immutable local aliases. Unrelated identifiers and shadowed bindings are ignored. Analysis is local to a file: custom hook wrappers, values imported from other files, unknown spreads, and arbitrary runtime control flow may not be provable. These cases are skipped rather than guessed.

Only unambiguous literal bracket-path conversions receive automatic fixes. Changing subscriptions, default values, field keys, or transforms requires a developer's decision, so those rules do not auto-rewrite code.

`watch()` and direct `formState` reads are valid APIs. With React Compiler, follow RHF's [watch guidance](https://react-hook-form.com/docs/useform/watch): use `useWatch` or opt out of compilation with `"use no memo"` where appropriate. Read the state you need during render to establish subscriptions; destructuring is useful but is not universally required.

The plugin targets documented API mistakes, not temporary library bugs. The [rule audit and roadmap](docs/rule-audit.md) explains removed rules, upstream evidence, and future candidates.

## Development and contributing

```sh
nvm use
corepack enable
pnpm install
pnpm check
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, rules, tests, Git conventions, and releases. Runnable fixtures live under [examples](examples). Report reproducible issues through [GitHub Issues](https://github.com/nimaebra/eslint-plugin-better-react-hook-form/issues); report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

MIT licensed. This is an independent community plugin, not an official React Hook Form project.
