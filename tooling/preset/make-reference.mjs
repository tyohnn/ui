// make-reference — build the shadcn reference app (the answer key) for one create preset.
//
// Usage: node tooling/preset/make-reference.mjs <preset> [--variant <base>-<accent>] [--workdir <dir>] [--skip-add]
//        [--blocks sidebar-01,… | all]
//
// `--variant stone-blue` builds the same preset with another baseColor and theme — the answer key for wearing
// a tyohnn theme on that system. It goes to <workdir>/<preset>--<variant>, so the plain reference app stays.
//
//   1. Sparse-checks out shadcn-ui/ui at the pinned tag (apps/v4/registry: styles, themes, preset config).
//   2. `npx shadcn@<version> init -t next -b base -p <preset> -n <preset>`: a Next app on Base UI with the
//      preset's style, base colour, theme, icon library, fonts and radius.
//   3. `shadcn add` every component registry/ui has (`--overwrite -y`).
//   4. Copies the component sheet and coverage templates (apps/preview/src/templates/{component-sheet,coverage})
//      into the app with import paths rewritten to `@/components/ui/*`, the Korean strings swapped for English
//      (specimen-text.json) and `@tyohnn/icons` pointed at a copy of registry/ui/icons for the preset's icon
//      library. `app/page.tsx` renders the sheet, or the coverage template for `?template=coverage[&section=<name>]`.
//   4b. `--blocks`: `npx shadcn@<version> add sidebar-NN` for each block, then moves what the block installed so all
//      sixteen coexist — its page (`app/dashboard/page.tsx`) to `app/blocks/sidebar-NN/page.tsx` and its components
//      (`components/<file>.tsx`, names that repeat across blocks) to `components/blocks/sidebar-NN/`, with the
//      page's and components' `@/components/<file>` imports pointed there. Served at `/blocks/sidebar-NN`.
//   5. Type-checks the app. Errors there are API differences between registry/ui and shadcn: record them
//      in the system's reference/README.md and exclude those parts from the comparison.
//   6. Writes <app>/tyohnn-reference.json (preset config, shadcn version and commit, what was rewritten).
//
// Then: `npm run dev -- -p 3100` inside the app, and tooling/snapshot/compare-shadcn.mjs. For the blocks, a production
// build (`npm run build && npx next start -p 3150`, ports 3150–3159) and tooling/snapshot/compare-blocks.mjs.

import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { repoRoot } from "@tyohnn/build-system/registry";

import { argValue, PRESETS, presetConfig, presetUrl, referenceAppDir, REFERENCE_PORT, SHADCN_VERSION, shadcnCheckout, shadcnCommit, workdir } from "./shared.mjs";

const args = process.argv.slice(2);
const preset = args.find((arg, index) => !arg.startsWith("--") && !["--workdir", "--blocks", "--variant"].includes(args[index - 1]));
// `<baseColor>-<accent>`: the two colour axes shadcn create asks about, which a tyohnn theme also carries.
const variant = argValue("variant", "");
const [variantBase, variantAccent] = variant.split("-");

if (variant && (!variantBase || !variantAccent))
{
    console.error(`--variant takes <baseColor>-<accent>, e.g. stone-blue`);
    process.exit(2);
}
const blocksArg = argValue("blocks", "");
const BLOCK_NAMES = Array.from({ length: 16 }, (_, index) => `sidebar-${String(index + 1).padStart(2, "0")}`);
const blocks = blocksArg === "all" ? BLOCK_NAMES : blocksArg.split(",").map((name) => name.trim()).filter(Boolean);
const unknownBlocks = blocks.filter((name) => !BLOCK_NAMES.includes(name));

if (unknownBlocks.length)
{
    console.error(`unknown blocks: ${unknownBlocks.join(", ")} (sidebar-01 … sidebar-16, or all)`);
    process.exit(2);
}

if (!PRESETS.includes(preset))
{
    console.error(`usage: node tooling/preset/make-reference.mjs <${PRESETS.join("|")}> [--workdir dir] [--skip-add] [--blocks sidebar-01,…|all]`);
    process.exit(2);
}

const run = (command, commandArgs, cwd) =>
{
    console.log(`$ ${command} ${commandArgs.join(" ")}   (in ${cwd})`);
    const result = spawnSync(command, commandArgs, { cwd, stdio: ["ignore", "inherit", "inherit"], env: { ...process.env, CI: "1" } });

    if (result.status !== 0) throw new Error(`${command} ${commandArgs[0]} failed (${result.status})`);
};

shadcnCheckout({ fetch: true });

const config = { ...presetConfig(preset), ...(variant ? { baseColor: variantBase, theme: variantAccent, chartColor: variantAccent } : {}) };
const app = referenceAppDir(preset, variant);
const name = variant ? `${preset}--${variant}` : preset;
const shadcn = `shadcn@${SHADCN_VERSION}`;
// A variant is not a named preset, so it goes in as the URL shadcn's own create builds for those choices.
const source = variant ? presetUrl(presetConfig(preset), { baseColor: variantBase, theme: variantAccent, chartColor: variantAccent }) : preset;

// 2. init
if (!existsSync(join(app, "components.json")))
{
    run("npx", ["-y", shadcn, "init", "-t", "next", "-b", "base", "-p", source, "-n", name, "--no-monorepo", "-y"], workdir());
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

// 4b. the sidebar blocks, one route and one component folder each
/** The component files a block installs, from the block registry of the pinned checkout. */
const blockComponentFiles = (block) =>
{
    const source = readFileSync(join(shadcnCheckout(), "apps/v4/registry/bases/base/blocks/_registry.ts"), "utf8");
    const start = source.indexOf(`name: "${block}"`);

    if (start === -1) throw new Error(`${block} is not in the base block registry`);

    const entry = source.slice(start, source.indexOf("categories:", start));

    return [...entry.matchAll(new RegExp(`path: "blocks/${block}/components/([\\w-]+)\\.tsx"`, "g"))].map((match) => match[1]);
};

for (const block of blocks)
{
    const names = blockComponentFiles(block);
    const pageFrom = join(app, "app/dashboard/page.tsx");
    const pageTo = join(app, "app/blocks", block, "page.tsx");
    const componentsTo = join(app, "components/blocks", block);

    // Leftovers of an interrupted run would make `add` skip the block's own files.
    rmSync(join(app, "app/dashboard"), { recursive: true, force: true });
    names.forEach((name) => rmSync(join(app, "components", `${name}.tsx`), { force: true }));

    run("npx", [shadcn, "add", block, "-y"], app);

    const pointAtBlock = (code) => code.replace(/(["'])@\/components\/([\w-]+)\1/g, (whole, quote, name) =>
        (names.includes(name) ? `${quote}@/components/blocks/${block}/${name}${quote}` : whole));

    mkdirSync(dirname(pageTo), { recursive: true });
    mkdirSync(componentsTo, { recursive: true });
    writeFileSync(pageTo, pointAtBlock(readFileSync(pageFrom, "utf8")));
    rmSync(join(app, "app/dashboard"), { recursive: true, force: true });

    for (const name of names)
    {
        const from = join(app, "components", `${name}.tsx`);

        if (!existsSync(from)) throw new Error(`${block}: shadcn add did not write components/${name}.tsx`);
        writeFileSync(join(componentsTo, `${name}.tsx`), pointAtBlock(readFileSync(from, "utf8")));
        rmSync(from);
    }

    console.log(`${block}: /blocks/${block} · components/blocks/${block}/{${names.join(",")}}`);
}

const installedBlocks = existsSync(join(app, "app/blocks")) ? readdirSync(join(app, "app/blocks")).sort() : [];

// 5. type-check: API differences between registry/ui and the shadcn components show up here
const typecheck = spawnSync("npx", ["tsc", "--noEmit", "--pretty", "false"], { cwd: app, encoding: "utf8" });
const typeErrors = `${typecheck.stdout}${typecheck.stderr}`.split("\n").filter((line) => /error TS/.test(line));

// 6. record
const record = {
    preset,
    shadcnVersion: SHADCN_VERSION,
    commit: shadcnCommit(),
    config,
    command: `npx ${shadcn} init -t next -b base -p ${source} -n ${name} --no-monorepo -y && npx ${shadcn} add <${components.length} registry/ui components> --overwrite -y`,
    styleSource: `https://github.com/shadcn-ui/ui/blob/${shadcnCommit()}/apps/v4/registry/styles/style-${config.style}.css`,
    componentsMissing: missing,
    specimen: { from: TEMPLATES.map((template) => `apps/preview/src/templates/${template}`), imports: "@tyohnn/components/* → @/components/ui/*", icons: `@tyohnn/icons → components/tyohnn-icons (${iconLibrary})`, text: "tooling/preset/specimen-text.json" },
    blocks: installedBlocks.length ? { installed: installedBlocks, route: "/blocks/<block>", components: "components/blocks/<block>/", command: `npx ${shadcn} add <block> -y, then moved` } : undefined,
    typeErrors,
};

writeFileSync(join(app, "tyohnn-reference.json"), `${JSON.stringify(record, null, 2)}\n`);

console.log(`\nReference app: ${app}`);
console.log(`preset ${preset}: style ${config.style} · baseColor ${config.baseColor} · theme ${config.theme} · icons ${iconLibrary} · font ${config.font} · heading ${config.fontHeading} · radius ${config.radius}`);
console.log(`components missing in shadcn: ${missing.length ? missing.join(", ") : "none"}`);
console.log(`type errors in the Specimen copy: ${typeErrors.length}`);
typeErrors.slice(0, 20).forEach((line) => console.log(`  ${line.replace(app, "")}`));
console.log(`blocks installed: ${installedBlocks.length ? installedBlocks.join(", ") : "none"}`);
console.log(`\nNext: (cd ${app} && npm run dev -- -p ${REFERENCE_PORT})${installedBlocks.length ? ` · blocks: (cd ${app} && npm run build && npx next start -p 3150)` : ""}`);
