# better-react-hook-form/no-use-watch

📝 Disallow the watch() method and require useWatch() instead.

💼 This rule is enabled in the ✅ `recommended` config.

<!-- end auto-generated rule header -->

Prefer `useWatch()` over the `watch()` method.

## Rule Details

This rule disallows the `watch()` method from `useForm()` and `useFormContext()` and guides you toward `useWatch()` instead.
That keeps subscriptions hook-based and avoids stale results in React Compiler scenarios, where non-hook APIs should remain memoizable.

Examples of **incorrect** code for this rule:

```tsx
import { useForm } from "react-hook-form";

function Example() {
  const { watch } = useForm();

  return watch("firstName");
}
```

```tsx
import { useFormContext } from "react-hook-form";

function Example() {
  const { watch } = useFormContext();

  return watch("firstName");
}
```

Examples of **correct** code for this rule:

```tsx
import { useForm, useWatch } from "react-hook-form";

function Example() {
  const { control } = useForm();
  const watchedValues = useWatch({ control });

  return watchedValues;
}
```

```tsx
import { useFormContext, useWatch } from "react-hook-form";

function Example() {
  const { control } = useFormContext();
  const watchedValues = useWatch({ control });

  return watchedValues;
}
```

## When Not To Use It

If your project intentionally depends on the `watch()` method despite React Compiler staleness concerns.

## Further Reading

- Watch don't work with React Compiler (React 19)
