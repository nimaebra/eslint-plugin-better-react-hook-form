# better-react-hook-form/no-empty-usefieldarray-action

📝 Require non-empty values for append(), prepend(), insert(), and update() returned by useFieldArray().

💼 This rule is enabled in the ✅ `recommended` config.

<!-- end auto-generated rule header -->

Require non-empty values for `append()`, `prepend()`, `insert()`, and `update()` returned by `useFieldArray()`.

## Rule Details

React Hook Form documents that `append()`, `prepend()`, `insert()`, and `update()` require concrete values.
Calling them without a payload, or with an empty object, creates invalid field-array mutations.

## Examples

Examples of **incorrect** code for this rule:

```tsx
import { useFieldArray } from "react-hook-form";

function Example() {
  const { append } = useFieldArray({ name: "contacts" });

  append({});
}
```

Examples of **correct** code for this rule:

```tsx
import { useFieldArray } from "react-hook-form";

function Example() {
  const { append } = useFieldArray({ name: "contacts" });

  append({ email: "hello@example.com" });
}
```
