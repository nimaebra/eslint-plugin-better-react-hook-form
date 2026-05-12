# better-react-hook-form/no-deprecated-watch-callback

📝 Disallow the deprecated watch(callback) overload and prefer subscribe().

💼 This rule is enabled in the ✅ `recommended` config.

<!-- end auto-generated rule header -->

Disallow the deprecated `watch(callback)` overload and prefer `subscribe()`.

## Rule Details

React Hook Form documents the callback overload of `watch()` as deprecated and recommends `subscribe()` for subscription-style updates outside render.

Examples of **incorrect** code for this rule:

```tsx
import { useForm } from "react-hook-form";

function Example() {
  const { watch } = useForm();

  watch(() => undefined);
}
```

Examples of **correct** code for this rule:

```tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";

function Example() {
  const { subscribe } = useForm();

  useEffect(() => {
    return subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        console.log(values);
      },
    });
  }, [subscribe]);
}
```
