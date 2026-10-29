import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
function option(name: string, fallback: string) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : (args[index + 1] ?? fallback);
}
const eslintVersion = option("--eslint-version", "^10");
const rhfVersion = option("--rhf-version", "^7");
const typescriptVersion = option("--typescript-version", "^6");
const packageSpec = option("--package-spec", "");
const directory = mkdtempSync(join(tmpdir(), "better-rhf-smoke-"));
const root = process.cwd();
function run(command: string, argv: string[], cwd = directory) {
  try {
    return execFileSync(command, argv, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"],
      env: process.env,
    });
  } catch (error) {
    if (error && typeof error === "object" && "stdout" in error)
      process.stderr.write(String(error.stdout ?? ""));
    throw error;
  }
}
try {
  if (!packageSpec) run("npm", ["run", "build"], root);
  const packed = JSON.parse(
    run(
      "npm",
      [
        "pack",
        ...(packageSpec ? [packageSpec] : []),
        "--json",
        "--ignore-scripts",
        "--pack-destination",
        directory,
      ],
      root,
    ),
  ) as Array<{
    filename: string;
    name: string;
    version: string;
    integrity: string;
    files: Array<{ path: string }>;
  }>;
  const [{ filename, name, version, integrity, files }] = packed;
  const required = new Set([
    "dist/index.mjs",
    "dist/index.cjs",
    "dist/index.d.ts",
    "dist/index.d.cts",
    "README.md",
    "LICENSE",
    "package.json",
  ]);
  for (const { path } of files) {
    if (
      !path.startsWith("dist/") &&
      !["README.md", "LICENSE", "package.json"].includes(path)
    )
      throw new Error(`Unexpected packaged file: ${path}`);
    required.delete(path);
  }
  if (required.size)
    throw new Error(`Missing packaged files: ${[...required].join(", ")}`);
  const pkg = JSON.parse(
    readFileSync(resolve(root, "package.json"), "utf8"),
  ) as { name: string; version: string };
  if (name !== pkg.name || version !== pkg.version)
    throw new Error(
      `Expected ${pkg.name}@${pkg.version}, received ${name}@${version}`,
    );
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
    ...(rhfVersion === "none"
      ? []
      : [`react-hook-form@${rhfVersion}`, "react@^19"]),
    `typescript@${typescriptVersion}`,
    "@types/node@20.11.30",
    "@typescript-eslint/parser@^8.72.0",
  ]);
  copyFileSync(
    join(root, "examples/rule-cases.json"),
    join(directory, "rule-cases.json"),
  );
  writeFileSync(
    join(directory, "smoke.mjs"),
    `
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {ESLint} from 'eslint';
import parser from '@typescript-eslint/parser';
import plugin,{rules,flatConfigs,configs} from '${pkg.name}';
const require=createRequire(import.meta.url);
const fixtures=JSON.parse(readFileSync(new URL('./rule-cases.json',import.meta.url),'utf8'));
assert.equal(plugin.meta.name,'${pkg.name}');
assert.equal(plugin.meta.version,'${pkg.version}');
assert.equal(plugin.meta.namespace,'better-react-hook-form');
assert.equal(plugin.rules,rules);
assert.equal(plugin.configs,configs);
const manifest=require('${pkg.name}/package.json');
assert.equal(manifest.peerDependenciesMeta['react-hook-form'].optional,true);
assert.equal(manifest.version,plugin.meta.version);
const cjs=require('${pkg.name}');
assert.equal(cjs.default.meta.version,plugin.meta.version);
assert.deepEqual(Object.keys(cjs.rules),Object.keys(rules));
assert.deepEqual(Object.keys(fixtures).sort(),Object.keys(rules).sort());
for(const preset of ['recommended','strict','all']){
 for(const extension of ['jsx','tsx']){
  const eslint=new ESLint({overrideConfigFile:true,overrideConfig:[...flatConfigs[preset],{files:['**/*.'+extension],languageOptions:{...(extension==='tsx'?{parser}:{}),parserOptions:{ecmaFeatures:{jsx:true}}}}]});
  for(const [name,fixture] of Object.entries(fixtures)){
   const [valid]=await eslint.lintText(fixture.valid,{filePath:'valid.'+extension});
   assert.deepEqual(valid.messages,[],preset+' valid '+name);
   const [invalid]=await eslint.lintText(fixture.invalid,{filePath:'invalid.'+extension});
   const id='better-react-hook-form/'+name;
   const severity=flatConfigs[preset][0].rules[id];
   assert.deepEqual(invalid.messages.map(({ruleId,severity})=>({ruleId,severity})),severity?[{ruleId:id,severity:severity==='warn'?1:2}]:[],preset+' invalid '+name);
  }
 }
}
const cjsESLint=new ESLint({overrideConfigFile:true,overrideConfig:cjs.flatConfigs.recommended});
const [cjsResult]=await cjsESLint.lintText(fixtures['no-conflicting-value-transforms'].invalid);
assert.equal(cjsResult.messages[0]?.ruleId,'better-react-hook-form/no-conflicting-value-transforms');
if(require('eslint/package.json').version.startsWith('9.')){
 const {LegacyESLint}=require('eslint/use-at-your-own-risk');
 const legacy=new LegacyESLint({useEslintrc:false,overrideConfig:{extends:['plugin:better-react-hook-form/all'],parserOptions:{ecmaVersion:2022,sourceType:'module',ecmaFeatures:{jsx:true}}}});
 for(const [name,fixture] of Object.entries(fixtures)){
  const [valid]=await legacy.lintText(fixture.valid);
  assert.deepEqual(valid.messages,[],'legacy valid '+name);
  const [invalid]=await legacy.lintText(fixture.invalid);
  assert.deepEqual(invalid.messages.map(m=>m.ruleId),['better-react-hook-form/'+name],'legacy invalid '+name);
 }
}
${rhfVersion === "none" ? "assert.throws(()=>require.resolve('react-hook-form'),{code:'MODULE_NOT_FOUND'});" : ""}
console.log('ESM/CJS, all rules/presets, JSX/TSX and legacy consumer checks passed');
`,
  );
  run(process.execPath, ["smoke.mjs"]);
  const types = `import plugin,{flatConfigs,configs,rules} from '${pkg.name}';\nimport type {ESLint,Linter} from 'eslint';\nconst p:ESLint.Plugin=plugin;\nconst c:Linter.Config[]=flatConfigs.recommended;\nvoid [p,c,configs,rules];\n`;
  for (const extension of ["mts", "cts"])
    writeFileSync(join(directory, `consumer.${extension}`), types);
  run(process.execPath, [
    join(directory, "node_modules/typescript/bin/tsc"),
    "--noEmit",
    "--strict",
    "--module",
    "nodenext",
    "--target",
    "es2022",
    "consumer.mts",
    "consumer.cts",
  ]);
  console.log(
    `Package smoke test passed: ${name}@${version}, ESLint ${eslintVersion}, RHF ${rhfVersion}, TypeScript ${typescriptVersion}, integrity ${integrity}`,
  );
} finally {
  rmSync(directory, { recursive: true, force: true });
}
