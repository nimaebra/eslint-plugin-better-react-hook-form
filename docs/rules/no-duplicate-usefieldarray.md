# better-react-hook-form/no-duplicate-usefieldarray

📝 Disallow duplicate field arrays for the same name and control.

💼 This rule is enabled in the 🌐 `all` config.

<!-- end auto-generated rule header -->

Each `useFieldArray` instance owns its own field state and generated IDs. Multiple instances managing the same field name on the same control can conflict. Share one instance's fields/actions, or use `useWatch` for read-only observations.

## Rule details

Incorrect:

```tsx
function Items() {
  const { control } = useForm();
  const editable = useFieldArray({ control, name: "items" });
  const summary = useFieldArray({ control, name: "items" });
  return null;
}
```

Correct:

```tsx
function Items() {
  const { control } = useForm();
  const items = useFieldArray({ control, name: "items" });
  return null;
}
```

The examples assume the corresponding hooks/components are imported from `react-hook-form` and React hooks from `react`.

## Limitations and fixes

Reports each subsequent direct hook call in the same function body when the same name and control are proven. Calls can be expression statements or variable initializers. Resolves imports, stable aliases, string literals/static templates, and effective option properties in known objects/spreads. Control identity must resolve to the same `useForm` or `useFormContext` call's `control` property.

Different controls and names are allowed. Omitted controls, parameter/imported controls without a proven RHF origin, dynamic names, unknown option overrides, custom hook wrappers, conditional calls, nested blocks, and cross-component relationships are skipped. Calls after a direct return/throw are ignored. The `disabled` option must be absent, proven undefined, or literal `false`; disabled or uncertain-disabled instances are skipped.

The common case of two separate child components managing the same array is deliberately outside this rule's local detection boundary. It does not infer component mount relationships or shared provider identity.

All analysis is local to a file. No type information is required. The rule is individually opt-in and enabled as an error in `all`; it is disabled in `recommended` and `strict`. There is no autofix because choosing which instance owns the array requires restructuring the consuming code.

## Sources

- [RHF useFieldArray rules](https://react-hook-form.com/docs/usefieldarray)
- [RHF v7.55 field-array implementation](https://github.com/react-hook-form/react-hook-form/blob/v7.55.0/src/useFieldArray.ts)
- [RHF v7.91 field-array implementation](https://github.com/react-hook-form/react-hook-form/blob/v7.91.0/src/useFieldArray.ts)
