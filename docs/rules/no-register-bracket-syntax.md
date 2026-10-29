# better-react-hook-form/no-register-bracket-syntax

📝 Require dot syntax in register field paths.

💼 This rule is enabled in the following configs: 🌐 `all`, ✅ `recommended`, 🔒 `strict`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Use dot notation for field paths, matching the documented v7 TypeScript path convention.

## Rule details

Incorrect:

```tsx
const { register } = useForm();
register("users[0].name");
```

Correct:

```tsx
const { register } = useForm();
register("users.0.name");
```

The examples assume the corresponding hooks/components are imported from `react-hook-form` and React hooks from `react`.

## Limitations and fixes

Reports bracket segments in literal paths and template text. Brackets inside interpolated expressions are not path syntax. Fixes only unambiguous literal index or simple quoted-property segments and preserves surrounding TypeScript assertions. Dynamic templates, malformed paths, and ambiguous property names receive no fix.

All analysis is local to a file and resolves lexical bindings. Uncertain relationships are skipped. No type information is required.

## Sources

- [RHF register](https://react-hook-form.com/docs/useform/register)
