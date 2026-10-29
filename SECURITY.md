# Security policy

The latest published version receives security fixes.

Report vulnerabilities privately to **nimaebra75@gmail.com**. Include affected versions, a minimal reproduction, and the potential impact. Do not open a public issue containing an exploit or credentials.

Relevant issues include unsafe autofixes, denial-of-service behavior while linting, and package supply-chain problems. Report vulnerabilities in React Hook Form or ESLint itself to their respective maintainers.

Release packages are checked in isolated consumers. GitHub OIDC publications use provenance. The [initial 0.1.0 release](https://github.com/nimaebra/eslint-plugin-better-react-hook-form/releases/tag/v0.1.0) was published locally without provenance. Ordinary pushes cannot publish a package.

Run `pnpm security:audit` for the repository audit and `pnpm audit --prod --audit-level=low` for production dependencies. The October 29, 2026 audit found one [low-severity deepmerge advisory](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) through the development-only documentation generator, with no patch available at that review. It does not affect the runtime dependency tree and is not suppressed. Recheck advisory status before each release.
