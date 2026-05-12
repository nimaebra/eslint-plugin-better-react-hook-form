# better-react-hook-form/no-values-with-shouldunregister

📝 Disallow combining useForm() values with shouldUnregister: true.

<!-- end auto-generated rule header -->

Disallow combining `useForm()` `values` with `shouldUnregister: true`.

## Rule Details

This rule flags the specific `useForm({ values, shouldUnregister: true })` combination.
React Hook Form issue history shows that this pairing can behave unexpectedly around unmounting and externally synchronized state.

This rule is intentionally **not** part of the `recommended` config.

Examples of **incorrect** code for this rule:

```tsx
import { useForm } from "react-hook-form";

function Example(serverData) {
  useForm({
    values: serverData,
    shouldUnregister: true,
  });
}
```

Examples of **correct** code for this rule:

```tsx
import { useForm } from "react-hook-form";

function Example(serverData) {
  useForm({
    defaultValues: serverData,
    shouldUnregister: true,
  });
}
```
