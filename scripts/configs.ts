import { readFileSync, writeFileSync } from "node:fs";
import prettier from "prettier";
import { ruleRegistry, presetRules } from "../src/rules/registry.js";
import { presetNames } from "../src/configs/index.js";

const content = await prettier.format(
  [
    "# Configuration presets",
    "",
    "Flat presets are arrays under `plugin.flatConfigs`; legacy presets live under `plugin.configs` and require ESLint 9.",
    "",
    "`strict` adds opt-in subscription and sequencing advice to `recommended`. `all` enables every rule as an error and can grow in minor releases.",
    "",
    "| Rule | recommended | strict | all |",
    "| :--- | :--- | :--- | :--- |",
    ...[...ruleRegistry]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(
        ({ name }) =>
          `| [${name}](rules/${name}.md) | ${presetNames.map((p) => presetRules(p)[`better-react-hook-form/${name}`] ?? "off").join(" | ")} |`,
      ),
    "",
  ].join("\n"),
  { ...(await prettier.resolveConfig("docs/configs.md")), parser: "markdown" },
);
if (process.argv.includes("--check")) {
  if (readFileSync("docs/configs.md", "utf8") !== content)
    throw new Error("Run pnpm docs:build to update preset documentation.");
  for (const { name, rule, recommended } of ruleRegistry) {
    if (rule.meta.docs?.recommended !== !!recommended)
      throw new Error(`${name}: recommended metadata disagrees with registry`);
    if (
      !readFileSync(`docs/rules/${name}.md`, "utf8").includes(
        `# better-react-hook-form/${name}`,
      )
    )
      throw new Error(`${name}: missing rule documentation`);
  }
} else writeFileSync("docs/configs.md", content);
