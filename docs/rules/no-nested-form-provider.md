# better-react-hook-form/no-nested-form-provider

📝 Disallow nesting React Hook Form providers.

💼⚠️ This rule is enabled in the 🌐 `all` config. This rule _warns_ in the following configs: ✅ `recommended`, 🔒 `strict`.

<!-- end auto-generated rule header -->

Nested RHF providers shadow the surrounding form context. This is a recommended warning.

## Rule details

Incorrect:

```tsx
const tree = (
  <FormProvider>
    <FormProvider>
      <input />
    </FormProvider>
  </FormProvider>
);
```

Correct:

```tsx
const tree = (
  <>
    <FormProvider>
      <input />
    </FormProvider>
    <FormProvider>
      <input />
    </FormProvider>
  </>
);
```

The examples assume the corresponding hooks/components are imported from `react-hook-form` and React hooks from `react`.

## Limitations and fixes

Checks lexically nested, proven RHF providers. Providers hidden in other components are not inferred. For deliberately independent nested contexts, disable this rule locally. No structural automatic fix is offered.

All analysis is local to a file and resolves lexical bindings. Uncertain relationships are skipped. No type information is required.

## Sources

- [RHF formprovider](https://react-hook-form.com/docs/formprovider)
