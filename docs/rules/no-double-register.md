# better-react-hook-form/no-double-register

📝 Disallow combining register() with useController() or Controller field props on the same element.

💼 This rule is enabled in the ✅ `recommended` config.

<!-- end auto-generated rule header -->

Avoid combining `register()` with `useController()` or `Controller` field props on the same element.

## Rule Details

`useController()` and `Controller` already handle field registration.
Spreading both `field` props and `register()` into the same input double-registers the element and can lead to incorrect behavior.

## Examples

Examples of **incorrect** code for this rule:

```tsx
import { useController, useForm } from "react-hook-form";

function Example() {
  const { register } = useForm();
  const { field } = useController({ name: "email" });

  return <input {...field} {...register("email")} />;
}
```

Examples of **correct** code for this rule:

```tsx
import { useController } from "react-hook-form";

function Example() {
  const { field } = useController({ name: "email" });

  return <input {...field} />;
}
```
