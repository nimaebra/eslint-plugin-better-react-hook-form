# better-react-hook-form/no-stacked-usefieldarray-actions

📝 Disallow consecutive actions on the same field array.

💼⚠️ This rule is enabled in the 🌐 `all` config. This rule _warns_ in the 🔒 `strict` config.

<!-- end auto-generated rule header -->

RHF advises against consecutive actions on the same field array. This optional advice is enabled as a warning in strict, not recommended.

## Rule details

Incorrect:

```tsx
const { append, remove } = useFieldArray({ name: "users" });
function handleAdd() {
  append({ name: "Ada" });
  remove(0);
}
```

Correct:

```tsx
const { append, remove } = useFieldArray({ name: "users" });
function handleAdd() {
  append({ name: "Ada" });
}
function handleRemove() {
  remove(0);
}
```

The examples assume the corresponding hooks/components are imported from `react-hook-form` and React hooks from `react`.

## Limitations and fixes

Only consecutive direct action-call statements on the same hook instance are grouped. Independent arrays are tracked separately. Other statements, await boundaries, and separate blocks stop grouping. This intentionally conservative rule does not model runtime scheduling. No automatic sequencing change is safe.

All analysis is local to a file and resolves lexical bindings. Uncertain relationships are skipped. No type information is required.

## Sources

- [RHF usefieldarray](https://react-hook-form.com/docs/usefieldarray)
