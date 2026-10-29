# better-react-hook-form/no-undefined-controller-default-value

📝 Disallow explicit undefined Controller defaults.

💼 This rule is enabled in the following configs: 🌐 `all`, ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

Controller defaults must have a defined value. A field-local default may be omitted when useForm.defaultValues supplies it.

## Rule details

Incorrect:

```tsx
const input = (
  <Controller
    name="email"
    defaultValue={undefined}
    render={({ field }) => <input {...field} />}
  />
);
```

Correct:

```tsx
const { control } = useForm({ defaultValues: { email: "" } });
const input = (
  <Controller
    control={control}
    name="email"
    render={({ field }) => <input {...field} />}
  />
);
```

The examples assume the corresponding hooks/components are imported from `react-hook-form` and React hooks from `react`.

## Limitations and fixes

Reports proven undefined and void 0 defaults on imported Controller/useController, including immutable aliases and statically known spreads. Shadowed undefined values and unknown later overrides are respected. Omitted defaults, null, and empty strings are allowed. There is no automatic replacement because the correct default depends on the field.

All analysis is local to a file and resolves lexical bindings. Uncertain relationships are skipped. No type information is required.

## Sources

- [RHF controller](https://react-hook-form.com/docs/usecontroller/controller)
- [RHF usecontroller](https://react-hook-form.com/docs/usecontroller)
