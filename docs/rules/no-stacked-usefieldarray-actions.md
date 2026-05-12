# better-react-hook-form/no-stacked-usefieldarray-actions

📝 Disallow stacking multiple useFieldArray() actions in the same synchronous block.

💼 This rule is enabled in the ✅ `recommended` config.

<!-- end auto-generated rule header -->

Disallow stacking multiple `useFieldArray()` actions in the same synchronous block.

## Rule Details

The `useFieldArray` docs recommend against stacking actions one after another in the same synchronous callback.
Splitting those mutations across callbacks or a later effect is less error-prone and matches the documented guidance.

Examples of **incorrect** code for this rule:

```tsx
import { useFieldArray } from "react-hook-form";

function Example() {
  const { append, remove } = useFieldArray({ name: "contacts" });

  return (
    <button
      type="button"
      onClick={() => {
        append({ email: "hello@example.com" });
        remove(0);
      }}
    />
  );
}
```

Examples of **correct** code for this rule:

```tsx
import { useEffect } from "react";
import { useFieldArray } from "react-hook-form";

function Example() {
  const { append, remove } = useFieldArray({ name: "contacts" });

  useEffect(() => {
    remove(0);
  }, [remove]);

  return (
    <button
      type="button"
      onClick={() => {
        append({ email: "hello@example.com" });
      }}
    />
  );
}
```
