# Changelog

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
