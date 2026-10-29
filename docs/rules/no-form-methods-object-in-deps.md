# better-react-hook-form/no-form-methods-object-in-deps

📝 Disallow whole form method objects in React hook dependency arrays.

💼 This rule is enabled in the following configs: 🌐 `all`, ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

Depend on the individual methods used by an imported React hook instead of the entire form methods object.

## Rule details

Incorrect:

```tsx
const methods = useForm();
useEffect(() => methods.reset(), [methods]);
```

Correct:

```tsx
const { reset } = useForm();
useEffect(() => reset(), [reset]);
```

The examples assume the corresponding hooks/components are imported from `react-hook-form` and React hooks from `react`.

## Limitations and fixes

Checks imported useEffect, useLayoutEffect, useMemo, and useCallback, including React namespace/default members and aliases. The separate formState object is a valid dependency. Unrelated hooks are ignored. No automatic fix rewrites closures or dependency lists.

All analysis is local to a file and resolves lexical bindings. Uncertain relationships are skipped. No type information is required.

## Sources

- [RHF formprovider](https://react-hook-form.com/docs/formprovider)
- [RHF useform](https://react-hook-form.com/docs/useform)
