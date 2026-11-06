# better-react-hook-form/no-empty-usefieldarray-action

📝 Require non-empty row values for useFieldArray actions.

💼 This rule is enabled in the following configs: 🌐 `all`, ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

Provide row data when appending, prepending, inserting, or updating a v7 field array.

## Rule details

The statements after the imports go inside a component or custom hook.

Incorrect:

```tsx
import { useFieldArray } from "react-hook-form";

const { append } = useFieldArray({ name: "users" });
append({});
```

Correct:

```tsx
import { useFieldArray } from "react-hook-form";

const array = useFieldArray({ name: "users" });
array.append({ name: "Ada" });
```

## Limitations and fixes

Reports missing payloads, explicit undefined/null, empty row objects, and literal arrays containing empty rows. Supports member calls and immutable aliases. Unknown payload shapes, spreads, and required row properties are not inferred. Empty batch arrays are not prohibited. RHF v8 payload semantics are outside this rule’s supported range.

All analysis is local to a file and resolves lexical bindings. Uncertain relationships are skipped. No type information is required.

## Sources

- [RHF usefieldarray](https://react-hook-form.com/docs/usefieldarray)
