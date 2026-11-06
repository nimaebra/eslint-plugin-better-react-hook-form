# better-react-hook-form/no-undefined-controller-on-change

📝 Require a defined value for Controller field.onChange().

💼 This rule is enabled in the 🌐 `all` config.

<!-- end auto-generated rule header -->

Controller's `field.onChange` requires a defined value or change event. Choose a cleared value such as an empty string or `null` that matches your field's contract.

## Rule details

Use the cleared value that matches the field. For a text input, pass an empty string from the clear action.

Incorrect:

```tsx
import { useController, useForm } from "react-hook-form";

function EmailField() {
  const { control } = useForm({ defaultValues: { email: "" } });
  const { field } = useController({ control, name: "email" });

  return (
    <>
      <input {...field} />
      <button type="button" onClick={() => field.onChange(undefined)}>
        Clear
      </button>
    </>
  );
}
```

Correct:

```tsx
import { useController, useForm } from "react-hook-form";

function EmailField() {
  const { control } = useForm({ defaultValues: { email: "" } });
  const { field } = useController({ control, name: "email" });

  return (
    <>
      <input {...field} />
      <button type="button" onClick={() => field.onChange("")}>
        Clear
      </button>
    </>
  );
}
```

## Limitations and fixes

Reports a missing first argument, unshadowed global `undefined`, `void 0`, and immutable aliases proven undefined. Resolves `field.onChange` from `useController` and direct, effective `Controller` render callbacks, including field/handler destructuring and stable aliases. Unknown later render-prop overrides stop tracking.

Ordinary `onChange` functions, event objects, `null`, `false`, zero, and empty strings are allowed. It does not inspect `event.target.value`, infer whether runtime expressions return undefined, analyze custom component wrappers such as shadcn `FormField`, or track separately declared render callbacks. Uncertain spreads, shadowed bindings, and reassigned fields/handlers are skipped.

All analysis is local to a file. No type information is required. The rule is individually opt-in and enabled as an error in `all`; it is disabled in `recommended` and `strict`. There is no autofix because the right cleared value depends on the field.

## Sources

- [RHF Controller requirements](https://react-hook-form.com/docs/usecontroller/controller)
- [RHF useController](https://react-hook-form.com/docs/usecontroller)
