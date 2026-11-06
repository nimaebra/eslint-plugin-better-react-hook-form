# better-react-hook-form/prefer-useformstate-over-formstate-context

📝 Require useFormState() for context form-state subscriptions.

💼⚠️ This rule is enabled in the 🌐 `all` config. This rule _warns_ in the 🔒 `strict` config.

<!-- end auto-generated rule header -->

Prefer a focused useFormState subscription over consuming context formState. This optional performance/subscription advice is enabled as a warning in strict.

## Rule details

The statements after the imports go inside a component or custom hook.

Incorrect:

```tsx
import { useFormContext } from "react-hook-form";

const {
  formState: { errors },
} = useFormContext();
```

Correct:

```tsx
import { useFormContext, useFormState } from "react-hook-form";

const { control } = useFormContext();
const { errors } = useFormState({ control });
```

## Limitations and fixes

Checks errors, dirtyFields, isDirty, isValid, isValidating, touchedFields, and validatingFields from proven useFormContext origins. Other slices remain outside this initial check. This is advice rather than evidence of universally invalid code. No hook insertion or import automatic fix is offered.

All analysis is local to a file and resolves lexical bindings. Uncertain relationships are skipped. No type information is required.

## Sources

- [RHF useformcontext](https://react-hook-form.com/docs/useformcontext)
- [RHF useformstate](https://react-hook-form.com/docs/useformstate)
