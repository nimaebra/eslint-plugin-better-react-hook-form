# better-react-hook-form/no-nested-form-provider

📝 Disallow nesting react-hook-form FormProvider components.

💼 This rule is enabled in the ✅ `recommended` config.

<!-- end auto-generated rule header -->

Avoid nesting `FormProvider` components from `react-hook-form`.

## Rule Details

React Hook Form documents that nested `FormProvider` trees should be avoided.
This rule flags an inner `FormProvider` whenever it appears inside another one from the same library.

## Examples

Examples of **incorrect** code for this rule:

```tsx
import { FormProvider, useForm } from "react-hook-form";

function Example() {
  const outerMethods = useForm();
  const innerMethods = useForm();

  return (
    <FormProvider {...outerMethods}>
      <FormProvider {...innerMethods}>
        <section />
      </FormProvider>
    </FormProvider>
  );
}
```

Examples of **correct** code for this rule:

```tsx
import { FormProvider, useForm } from "react-hook-form";

function Example() {
  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <section />
    </FormProvider>
  );
}
```
