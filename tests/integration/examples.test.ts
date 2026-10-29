import { describe, it, expect } from "vitest";
import { ESLint } from "eslint";
import { resolve } from "node:path";
import parser from "@typescript-eslint/parser";
import cases from "../../examples/rule-cases.json";
import { pathToFileURL } from "node:url";
import type { BetterReactHookFormPlugin } from "../../src/types.js";
const {
  flatConfigs,
  rules,
}: Pick<BetterReactHookFormPlugin, "flatConfigs" | "rules"> = await import(
  pathToFileURL(resolve("dist/index.mjs")).href
);

describe("every built rule through each preset", () => {
  it("has consumer fixtures for every exported rule", () => {
    expect(Object.keys(cases).sort()).toEqual(Object.keys(rules).sort());
  });
  for (const preset of ["recommended", "strict", "all"] as const) {
    for (const extension of ["jsx", "tsx"]) {
      for (const [name, fixture] of Object.entries(cases)) {
        it(`${preset} ${extension}: ${name}`, async () => {
          const eslint = new ESLint({
            overrideConfigFile: true,
            overrideConfig: [
              ...flatConfigs[preset],
              {
                files: ["**/*.{jsx,tsx}"],
                languageOptions: {
                  ...(extension === "tsx" ? { parser } : {}),
                  parserOptions: { ecmaFeatures: { jsx: true } },
                },
              },
            ],
          });
          const [valid] = await eslint.lintText(fixture.valid, {
            filePath: `valid.${extension}`,
          });
          expect(valid.messages).toEqual([]);
          const [invalid] = await eslint.lintText(fixture.invalid, {
            filePath: `invalid.${extension}`,
          });
          const id = `better-react-hook-form/${name}`;
          const severity = flatConfigs[preset][0].rules?.[id];
          expect(
            invalid.messages.map(({ ruleId, severity }) => ({
              ruleId,
              severity,
            })),
          ).toEqual(
            severity
              ? [{ ruleId: id, severity: severity === "warn" ? 1 : 2 }]
              : [],
          );
        });
      }
    }
  }
});

describe("built package examples", () => {
  for (const directory of ["flat", "typescript"]) {
    it(`lints ${directory} fixtures through the built plugin`, async () => {
      const eslint = new ESLint({
        cwd: resolve(`examples/${directory}`),
        overrideConfigFile: resolve(`examples/${directory}/eslint.config.mjs`),
      });
      const results = await eslint.lintFiles(["src/*"]);
      const valid = results.find((result) =>
        /\/valid\./.test(result.filePath),
      )!;
      const invalid = results.find((result) =>
        /\/invalid\./.test(result.filePath),
      )!;
      expect(valid.messages).toEqual([]);
      expect(invalid.messages.map((message) => message.ruleId)).toEqual([
        directory === "flat"
          ? "better-react-hook-form/no-conflicting-value-transforms"
          : "better-react-hook-form/no-undefined-controller-default-value",
      ]);
    });
  }
});

it("lints JSX and TSX with every README flat-config recipe", async () => {
  const { readFileSync } = await import("node:fs");
  const markdown = readFileSync("README.md", "utf8");
  const snippets = [...markdown.matchAll(/```(js|cjs)\n([\s\S]*?)```/g)].filter(
    (match) =>
      match[2].includes("export default") ||
      match[2].includes("module.exports"),
  );
  expect(snippets).toHaveLength(4);
  for (const [, language, snippet] of snippets) {
    let source = snippet
      .replaceAll(
        '"eslint-plugin-better-react-hook-form"',
        JSON.stringify(
          language === "cjs"
            ? resolve("dist/index.cjs")
            : pathToFileURL(resolve("dist/index.mjs")).href,
        ),
      )
      .replaceAll(
        '"typescript-eslint"',
        JSON.stringify(import.meta.resolve("typescript-eslint")),
      );
    if (language === "cjs")
      source = `import {createRequire} from 'node:module';const require=createRequire(${JSON.stringify(pathToFileURL(resolve("README.md")).href)});const module={exports:{}};\n${source}\nexport default module.exports;`;
    const { default: config } = await import(
      `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
    );
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: config,
    });
    const filePath = snippet.includes("tseslint")
      ? "fixtures/example.tsx"
      : "fixtures/example.jsx";
    const valid = `import {useForm} from 'react-hook-form';export default function Form(){const {register}=useForm();return <input {...register('users.0.name')}/>;}`;
    const [result] = await eslint.lintText(valid, { filePath });
    expect(result.messages).toEqual([]);
    const [invalid] = await eslint.lintText(
      valid.replace("users.0.name", "users[0].name"),
      { filePath },
    );
    expect(invalid.messages.map((message) => message.ruleId)).toEqual([
      "better-react-hook-form/no-register-bracket-syntax",
    ]);
  }
});
