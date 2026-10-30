---
"eslint-plugin-better-react-hook-form": minor
---

Add three syntax-only correctness rules: `no-undefined-set-value`, `no-undefined-controller-on-change`, and `no-duplicate-usefieldarray`. They report only missing/proven undefined call values or duplicate arrays with the same proven control and static name in one function. Uncertain relationships are skipped and no autofixes are offered.

Enable the new rules individually or through `all`. Preserve existing `recommended` and `strict` preset membership and severities by making strict-only membership explicit in the rule registry.
