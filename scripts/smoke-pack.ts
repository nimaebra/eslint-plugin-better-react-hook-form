import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
function option(name: string, fallback: string) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : (args[index + 1] ?? fallback);
}
const eslintVersion = option("--eslint-version", "^10");
const rhfVersion = option("--rhf-version", "^7");
const directory = mkdtempSync(join(tmpdir(), "better-rhf-smoke-"));
const root = process.cwd();
function run(command: string, argv: string[], cwd = directory) {
  return execFileSync(command, argv, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    env: process.env,
  });
}
try {
  run("npm", ["run", "build"], root);
  const packed = JSON.parse(
    run(
      "npm",
      ["pack", "--json", "--ignore-scripts", "--pack-destination", directory],
      root,
    ),
  ) as Array<{ filename: string; files: Array<{ path: string }> }>;
  const [{ filename, files }] = packed;
  for (const { path } of files)
    if (
      !path.startsWith("dist/") &&
      !["README.md", "LICENSE", "package.json"].includes(path)
    )
      throw new Error(`Unexpected packaged file: ${path}`);
  const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8")) as {
    name: string;
    version: string;
  };
  writeFileSync(
    join(directory, "package.json"),
    JSON.stringify({
      name: "plugin-consumer",
      version: "1.0.0",
      private: true,
      type: "module",
    }),
  );
  run("npm", [
    "install",
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
    "--package-lock=false",
    join(directory, filename),
    `eslint@${eslintVersion}`,
    `react-hook-form@${rhfVersion}`,
    "react@^19",
    "typescript@^6",
    "@types/node@^24",
  ]);
  writeFileSync(
    join(directory, "smoke.mjs"),
    `
 import assert from 'node:assert/strict';
 import {createRequire} from 'node:module';
 import {ESLint} from 'eslint';
 import plugin,{rules,flatConfigs,configs} from '${pkg.name}';
 assert.equal(plugin.meta.version,'${pkg.version}');
 assert.equal(plugin.rules,rules);
 assert.equal(plugin.configs,configs);
 const cjs=createRequire(import.meta.url)('${pkg.name}');
 assert.equal(cjs.default.meta.version,plugin.meta.version);
 assert.deepEqual(Object.keys(cjs.rules),Object.keys(rules));
 const eslint=new ESLint({overrideConfigFile:true,overrideConfig:flatConfigs.recommended});
 const [invalid]=await eslint.lintText("import {useForm} from 'react-hook-form'; const {register}=useForm();register('x',{valueAsNumber:true,valueAsDate:true});",{filePath:'sample.js'});
 assert.deepEqual(invalid.messages.map(m=>m.ruleId),['better-react-hook-form/no-conflicting-value-transforms']);
 const [valid]=await eslint.lintText("const unrelated = 1;",{filePath:'sample.js'});
 assert.deepEqual(valid.messages,[]);
 if ((await import('eslint/package.json',{with:{type:'json'}})).default.version.startsWith('9.')) {
  const {LegacyESLint}=createRequire(import.meta.url)('eslint/use-at-your-own-risk');
  const legacy=new LegacyESLint({useEslintrc:false,overrideConfig:{extends:['plugin:better-react-hook-form/recommended'],parserOptions:{ecmaVersion:2022,sourceType:'module'}}});
  const [result]=await legacy.lintText("import {useForm} from 'react-hook-form'; const {register}=useForm();register('x',{valueAsNumber:true,valueAsDate:true});");
  assert.equal(result.messages[0]?.ruleId,'better-react-hook-form/no-conflicting-value-transforms');
 }
 console.log('ESM, CommonJS and lint smoke checks passed');
 `,
  );
  run(process.execPath, ["smoke.mjs"]);
  const types = `import plugin, {flatConfigs,configs,rules} from '${pkg.name}';\nimport type {ESLint,Linter} from 'eslint';\nconst p:ESLint.Plugin=plugin;\nconst c:Linter.Config[]=flatConfigs.recommended;\nvoid [p,c,configs,rules];\n`;
  for (const extension of ["mts", "cts"])
    writeFileSync(join(directory, `consumer.${extension}`), types);
  run(process.execPath, [
    join(directory, "node_modules/typescript/bin/tsc"),
    "--noEmit",
    "--strict",
    "--skipLibCheck",
    "--module",
    "nodenext",
    "--target",
    "es2022",
    "consumer.mts",
    "consumer.cts",
  ]);
  console.log(
    `Package smoke test passed: ESLint ${eslintVersion}, RHF ${rhfVersion} (ESM/CJS/types/lint/contents)`,
  );
} finally {
  rmSync(directory, { recursive: true, force: true });
}
