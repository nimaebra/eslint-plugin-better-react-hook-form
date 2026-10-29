# Contributing

Use issues for reproducible bugs, false positives, missed diagnostics, and rule proposals. Include a small example, configuration, dependency versions, and links to the relevant upstream guidance. Follow the [code of conduct](CODE_OF_CONDUCT.md).

## Setup

Use the Node 24 patch pinned in `.nvmrc` and the exact pnpm version in `package.json`:

```sh
nvm install
nvm use
corepack enable
pnpm install --frozen-lockfile
pnpm check
```

Only esbuild's installation script is allowed through `pnpm-workspace.yaml`. Runtime support is Node `^22.13.0 || >=24.0.0`; CI tests Node 22.13.0, current 22, 24, and 26. The plugin supports ESLint 9/10 and RHF `>=7.55.0 <8`.

## Repository structure

- `src/plugin.ts`, `src/index.ts`, and `src/types.ts`: plugin assembly, public exports, and public types.
- `src/rules`: rule implementations and the single preset registry.
- `src/configs`: flat/legacy preset builders.
- `src/utils`: scope resolution, conservative value analysis, and rule creation.
- `tests/rules`, `tests/configs`, and `tests/utils`: behavior and contract tests.
- `tests/integration` and `examples`: checks against the built plugin.
- `scripts`: generated preset documentation and isolated package smoke tests.
- `docs/rules`: rule examples, limitations, and primary sources.

## Checks

`pnpm check` runs formatting, ESLint, TypeScript, Knip, unit/config/helper tests, build, example integrations, generated-document checks, and a package dry run.

| Command                                  | Purpose                                                                                           |
| :--------------------------------------- | :------------------------------------------------------------------------------------------------ |
| `pnpm test` / `pnpm test:watch`          | Run unit tests / watch tests                                                                      |
| `pnpm test:coverage`                     | Enforce source coverage                                                                           |
| `pnpm lint:fix` / `pnpm format`          | Apply lint fixes / format files                                                                   |
| `pnpm docs:build`                        | Build the plugin and regenerate rule/preset tables                                                |
| `pnpm docs:check` / `pnpm configs:check` | Verify generated output                                                                           |
| `pnpm test:integration`                  | Lint built-package examples; run build first                                                      |
| `pnpm smoke:pack`                        | Install a tarball in an isolated consumer and verify contents, ESM/CJS, declarations, and linting |
| `pnpm security:audit`                    | Audit dependencies at moderate severity or higher                                                 |

Run a focused test while iterating:

```sh
pnpm exec vitest run tests/rules/no-double-register.test.ts
```

Smoke tests require registry access. CI tests ESLint 9.0.0, newest 9, 10.0.0, and newest 10 against RHF 7.55.0 and the newest v7 release, never the v8 beta or an unconstrained future major:

```sh
pnpm smoke:pack --eslint-version '^9' --rhf-version 7.55.0
pnpm smoke:pack --eslint-version '^10' --rhf-version '^7'
```

## Rule selection and implementation

Choose a documented API mistake with a useful, precise diagnostic. Link the official docs or recurring upstream evidence. Do not encode temporary library regressions or performance preferences as universal correctness failures. Review the [audit](docs/rule-audit.md) before proposing a rule.

1. Add a rule through the shared `createRule` helper and use lexical binding resolution.
2. Register it in the rule registry. Recommended severity is declared there; strict adds opt-in advice, and all includes every rule as an error.
3. Add RuleTester coverage for valid/invalid usage, aliases, shadowing, reassignment, member calls, and unknown spreads as applicable.
4. Add a rule document with rationale, examples, limitations, and primary-source links. Preserve generated header markers.
5. Update examples for changed presets; regenerate docs with `pnpm docs:build` and run `pnpm check`.

Fixes must preserve behavior, comments, and TypeScript assertions. Prefer no fix when the correct replacement depends on user intent. Do not introduce type-aware requirements for a syntax-only rule.

## Git conventions

Use `<type>/<kebab-case-description>` branches, such as `fix/field-array-keys`. Agent branches may use `codex/<description>`. `main`, `changeset-release/main`, and Dependabot branches are reserved exceptions. Do not rewrite existing history.

Commits and PR titles follow Conventional Commits: `<type>[optional scope]: <description>`. Types include feat, fix, docs, style, refactor, perf, test, build, ci, chore, and revert. Use lowercase scopes and subjects of at most 100 characters. Mark breaking changes with `!` and explain migration.

```sh
git fetch origin main
pnpm conventions:check
```

Optional local hooks can be enabled with `pnpm hooks:install`. This changes this clone's `core.hooksPath`; integrate the two hook commands yourself if you already have custom hooks. Hooks are not installed as a package lifecycle side effect. CI enforces branch names, PR titles, and introduced commit messages independently.

## Changesets and releases

The initial unpublished version remains 0.1.0. For subsequent public behavior changes, add a changeset with `pnpm changeset`. Internal-only documentation, tooling, or tests need no package bump unless they affect consumers. Generated version PRs use `chore(release): release packages`.

Ordinary pushes to main validate the package and maintain a Changesets version PR. They never publish npm packages, push release tags, or create GitHub releases. Merge a version PR before publishing its prepared version.

Publishing requires a manual run of **Release** on `main` with **publish=true**. The workflow revalidates all checks and packaged consumers. With pending changesets it prepares a version PR instead; merge that PR and dispatch again. The initial 0.1.0 bootstrap uses the separate interactive procedure below. Repository preparation alone does not publish a package.

### First npm publication and trusted publishing

The GitHub repository must be public, and `package.json` must point to `nimaebra/eslint-plugin-better-react-hook-form`. npm trusted publishing requires npm >=11.5.1 and a matching publisher configuration. See the [official npm guide](https://docs.npmjs.com/trusted-publishers/).

npm requires an existing package before configuring trust. Bootstrap the first version from a clean, verified main checkout using your authenticated npm account and 2FA. Run `pnpm security:audit`, `pnpm check`, coverage, the production audit, and the complete consumer matrix, then `npm publish --access public --provenance=false`. Local bootstrap has no CI provenance; subsequent GitHub OIDC releases provide provenance. Do not create or store an npm token in this repository. The publishing account must complete interactive login and 2FA. Authentication or a name conflict stops publication; do not rename the package automatically.

Configure the trusted publisher immediately before the next genuine workflow publication. A new configuration expires unless its first successful publish occurs within two days. OIDC needs Node >=22.14.0 and npm >=11.5.1; the pinned Node 24 environment satisfies this.

| Setting           | Value                                               |
| :---------------- | :-------------------------------------------------- |
| Provider          | GitHub Actions                                      |
| Owner             | `nimaebra`                                          |
| Repository        | `eslint-plugin-better-react-hook-form`              |
| Workflow filename | `release.yml`                                       |
| Environment       | Leave blank; the workflow uses no named environment |
| Permission        | Allow direct `npm publish`                          |

The workflow uses GitHub-hosted runners with `id-token: write` and disables release dependency caching. No `NPM_TOKEN` is needed for OIDC. Enable GitHub Actions permission to create pull requests for Changesets. A successful publication creates the matching GitHub release/tag; re-running does not republish an existing version. After the initial publication, install `eslint-plugin-better-react-hook-form@0.1.0` into fresh consumers, verify the registry metadata and package integrity, and create the matching `v0.1.0` GitHub tag/release at the verified commit. Record that commit and integrity in the release notes. If publication returns an ambiguous network error, inspect the registry before retrying; published versions cannot be overwritten.

`@types/eslint` is intentionally exempted from Knip: modern ESLint provides its own declarations, while the installed ESLint 9.0.0 consumer proves the fallback dependency is needed.

The smoke script supports `--package-spec eslint-plugin-better-react-hook-form@0.1.0` to verify the actual registry tarball, `--typescript-version 5.3.3` for the minimum compiler, and `--rhf-version none` to verify the optional peer. It checks declarations without `skipLibCheck` and exercises all eleven rules through every flat preset in JSX/TSX and legacy `all` on ESLint 9.

See [release readiness](docs/release-readiness.md) for the audit, acceptance gates, and future work.
