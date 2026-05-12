# better-react-hook-form/destructuring-formstate

📝 Require destructuring formState properties instead of reading them from the proxy object.

💼 This rule is enabled in the ✅ `recommended` config.

<!-- end auto-generated rule header -->

Destructure `formState` properties instead of reading them from the proxy object.

## Rule Details

React Hook Form wraps `formState` in a `Proxy` to optimize rendering.
To subscribe to a specific state correctly during render, read it through destructuring instead of property access on the proxy object.

Examples of **incorrect** code for this rule:

```tsx
import { useFormState } from "react-hook-form";

function Example() {
  const formState = useFormState();

  return <button disabled={!formState.isDirty || !formState.isValid} />;
}
```

```tsx
import { useFormState } from "react-hook-form";

function Example() {
  const formState = useFormState();

  formState.isDirty;
  return null;
}
```

Examples of **correct** code for this rule:

```tsx
import { useForm } from "react-hook-form";

function Example() {
  const { formState } = useForm();
  const { isDirty, isValid } = formState;

  return <button disabled={!isDirty || !isValid} />;
}
```

```tsx
import { useFormState } from "react-hook-form";

function Example() {
  const { isDirty } = useFormState();

  return isDirty;
}
```

## When Not To Use It

If you deliberately target platforms without `Proxy` support, such as legacy browsers or some React Native environments.
