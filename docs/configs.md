# Configuration presets

Flat presets are arrays under `plugin.flatConfigs`; legacy presets live under `plugin.configs` and require ESLint 9.

`strict` adds opt-in subscription and sequencing advice to `recommended`. `all` enables every rule as an error and can grow in minor releases.

| Rule                                                                                              | recommended | strict | all   |
| :------------------------------------------------------------------------------------------------ | :---------- | :----- | :---- |
| [no-conflicting-value-transforms](rules/no-conflicting-value-transforms.md)                       | error       | error  | error |
| [no-deprecated-watch-callback](rules/no-deprecated-watch-callback.md)                             | warn        | warn   | error |
| [no-double-register](rules/no-double-register.md)                                                 | error       | error  | error |
| [no-duplicate-usefieldarray](rules/no-duplicate-usefieldarray.md)                                 | off         | off    | error |
| [no-empty-usefieldarray-action](rules/no-empty-usefieldarray-action.md)                           | error       | error  | error |
| [no-form-methods-object-in-deps](rules/no-form-methods-object-in-deps.md)                         | error       | error  | error |
| [no-nested-form-provider](rules/no-nested-form-provider.md)                                       | warn        | warn   | error |
| [no-register-bracket-syntax](rules/no-register-bracket-syntax.md)                                 | error       | error  | error |
| [no-stacked-usefieldarray-actions](rules/no-stacked-usefieldarray-actions.md)                     | off         | warn   | error |
| [no-undefined-controller-default-value](rules/no-undefined-controller-default-value.md)           | error       | error  | error |
| [no-undefined-controller-on-change](rules/no-undefined-controller-on-change.md)                   | off         | off    | error |
| [no-undefined-set-value](rules/no-undefined-set-value.md)                                         | off         | off    | error |
| [prefer-useformstate-over-formstate-context](rules/prefer-useformstate-over-formstate-context.md) | off         | warn   | error |
| [usefieldarray-require-field-id-key](rules/usefieldarray-require-field-id-key.md)                 | error       | error  | error |
