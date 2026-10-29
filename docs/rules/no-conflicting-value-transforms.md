# better-react-hook-form/no-conflicting-value-transforms

📝 Disallow conflicting register value transforms.

💼 This rule is enabled in the following configs: 🌐 `all`, ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

register applies one value conversion; setValueAs is ignored when valueAsNumber or valueAsDate is enabled.

## Rule details

Incorrect:

```tsx
const { register } = useForm();
register("age", { valueAsNumber: true, setValueAs: (value) => Number(value) });
```

Correct:

```tsx
const { register } = useForm();
register("age", {
  setValueAs: (value) => (value === "" ? undefined : Number(value)),
});
```

The examples assume the corresponding hooks/components are imported from `react-hook-form` and React hooks from `react`.

## Limitations and fixes

Reports both built-in transforms set to literal true, or a built-in enabled alongside a locally proven custom function. Resolves immutable options and known spreads in property order. Unknown effective values, imported function implementations, and overwritten properties are skipped. No fix chooses your intended conversion.

All analysis is local to a file and resolves lexical bindings. Uncertain relationships are skipped. No type information is required.

## Sources

- [RHF register](https://react-hook-form.com/docs/useform/register)
