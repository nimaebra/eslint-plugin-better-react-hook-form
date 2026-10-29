import { describe, expect, it } from "vitest";
import { ESLint } from "eslint";
import parser from "@typescript-eslint/parser";
import packageJson from "../../package.json";
import plugin, { configs, flatConfigs, rules } from "../../src/index.js";
import { presetNames } from "../../src/configs/index.js";
import { ruleRegistry } from "../../src/rules/registry.js";

describe("plugin API", () => {
  it("exports matching plugin metadata, aliases and presets", () => {
    expect(plugin.meta.version).toBe(packageJson.version);
    expect(plugin.meta.name).toBe(packageJson.name);
    expect(plugin.rules).toBe(rules);
    expect(plugin.configs).toBe(configs);
    expect(plugin.flatConfigs).toBe(flatConfigs);
    expect(configs["flat/recommended"]).toBe(flatConfigs.recommended[0]);
    for (const name of presetNames) {
      expect(configs[name].rules).toEqual(flatConfigs[name][0].rules);
      expect(flatConfigs[name][0].plugins?.["better-react-hook-form"]).toBe(
        plugin,
      );
    }
  });
  it("removes unsupported blanket restrictions", () => {
    for (const name of [
      "destructuring-formstate",
      "no-use-watch",
      "no-values-with-shouldunregister",
    ])
      expect(rules).not.toHaveProperty(name);
    expect(Object.keys(rules)).toHaveLength(11);
  });
  it("keeps correctness and optional advice separate", () => {
    const recommended = flatConfigs.recommended[0].rules!;
    expect(Object.keys(recommended)).toHaveLength(9);
    expect(recommended["better-react-hook-form/no-nested-form-provider"]).toBe(
      "warn",
    );
    expect(
      recommended["better-react-hook-form/no-deprecated-watch-callback"],
    ).toBe("warn");
    expect(
      recommended["better-react-hook-form/no-stacked-usefieldarray-actions"],
    ).toBeUndefined();
    expect(Object.values(flatConfigs.all[0].rules!)).toEqual(
      ruleRegistry.map(() => "error"),
    );
  });
  it("lints TSX through the documented flat preset", async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        ...flatConfigs.recommended,
        {
          files: ["**/*.tsx"],
          languageOptions: {
            parser,
            parserOptions: { ecmaFeatures: { jsx: true } },
          },
        },
      ],
    });
    const [result] = await eslint.lintText(
      `import {useForm} from 'react-hook-form';const {register}=useForm();register('x',{valueAsNumber:true,valueAsDate:true});`,
      { filePath: "example.tsx" },
    );
    expect(result.messages.map((m) => m.ruleId)).toEqual([
      "better-react-hook-form/no-conflicting-value-transforms",
    ]);
  });
  it("accepts supported watch and formState usage", async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: flatConfigs.recommended,
    });
    const [result] = await eslint.lintText(
      `import {useForm} from 'react-hook-form';const {watch,formState}=useForm({values:{},shouldUnregister:true});watch('x');console.log(formState.isSubmitting);`,
      { filePath: "example.js" },
    );
    expect(result.messages).toEqual([]);
  });
});
