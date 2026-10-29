# better-react-hook-form/no-deprecated-watch-callback

📝 Disallow the deprecated watch(callback) overload and prefer subscribe().

💼⚠️ This rule is enabled in the 🌐 `all` config. This rule _warns_ in the following configs: ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

Replace deprecated callback subscriptions with subscribe. This is a recommended warning. Ordinary watch(name), watch(names), and watch() remain valid.

## Rule details

Incorrect:

```tsx
const { watch } = useForm();
watch(() => console.log("changed"));
```

Correct:

```tsx
const { subscribe } = useForm();
const unsubscribe = subscribe({
  formState: { values: true },
  callback: ({ values }) => console.log(values),
});
// Call unsubscribe when the subscription is no longer needed.
```

The examples assume the corresponding hooks/components are imported from `react-hook-form` and React hooks from `react`.

## Limitations and fixes

Only inline functions or locally proven function references are reported. Imported callbacks with unknown values are skipped. Migration changes arguments and the cleanup return shape; there is no automatic fix.

All analysis is local to a file and resolves lexical bindings. Uncertain relationships are skipped. No type information is required.

## Sources

- [RHF watch](https://react-hook-form.com/docs/useform/watch)
- [RHF subscribe](https://react-hook-form.com/docs/useform/subscribe)
