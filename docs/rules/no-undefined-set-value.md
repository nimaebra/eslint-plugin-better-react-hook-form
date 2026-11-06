# better-react-hook-form/no-undefined-set-value

📝 Require a defined value argument for setValue().

💼 This rule is enabled in the 🌐 `all` config.

<!-- end auto-generated rule header -->

React Hook Form requires the second argument of `setValue` to be present and defined. An undefined value can leave field state inconsistent with the intended cleared value.

## Rule details

Inside a component, use a defined value when clearing a field from an event handler.

Incorrect:

```tsx
import { useForm } from "react-hook-form";

const { setValue } = useForm();
const clearEmail = () => setValue("email", undefined);
```

Correct:

```tsx
import { useForm } from "react-hook-form";

const { setValue } = useForm();
const clearEmail = () => setValue("email", "");
```

## Limitations and fixes

Reports missing second arguments, unshadowed global `undefined`, `void 0`, and immutable aliases proven to contain either value. Resolves `setValue` from `useForm` and `useFormContext`, including named/namespace imports, destructuring, member calls, and stable local aliases.

Allows `null`, `false`, zero, and empty strings. Values imported from other files, unknown runtime values, custom hook wrappers, reassigned methods, and spreads that make the value's argument position uncertain are skipped. It does not inspect nested properties for undefined values or resolve `.call`/`.apply` invocations.

All analysis is local to a file. No type information is required. The rule is individually opt-in and enabled as an error in `all`; it is disabled in `recommended` and `strict`. There is no autofix because the right value depends on the field.

## Sources

- [RHF setValue requirements](https://react-hook-form.com/docs/useform/setvalue)
