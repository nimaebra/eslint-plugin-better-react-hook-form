# better-react-hook-form/usefieldarray-require-field-id-key

📝 Require rows rendered from useFieldArray().fields.map() to use field.id as their key.

💼 This rule is enabled in the ✅ `recommended` config.

<!-- end auto-generated rule header -->

Require rows rendered from `useFieldArray().fields.map()` to use `field.id` as their `key`.

## Rule Details

React Hook Form documents that rows rendered from `useFieldArray()` must use the generated `field.id` as their React key.
Using `index` or another field property can break row identity during reordering and updates.

Examples of **incorrect** code for this rule:

```tsx
import { useFieldArray } from "react-hook-form";

function Example() {
  const { fields } = useFieldArray({ name: "contacts" });

  return fields.map((field, index) => <input key={index} />);
}
```

Examples of **correct** code for this rule:

```tsx
import { useFieldArray } from "react-hook-form";

function Example() {
  const { fields } = useFieldArray({ name: "contacts" });

  return fields.map((field) => <input key={field.id} />);
}
```
