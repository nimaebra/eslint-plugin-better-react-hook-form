# better-react-hook-form/prefer-useformstate-over-formstate-context

📝 Require useFormState() instead of formState subscriptions taken from useFormContext().

💼 This rule is enabled in the ✅ `recommended` config.

<!-- end auto-generated rule header -->

Prefer `useFormState()` over subscribing to `formState` from `useFormContext()`.

## Rule Details

React Hook Form documents that components inside a `FormProvider` tree should use `useFormState()` when they need slices like `errors`, `isDirty`, `dirtyFields`, `touchedFields`, `isValid`, `isValidating`, or `validatingFields`.
Reading those subscriptions from `useFormContext().formState` is broader and less explicit than the dedicated `useFormState()` hook.

Examples of **incorrect** code for this rule:

```tsx
import { useFormContext } from "react-hook-form";

function Example() {
  const {
    formState: { errors },
  } = useFormContext();

  return errors.firstName?.message ?? null;
}
```

Examples of **correct** code for this rule:

```tsx
import { useFormContext, useFormState } from "react-hook-form";

function Example() {
  const { control } = useFormContext();
  const { errors } = useFormState({ control });

  return errors.firstName?.message ?? null;
}
```
