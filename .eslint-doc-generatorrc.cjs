const prettier = require("prettier");
const prettierConfig = require("./.prettierrc.json");

/** @type {import('eslint-doc-generator').GenerateOptions} */
module.exports = {
  configEmoji: [["recommended", "✅"]],
  ignoreConfig: ["flat/recommended"],
  postprocess: async (content, path) => {
    if (!path.endsWith(".md")) {
      return content;
    }

    return prettier.format(content, {
      ...prettierConfig,
      parser: "markdown",
    });
  },
};
