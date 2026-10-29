# First release audit and roadmap

Reviewed October 29, 2026. The first release target is **0.1.0**, with the existing eleven rules and unchanged recommended/strict/all membership. This document records readiness; the registry and GitHub release are the source of truth for publication status.

## Original plan audit

The original `plan-eslintPluginBetterReactHookForm.prompt.md` is a local, untracked input and is preserved. Its instructions are accounted for below.

| Original item                                | Outcome                           | Evidence and replacement                                                                                                                                                          |
| :------------------------------------------- | :-------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Documented, syntax-only selection criteria   | Implemented                       | Contributor guidelines and the [rule audit](rule-audit.md) require primary evidence, conservative inference, and valid-case coverage.                                             |
| `usefieldarray-require-field-id-key`         | Implemented and hardened          | Supports generated v7 IDs and custom `keyName`; overwritten callback/key aliases are uncertain. [RHF useFieldArray](https://react-hook-form.com/docs/usefieldarray)               |
| `no-stacked-usefieldarray-actions`           | Implemented, strict warning       | Checks consecutive synchronous actions from the same hook instance; skips uncertain control flow. [RHF useFieldArray](https://react-hook-form.com/docs/usefieldarray)             |
| `no-deprecated-watch-callback`               | Implemented, recommended warning  | Callback overload is deprecated; no automatic subscription migration. [RHF watch](https://react-hook-form.com/docs/useform/watch)                                                 |
| `prefer-useformstate-over-formstate-context` | Implemented, strict warning       | Narrow context state subscription advice. [RHF useFormContext](https://react-hook-form.com/docs/useformcontext)                                                                   |
| `no-values-with-shouldunregister`            | Intentionally retired             | The motivating issue was fixed upstream. A permanent prohibition would misrepresent supported use. [Issue 13314](https://github.com/react-hook-form/react-hook-form/issues/13314) |
| Deferred runtime/reference rules             | Still deferred                    | No blanket bans on watch or direct formState reads. See the research backlog below.                                                                                               |
| Import helper architecture                   | Replaced                          | `src/utils/bindings.ts` supersedes the old `reactHookFormImports.ts` reference with lexical origin, stable alias, and property analysis.                                          |
| Per-rule docs, tests and playground          | Completed using consumer fixtures | Dedicated rule docs/tests plus `examples/rule-cases.json` cover every rule. The old playground is replaced by built-package and isolated installed-package checks.                |
| Focused and repository validation            | Implemented                       | Focused regressions, `pnpm check`, coverage, audits and package consumers replace the obsolete `playground:lint:fixtures` command.                                                |

Two additional documented correctness rules are already included: conflicting register transforms and explicitly undefined Controller defaults. [RHF register](https://react-hook-form.com/docs/useform/register), [RHF Controller](https://react-hook-form.com/docs/usecontroller/controller)

## Release hardening

Twenty regression cases failed before the fixes. Binding analysis now stops following methods replaced through TypeScript assertions/non-null wrappers, wrapped aliases, destructuring assignments and loop targets. Field-key analysis uses the same stability checks for parameters and aliases, including overwritten map indexes. Register transform analysis skips uncertain argument positions after spreads. Existing proven diagnostics and the sole literal-path automatic fix remain covered.

The public exports, eleven rule names, preset severities and compatibility ranges remain unchanged. `@types/eslint` is a production declaration dependency so early ESLint 9 consumers can resolve the published types; ESLint only began bundling its own declarations in [9.10.0](https://eslint.org/blog/2024/09/eslint-v9.10.0-released/). Compiler checks do not use `skipLibCheck`.

## Required verification

- `pnpm check`: formatting, lint, type checking, unused-code checks, unit/config tests, dual-format/declaration build, built examples, generated docs and pack contents.
- `pnpm test:coverage`: at least 95% lines, 90% statements, 90% branches and 95% functions. Test behavior and regressions rather than padding coverage.
- `pnpm security:audit` and `pnpm audit --prod --audit-level=low`: no moderate-or-higher repository advisories and no production advisories. The development-only low-severity deepmerge advisory is recorded in the rule audit and is not suppressed.
- CI runs the Node 22.13.0 floor plus current Node 22/24/26. Consumer tests cover ESLint 9.0.0, latest 9, 10.0.0 and latest 10 against RHF 7.55.0 and latest 7.
- Every rule has valid/invalid JSX and TSX fixtures through recommended, strict and all. ESLint 9 additionally exercises legacy all. ESM and CommonJS loading, plugin metadata, required tarball files and declarations are checked in an isolated installation.
- TypeScript 5.3.3 and 6 consumers must compile `.mts` and `.cts` with declaration checking enabled. A consumer without RHF installed verifies the optional peer and syntax-only operation.

Example matrix commands:

```sh
for eslint in 9.0.0 '^9' 10.0.0 '^10'; do
  for rhf in 7.55.0 '^7'; do
    pnpm smoke:pack --eslint-version "$eslint" --rhf-version "$rhf"
  done
done
pnpm smoke:pack --typescript-version 5.3.3 --rhf-version none
pnpm smoke:pack --typescript-version '^6' --rhf-version none
```

## Publication procedure

Merge the release-readiness PR after its checks pass. Use a clean checkout of that exact main commit and the pinned toolchain, keeping version 0.1.0. Complete all gates above before publishing. The initial package does not need an artificial Changesets bump.

1. Recheck npm name availability and authenticate the intended owner with interactive login/2FA. A 404 does not reserve the name. Authentication failure or a name conflict stops publication without renaming.
2. Publish from the verified checkout with lifecycle validation enabled: `npm publish --access public --tag latest --provenance=false`. Local bootstrap deliberately has no hosted-builder provenance. npm trust requires an existing package. [npm trust prerequisites](https://docs.npmjs.com/cli/v11/commands/npm-trust/), [provenance requirements](https://docs.npmjs.com/generating-provenance-statements/)
3. Inspect registry metadata, ownership, dist-tag and integrity. Repeat the consumer matrix using `--package-spec eslint-plugin-better-react-hook-form@0.1.0` to test the registry artifact instead of rebuilding a local package.
4. Push `v0.1.0` at the verified commit and create the matching GitHub release. Include the commit, integrity, installation commands, supported ranges and known analysis limitations in the release notes.
5. If publication returns an ambiguous network error, inspect the registry before retrying. Never overwrite a version. Post-publication defects require a tested patch release.

For later workflow releases, keep the existing explicit main-branch manual publish gate and configure npm trust for GitHub owner `nimaebra`, repository `eslint-plugin-better-react-hook-form`, workflow `release.yml`, no named environment, and direct `npm publish` permission. OIDC needs npm >=11.5.1 and Node >=22.14.0. Set up trust immediately before a genuine release: its first successful publish must occur within two days or the configuration expires. Do not publish an empty patch just to validate trust. [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)

## Prioritized future work

| Release / priority | Deliverable                                                                      | Acceptance boundary                                                                                                                                                                                                                                                                                                           |
| :----------------- | :------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1.x              | False positives, unsafe fixes, compatibility regressions and clearer diagnostics | Reproduce each consumer report; add a valid-case regression; retain public exports and document behavior changes.                                                                                                                                                                                                             |
| 0.2.0              | `no-undefined-set-value`                                                         | Track setValue from useForm/useFormContext and stable aliases. Report a missing second argument, unshadowed undefined, void 0 or a stable alias proven undefined. Skip uncertain spreads/runtime values; allow null, false, zero and empty strings. No fix. [RHF setValue](https://react-hook-form.com/docs/useform/setvalue) |
| 0.2.0              | `no-undefined-controller-on-change`                                              | Track field.onChange from Controller render callbacks/useController. Report missing/proven undefined values, not arbitrary onChange functions or events. Skip uncertain spreads/runtime values. No fix. [RHF Controller](https://react-hook-form.com/docs/usecontroller/controller)                                           |
| Following minor    | Existing-rule enhancements                                                       | Support stable aliases of registration results for double-registration detection and more directly provable JSX return patterns for field keys. Add valid-case regressions before widening detection.                                                                                                                         |

New 0.2 rules start as strict warnings and all-preset errors, outside recommended. Promote them only in a later minor release after consumer fixtures and false-positive feedback support the change. Include docs, diagnostics, scope/alias cases, installed consumers and a changeset with each rule.

Research-only backlog:

- Controller value transforms: confirm unsupported options against both the minimum and current v7 source before proposing a precise rule. [Controller](https://react-hook-form.com/docs/usecontroller/controller)
- Resolver plus form-level validate: establish per-version semantics and limit analysis to proven properties on the same options object. [useForm](https://react-hook-form.com/docs/useform)
- Controller shouldUnregister within a field array: prove the array/name/control relationship rather than globally banning the prop. [Controller](https://react-hook-form.com/docs/usecontroller/controller)
- Conditional formState subscriptions: distinguish render short-circuit gaps from valid direct reads and effect dependencies. This requires narrow control-flow analysis. [formState](https://react-hook-form.com/docs/useform/formstate)
- RHF v8: keep the peer range below 8 until a separate stable-API review and compatibility matrix exist. Beta changes to generated keys, keyName, callback watch and payload semantics prevent reusing v7 rules unchanged. [v8 beta.5](https://github.com/react-hook-form/react-hook-form/releases/tag/v8.0.0-beta.5)
