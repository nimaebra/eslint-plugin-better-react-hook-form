# better-react-hook-form/no-double-register

📝 Disallow register() and Controller field props on the same element.

💼 This rule is enabled in the following configs: 🌐 `all`, ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

A Controller field already owns registration. Spreading register() on the same element can replace its handlers or ref.

## Rule details

Incorrect:

```tsx
const { register } = useForm();
const { field } = useController({ name: "email" });
const input = <input {...field} {...register("email")} />;
```

Correct:

```tsx
const { field } = useController({ name: "email" });
const input = <input {...field} />;
```

The examples assume the corresponding hooks/components are imported from `react-hook-form` and React hooks from `react`.

## Limitations and fixes

Checks proven full field and register spreads on the same element, including Controller render parameters. Partial props and custom wrappers are not inferred. No automatic fix chooses which registration to retain.

All analysis is local to a file and resolves lexical bindings. Uncertain relationships are skipped. No type information is required.

## Sources

- [RHF controller](https://react-hook-form.com/docs/usecontroller/controller)
