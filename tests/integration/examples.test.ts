import { describe, it, expect } from "vitest";
import { ESLint } from "eslint";
import { resolve } from "node:path";

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

it("loads every README flat-config example against the built artifact", async () => {
  const { readFileSync } = await import("node:fs");
  const { pathToFileURL } = await import("node:url");
  const markdown = readFileSync("README.md", "utf8");
  const snippets = [...markdown.matchAll(/```js\n([\s\S]*?)```/g)]
    .map((match) => match[1])
    .filter((snippet) => snippet.includes("export default"));
  expect(snippets).toHaveLength(3);
  for (const snippet of snippets) {
    const source = snippet
      .replaceAll(
        '"eslint-plugin-better-react-hook-form"',
        JSON.stringify(pathToFileURL(resolve("dist/index.mjs")).href),
      )
      .replaceAll(
        '"typescript-eslint"',
        JSON.stringify(import.meta.resolve("typescript-eslint")),
      );
    const { default: config } = await import(
      `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
    );
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: config,
    });
    const result = await eslint.calculateConfigForFile(
      snippet.includes("tseslint")
        ? "fixtures/example.tsx"
        : "fixtures/example.js",
    );
    expect(result.rules["better-react-hook-form/no-double-register"][0]).toBe(
      2,
    );
  }
});
