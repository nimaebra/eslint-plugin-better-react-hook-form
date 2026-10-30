# better-react-hook-form/no-undefined-controller-on-change

📝 Require a defined value for Controller field.onChange().

💼 This rule is enabled in the 🌐 `all` config.

<!-- end auto-generated rule header -->

Controller's `field.onChange` requires a defined value or change event. Choose a cleared value such as an empty string or `null` that matches your field's contract.

## Rule details

Incorrect:

```tsx
const { field } = useController({ name: "email", defaultValue: "" });
field.onChange(undefined);
```

Correct:

```tsx
const { field } = useController({ name: "email", defaultValue: "" });
field.onChange("");
```

The examples assume the corresponding hooks/components are imported from `react-hook-form` and React hooks from `react`.

## Limitations and fixes

Reports a missing first argument, unshadowed global `undefined`, `void 0`, and immutable aliases proven undefined. Resolves `field.onChange` from `useController` and direct, effective `Controller` render callbacks, including field/handler destructuring and stable aliases. Unknown later render-prop overrides stop tracking.

Ordinary `onChange` functions, event objects, `null`, `false`, zero, and empty strings are allowed. It does not inspect `event.target.value`, infer whether runtime expressions return undefined, analyze custom component wrappers such as shadcn `FormField`, or track separately declared render callbacks. Uncertain spreads, shadowed bindings, and reassigned fields/handlers are skipped.

All analysis is local to a file. No type information is required. The rule is individually opt-in and enabled as an error in `all`; it is disabled in `recommended` and `strict`. There is no autofix because the right cleared value depends on the field.

## Sources

- [RHF Controller requirements](https://react-hook-form.com/docs/usecontroller/controller)
- [RHF useController](https://react-hook-form.com/docs/usecontroller)
