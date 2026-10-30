# better-react-hook-form/no-undefined-set-value

📝 Require a defined value argument for setValue().

💼 This rule is enabled in the 🌐 `all` config.

<!-- end auto-generated rule header -->

React Hook Form requires the second argument of `setValue` to be present and defined. An undefined value can leave field state inconsistent with the intended cleared value.

## Rule details

Incorrect:

```tsx
const { setValue } = useForm();
setValue("email", undefined);
```

Correct:

```tsx
const { setValue } = useForm();
setValue("email", "");
```

The examples assume the corresponding hooks/components are imported from `react-hook-form` and React hooks from `react`.

## Limitations and fixes

Reports missing second arguments, unshadowed global `undefined`, `void 0`, and immutable aliases proven to contain either value. Resolves `setValue` from `useForm` and `useFormContext`, including named/namespace imports, destructuring, member calls, and stable local aliases.

Allows `null`, `false`, zero, and empty strings. Values imported from other files, unknown runtime values, custom hook wrappers, reassigned methods, and spreads that make the value's argument position uncertain are skipped. It does not inspect nested properties for undefined values or resolve `.call`/`.apply` invocations.

All analysis is local to a file. No type information is required. The rule is individually opt-in and enabled as an error in `all`; it is disabled in `recommended` and `strict`. There is no autofix because the right value depends on the field.

## Sources

- [RHF setValue requirements](https://react-hook-form.com/docs/useform/setvalue)
