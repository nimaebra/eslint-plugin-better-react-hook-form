# better-react-hook-form/no-deprecated-watch-callback

📝 Disallow the deprecated watch(callback) overload and prefer subscribe().

💼⚠️ This rule is enabled in the 🌐 `all` config. This rule _warns_ in the following configs: ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

Use `subscribe` to observe changes without triggering a render. The callback overload of `watch` is deprecated. Continue using `watch(name)`, `watch(names)`, or `watch()` when rendering from watched values.

## Rule details

Incorrect:

```tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";

function Form() {
  const { watch } = useForm();

  useEffect(() => {
    const { unsubscribe } = watch((values) => console.log(values));
    return unsubscribe;
  }, [watch]);

  return null;
}
```

Correct:

```tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";

function Form() {
  const { subscribe } = useForm();

  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ values }) => console.log(values),
      }),
    [subscribe],
  );

  return null;
}
```

## Limitations and fixes

Only inline functions or locally proven function references are reported. Imported callbacks with unknown values are skipped. Migration changes arguments and the cleanup return shape; there is no automatic fix.

All analysis is local to a file and resolves lexical bindings. Uncertain relationships are skipped. No type information is required.

## Sources

- [RHF watch](https://react-hook-form.com/docs/useform/watch)
- [RHF subscribe](https://react-hook-form.com/docs/useform/subscribe)
