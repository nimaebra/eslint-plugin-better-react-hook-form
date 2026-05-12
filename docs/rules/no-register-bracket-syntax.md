# better-react-hook-form/no-register-bracket-syntax

📝 Disallow bracket syntax in react-hook-form register field paths.

💼 This rule is enabled in the ✅ `recommended` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Prefer dot syntax when passing field paths to `register()`.

## Rule Details

React Hook Form documents dot syntax for field array paths such as `users.0.name`.
Bracket syntax such as `users[0].name` is not supported consistently and should be avoided.

## Examples

Examples of **incorrect** code for this rule:

```tsx
import { useForm } from "react-hook-form";

function Example() {
  const { register } = useForm();

  return <input {...register("users[0].name")} />;
}
```

Examples of **correct** code for this rule:

```tsx
import { useForm } from "react-hook-form";

function Example() {
  const { register } = useForm();

  return <input {...register("users.0.name")} />;
}
```
