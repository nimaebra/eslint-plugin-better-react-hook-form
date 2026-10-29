import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
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
