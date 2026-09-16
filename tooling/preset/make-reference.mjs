// make-reference — build the shadcn reference app (the answer key) for one create preset.
//
// Usage: node tooling/preset/make-reference.mjs <preset> [--workdir <dir>] [--skip-add]
//
//   1. Sparse-checks out shadcn-ui/ui at the pinned tag (apps/v4/registry: styles, themes, preset config).
//   2. `npx shadcn@<version> init -t next -b base -p <preset> -n <preset>`: a Next app on Base UI with the
//      preset's style, base colour, theme, icon library, fonts and radius.
//   3. `shadcn add` every component registry/ui has (`--overwrite -y`).
//   4. Copies the component sheet and coverage templates (apps/preview/src/templates/{component-sheet,coverage})
//      into the app with import paths rewritten to `@/components/ui/*`, the Korean strings swapped for English
//      (specimen-text.json) and `@tyohnn/icons` pointed at a copy of registry/ui/icons for the preset's icon
//      library. `app/page.tsx` renders the sheet, or the coverage template for `?template=coverage[&section=<name>]`.
//   5. Type-checks the app. Errors there are API differences between registry/ui and shadcn: record them
//      in the system's reference/README.md and exclude those parts from the comparison.
//   6. Writes <app>/tyohnn-reference.json (preset config, shadcn version and commit, what was rewritten).
//
// Then: `npm run dev -- -p 3100` inside the app, and tooling/snapshot/compare-shadcn.mjs.

import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { repoRoot } from "@tyohnn/build-system/registry";

import { argValue, PRESETS, presetConfig, referenceAppDir, REFERENCE_PORT, SHADCN_VERSION, shadcnCheckout, shadcnCommit, workdir } from "./shared.mjs";

const args = process.argv.slice(2);
const preset = args.find((arg, index) => !arg.startsWith("--") && !args[index - 1]?.startsWith("--workdir"));

if (!PRESETS.includes(preset))
{
    console.error(`usage: node tooling/preset/make-reference.mjs <${PRESETS.join("|")}> [--workdir dir] [--skip-add]`);
    process.exit(2);
}

const run = (command, commandArgs, cwd) =>
{
    console.log(`$ ${command} ${commandArgs.join(" ")}   (in ${cwd})`);
    const result = spawnSync(command, commandArgs, { cwd, stdio: ["ignore", "inherit", "inherit"], env: { ...process.env, CI: "1" } });

    if (result.status !== 0) throw new Error(`${command} ${commandArgs[0]} failed (${result.status})`);
};

shadcnCheckout({ fetch: true });

const config = presetConfig(preset);
const app = referenceAppDir(preset);
const shadcn = `shadcn@${SHADCN_VERSION}`;

// 2. init
if (!existsSync(join(app, "components.json")))
{
    run("npx", ["-y", shadcn, "init", "-t", "next", "-b", "base", "-p", preset, "-n", preset, "--no-monorepo", "-y"], workdir());
}

// 3. every registry/ui component
const components = readdirSync(join(repoRoot, "registry/ui/components")).filter((file) => file.endsWith(".tsx")).map((file) => file.replace(/\.tsx$/, ""));

if (!args.includes("--skip-add"))
{
    run("npx", [shadcn, "add", ...components, "--overwrite", "-y"], app);
}

const missing = components.filter((name) => !existsSync(join(app, "components/ui", `${name}.tsx`)));

// 4. icons: registry/ui/icons for the preset's library, so the Specimen's semantic names draw the same glyphs
const manifest = JSON.parse(readFileSync(join(repoRoot, "registry/ui/manifest.json"), "utf8"));
const iconLibrary = config.iconLibrary;
const iconEntry = manifest.iconLibraries?.[iconLibrary];

if (!iconEntry) throw new Error(`registry/ui/manifest.json has no iconLibraries.${iconLibrary}`);

const iconsDir = join(app, "components/tyohnn-icons");

mkdirSync(join(iconsDir, "libraries"), { recursive: true });
cpSync(join(repoRoot, "registry/ui/icons/names.ts"), join(iconsDir, "names.ts"));
cpSync(join(repoRoot, "registry/ui", iconEntry.file), join(iconsDir, "libraries", `${iconLibrary}.tsx`));
writeFileSync(join(iconsDir, "index.ts"), `export * from "./libraries/${iconLibrary}"\n`);

const appPackage = JSON.parse(readFileSync(join(app, "package.json"), "utf8"));
const missingPackages = Object.keys(iconEntry.packages).filter((name) => !appPackage.dependencies?.[name]);

if (missingPackages.length) run("npm", ["install", ...missingPackages.map((name) => `${name}@${iconEntry.packages[name]}`)], app);

// 4. the component sheet
const { strings } = JSON.parse(readFileSync(join(repoRoot, "tooling/preset/specimen-text.json"), "utf8"));
const byLength = Object.entries(strings).sort((a, b) => b[0].length - a[0].length);
const TEMPLATES = ["component-sheet", "coverage"];

const rewrite = (source) =>
{
    let code = source
        .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/@tyohnn\/components\//g, "@/components/ui/")
        .replace(/@tyohnn\/icons/g, "@/components/tyohnn-icons");

    for (const [korean, english] of byLength) code = code.replaceAll(korean, english);

    if (/[ㄱ-ㆎ가-힣]/.test(code)) throw new Error("Hangul left in the reference Specimen: add the string to tooling/preset/specimen-text.json");

    return `"use client"\n\n${code}`;
};

for (const template of TEMPLATES)
{
    const from = join(repoRoot, "apps/preview/src/templates", template);
    const outDir = join(app, "components", template);

    mkdirSync(outDir, { recursive: true });

    for (const file of readdirSync(from))
    {
        writeFileSync(join(outDir, file), rewrite(readFileSync(join(from, file), "utf8")));
    }
}

// The same query the preview reads: ?template=coverage[&section=<name>] (sections open their popups).
writeFileSync(join(app, "app/page.tsx"), [
    `import { ComponentSheet } from "@/components/component-sheet"`,
    `import { Coverage } from "@/components/coverage"`,
    ``,
    `export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {`,
    `  const { template, section } = await searchParams`,
    ``,
    `  if (template === "coverage") return <Coverage section={typeof section === "string" ? section : null} />`,
    ``,
    `  return <ComponentSheet />`,
    `}`,
    ``,
].join("\n"));

// 5. type-check: API differences between registry/ui and the shadcn components show up here
const typecheck = spawnSync("npx", ["tsc", "--noEmit", "--pretty", "false"], { cwd: app, encoding: "utf8" });
const typeErrors = `${typecheck.stdout}${typecheck.stderr}`.split("\n").filter((line) => /error TS/.test(line));

// 6. record
const record = {
    preset,
    shadcnVersion: SHADCN_VERSION,
    commit: shadcnCommit(),
    config,
    command: `npx ${shadcn} init -t next -b base -p ${preset} -n ${preset} --no-monorepo -y && npx ${shadcn} add <${components.length} registry/ui components> --overwrite -y`,
    styleSource: `https://github.com/shadcn-ui/ui/blob/${shadcnCommit()}/apps/v4/registry/styles/style-${config.style}.css`,
    componentsMissing: missing,
    specimen: { from: TEMPLATES.map((template) => `apps/preview/src/templates/${template}`), imports: "@tyohnn/components/* → @/components/ui/*", icons: `@tyohnn/icons → components/tyohnn-icons (${iconLibrary})`, text: "tooling/preset/specimen-text.json" },
    typeErrors,
};

writeFileSync(join(app, "tyohnn-reference.json"), `${JSON.stringify(record, null, 2)}\n`);

console.log(`\nReference app: ${app}`);
console.log(`preset ${preset}: style ${config.style} · baseColor ${config.baseColor} · theme ${config.theme} · icons ${iconLibrary} · font ${config.font} · heading ${config.fontHeading} · radius ${config.radius}`);
console.log(`components missing in shadcn: ${missing.length ? missing.join(", ") : "none"}`);
console.log(`type errors in the Specimen copy: ${typeErrors.length}`);
typeErrors.slice(0, 20).forEach((line) => console.log(`  ${line.replace(app, "")}`));
console.log(`\nNext: (cd ${app} && npm run dev -- -p ${REFERENCE_PORT})`);
