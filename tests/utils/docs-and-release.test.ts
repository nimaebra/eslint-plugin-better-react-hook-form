import { expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { rules } from "../../src/rules/registry.js";
it("provides canonical documentation URLs for every rule", () => {
  for (const [name, rule] of Object.entries(rules))
    expect(rule.meta.docs?.url).toBe(
      `https://github.com/nimaebra/eslint-plugin-better-react-hook-form/blob/main/docs/rules/${name}.md`,
    );
});
it("requires an explicit main-branch manual dispatch before publishing", () => {
  const workflow = readFileSync(".github/workflows/release.yml", "utf8");
  expect(workflow).toContain(
    "github.event_name == 'workflow_dispatch' && inputs.publish && github.ref == 'refs/heads/main'",
  );
  expect(workflow).toContain("default: false");
  expect(workflow).toContain("publish-script:");
});

it("keeps local documentation links resolvable", () => {
  const files = [
    "README.md",
    "CONTRIBUTING.md",
    "CHANGELOG.md",
    "SECURITY.md",
    "CODE_OF_CONDUCT.md",
    ".changeset/README.md",
    ".github/PULL_REQUEST_TEMPLATE.md",
    ...readdirSync("docs", { recursive: true, encoding: "utf8" })
      .filter((file) => file.endsWith(".md"))
      .map((file) => `docs/${file}`),
  ];
  for (const file of files) {
    const markdown = readFileSync(file, "utf8");
    for (const [, target] of markdown.matchAll(/\]\(([^\s)]+)\)/g)) {
      if (/^(?:https?:|mailto:|#)/.test(target)) continue;
      const path = resolve(
        dirname(file),
        decodeURIComponent(target.split("#")[0]),
      );
      expect(existsSync(path), `${file}: ${target}`).toBe(true);
    }
  }
});
