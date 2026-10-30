# Changelog

## 1.1.0

### Minor Changes

- faf334e: Add three syntax-only correctness rules: `no-undefined-set-value`, `no-undefined-controller-on-change`, and `no-duplicate-usefieldarray`. They report only missing/proven undefined call values or duplicate arrays with the same proven control and static name in one function. Uncertain relationships are skipped and no autofixes are offered.

  Enable the new rules individually or through `all`. Preserve existing `recommended` and `strict` preset membership and severities by making strict-only membership explicit in the rule registry.

## 1.0.0

### Major Changes

- Release the stable v1 API with eleven React Hook Form v7 rules, existing recommended/strict/all presets, flat and ESLint 9 legacy configuration, and ESM/CommonJS exports with declarations. Existing 0.1.0 configurations require no migration.

  Stop diagnostics and bracket-path fixes after direct Object/Reflect mutations and mutations through local member/destructuring aliases. Treat literal custom prototypes as uncertain options. Respect overwritten Controller render props and spread arguments that obscure React hook dependency positions. Report proven undefined field-array keys.

  Execute every rule document's incorrect/correct examples in integration tests and document the v1 compatibility policy, precise analysis limits, and release verification procedure.

## 0.1.0 — 2026-10-29

- Provide eleven rules for documented React Hook Form v7 usage, with recommended, strict, and all presets.
- Support ESLint 9/10, flat and ESLint 9 legacy configuration, and ESM/CommonJS consumers with declarations.
- Resolve lexical bindings and immutable aliases; handle custom field-array keys and conservative value analysis.
- Include checks for conflicting register transforms and undefined Controller defaults.
- Remove blanket bans on watch, direct formState reads, and values with shouldUnregister.
- Add contributor documentation, package smoke tests, and manually triggered npm publication.
- Suppress diagnostics and path fixes after method replacement through assertions, aliases, destructuring, and loop targets.
- Avoid false positives for overwritten field-key aliases and register argument spreads.
- Exercise every rule through installed JSX/TSX consumers and preserve declarations for early ESLint 9.
