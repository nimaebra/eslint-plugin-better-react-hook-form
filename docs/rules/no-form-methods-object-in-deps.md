# better-react-hook-form/no-form-methods-object-in-deps

📝 Disallow useForm() and useFormContext() method objects in React hook dependency arrays.

💼 This rule is enabled in the ✅ `recommended` config.

<!-- end auto-generated rule header -->

Avoid depending on the entire object returned by `useForm()` or `useFormContext()`.

## Rule Details

React Hook Form documents that putting the full methods object into a React hook dependency array is unsafe because the object may be memoized differently in a future release.
Depend on the specific method you use instead, such as `reset`.

## Examples

Examples of **incorrect** code for this rule:

```tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";

function Example() {
  const methods = useForm();

  useEffect(() => {
    methods.reset({ firstName: "Ada" });
  }, [methods]);
}
```

Examples of **correct** code for this rule:

```tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";

function Example() {
  const { reset } = useForm();

  useEffect(() => {
    reset({ firstName: "Ada" });
  }, [reset]);
}
```
