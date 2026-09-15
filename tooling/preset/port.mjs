// port — create or refresh the tyohnn system for a shadcn create preset: everything that is mechanical.
//
// Usage: node tooling/preset/port.mjs <preset> [--workdir <dir>] [--from foundation]
//
// Needs the reference app (make-reference.mjs, same --workdir). Steps:
//   1. `node tooling/new-system <preset> --from foundation` when registry/systems/<preset> does not exist.
//   2. system.json: fonts (font · fontHeading → catalog ids, mono system, hangulFallback pretendard),
//      icons.library, source { kind shadcn-preset, preset, shadcnVersion, commit }, tags. A description
//      that is still empty gets a placeholder that names the preset; write the mood line by hand.
//   3. Layer 1 (styles/globals.css), in place:
//      - the three font stacks rebuilt from fonts (the rules tooling/validate-system checks);
//      - every shadcn standard colour of the reference app's app/globals.css, :root and .dark
//        (--background … --sidebar-ring, --chart-*, --radius);
//      - the `--radius-*` scale of `@theme inline`.
//      Tokens outside the shadcn set that hold literal colours (the alpha forms of the style rules,
//      --canvas, status colours …) are listed for review: their values depend on the style file.
//   4. reference/README.md and reference/preset.json: preset config, source URLs and commit.
//
// Layer 2 and layer 3 are not ported by this script: read `node tooling/preset/style-diff.mjs mira <preset>`
// and iterate with tooling/snapshot/compare-shadcn.mjs (tooling/preset/README.md).

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

import { fontStacks, readFontCatalog, readTokens, repoRoot, systemsRoot } from "@tyohnn/build-system/registry";

import { argValue, PRESETS, presetConfig, referenceAppDir, SHADCN_VERSION, shadcnCommit } from "./shared.mjs";

const args = process.argv.slice(2);
const preset = args.find((arg, index) => !arg.startsWith("--") && !args[index - 1]?.startsWith("--"));
const from = argValue("from", "foundation");

if (!PRESETS.includes(preset))
{
    console.error(`usage: node tooling/preset/port.mjs <${PRESETS.join("|")}> [--workdir dir] [--from foundation]`);
    process.exit(2);
}

const app = referenceAppDir(preset);
const referenceCss = join(app, "app/globals.css");

if (!existsSync(referenceCss)) throw new Error(`No reference app at ${app}. Run tooling/preset/make-reference.mjs ${preset} first.`);

const config = presetConfig(preset);
const commit = shadcnCommit();
const target = join(systemsRoot, preset);
const catalog = readFontCatalog();

// 1. fork
if (!existsSync(target))
{
    execFileSync(process.execPath, [join(repoRoot, "tooling/new-system"), preset, "--from", from], { stdio: "inherit" });
}

// 2. system.json
const metaPath = join(target, "system.json");
const meta = JSON.parse(readFileSync(metaPath, "utf8"));
const fontId = (id) =>
{
    if (!catalog.has(id)) throw new Error(`Preset font "${id}" is not in registry/fonts: add registry/fonts/${id}.json first`);

    return id;
};

meta.description ||= `shadcn ${preset} preset (${config.style} · ${config.baseColor} · ${config.iconLibrary} · ${config.font}). TODO: one line on its mood.`;
meta.fonts = {
    sans: fontId(config.font),
    heading: !config.fontHeading || config.fontHeading === "inherit" ? "inherit" : fontId(config.fontHeading),
    mono: "system",
    hangulFallback: "pretendard",
};
meta.icons = { library: config.iconLibrary };
meta.tags = [...new Set([...(meta.tags ?? []), "shadcn-preset"])];
meta.source = {
    kind: "shadcn-preset",
    note: `shadcn create preset base-${preset} (npx shadcn@${SHADCN_VERSION} init -t next -b base -p ${preset}); values checked against the reference app with tooling/snapshot/compare-shadcn.mjs.`,
    preset,
    shadcnVersion: SHADCN_VERSION,
    commit,
};
writeFileSync(metaPath, `${JSON.stringify(meta, null, 4)}\n`);

// 3. layer 1
const globalsPath = join(target, "styles/globals.css");
let globals = readFileSync(globalsPath, "utf8");
const reference = readTokens(referenceCss);
const referenceSource = readFileSync(referenceCss, "utf8");

/** [start, end) of the top-level block whose selector is exactly `selector` and that declares --background */
const blockRange = (source, selector) =>
{
    const pattern = new RegExp(`^${selector.replace(".", "\\.")}\\s*\\{`, "gm");

    for (const match of source.matchAll(pattern))
    {
        const start = match.index;
        const end = source.indexOf("\n}", start);

        if (source.slice(start, end).includes("--background:")) return [start, end];
    }

    throw new Error(`${relative(repoRoot, globalsPath)} has no top-level ${selector} block with --background`);
};

const changes = [];

const setInBlock = (selector, name, value) =>
{
    const [start, end] = blockRange(globals, selector);
    const block = globals.slice(start, end);
    const pattern = new RegExp(`^(\\s*${name}:\\s*)([^;]+)(;)`, "m");
    const match = block.match(pattern);

    if (!match)
    {
        changes.push(`${selector} ${name}: not in the system (skipped; the reference declares ${value})`);

        return;
    }

    if (match[2].trim() === value) return;

    changes.push(`${selector} ${name}: ${match[2].trim()} → ${value}`);
    globals = globals.slice(0, start) + block.replace(pattern, `$1${value}$3`) + globals.slice(end);
};

for (const [name, value] of Object.entries(fontStacks(meta.fonts, catalog))) setInBlock(":root", name, value);

for (const row of reference)
{
    if (row.name.startsWith("--font-")) continue;
    setInBlock(row.scope, row.name, row.value);
}

// @theme inline radius scale
for (const match of referenceSource.matchAll(/^\s*(--radius-(?:sm|md|lg|xl|2xl|3xl|4xl)):\s*([^;]+);/gm))
{
    const pattern = new RegExp(`^(\\s*${match[1]}:\\s*)([^;]+)(;)`, "m");
    const current = globals.match(pattern);

    if (current && current[2].trim() !== match[2].trim())
    {
        changes.push(`@theme ${match[1]}: ${current[2].trim()} → ${match[2].trim()}`);
        globals = globals.replace(pattern, `$1${match[2].trim()}$3`);
    }
}

writeFileSync(globalsPath, globals);

const standard = new Set(reference.map((row) => row.name));
const review = readTokens(globalsPath)
    .filter((row) => !standard.has(row.name) && !row.name.startsWith("--font-") && /oklch|rgb|#[0-9a-f]{3}/i.test(row.value));

// 4. reference/
const referenceDir = join(target, "reference");

mkdirSync(referenceDir, { recursive: true });
writeFileSync(join(referenceDir, "preset.json"), `${JSON.stringify({ shadcnVersion: SHADCN_VERSION, commit, config }, null, 4)}\n`);

const blob = (path) => `https://github.com/shadcn-ui/ui/blob/${commit}/${path}`;
const readmePath = join(referenceDir, "README.md");
const readme = `# ${preset} — reference

This system ports the shadcn create preset \`base-${preset}\` (shadcn ${SHADCN_VERSION}, shadcn-ui/ui commit \`${commit}\`,
tag \`shadcn@${SHADCN_VERSION}\`). Nothing from the sources is copied into this folder; the links are the record.

| Preset field | Value |
|---|---|
${Object.entries(config).filter(([key]) => !["name", "title"].includes(key)).map(([key, value]) => `| \`${key}\` | \`${value}\` |`).join("\n")}

## Sources

- Style rules: ${blob(`apps/v4/registry/styles/style-${config.style}.css`)}
- Base colours and themes: ${blob("apps/v4/registry/base-colors.ts")} · ${blob("apps/v4/registry/themes.ts")}
- Preset list: ${blob("apps/v4/registry/config.ts")}
- Reference app: \`node tooling/preset/make-reference.mjs ${preset}\` — \`npx shadcn@${SHADCN_VERSION} init -t next -b base -p ${preset} -n ${preset}\`
  plus \`shadcn add\` of every registry/ui component; its generated \`app/globals.css\` and \`components/ui/*\` are the answer key.

## Comparison

\`node tooling/snapshot/compare-shadcn.mjs --system ${preset} --mode light\` (and \`--mode dark\`). Exclusions live in
\`compare-exclusions.json\` with a reason each.
`;

if (!existsSync(readmePath)) writeFileSync(readmePath, readme);
if (!existsSync(join(referenceDir, "compare-exclusions.json"))) writeFileSync(join(referenceDir, "compare-exclusions.json"), "[]\n");

console.log(`\n${relative(repoRoot, target)}: system.json fonts ${JSON.stringify(meta.fonts)} · icons ${meta.icons.library}`);
console.log(`layer 1: ${changes.length} changes`);
changes.forEach((line) => console.log(`  ${line}`));
const reviewNames = [...new Set(review.map((row) => row.name))];

console.log(`\nlayer 1 tokens outside the shadcn set with literal colours (check against style-${config.style}.css): ${reviewNames.length}`);
console.log(`  ${reviewNames.join(" ")}`);
console.log(`\nNext: node tooling/preset/style-diff.mjs mira ${preset}  ·  README step 3`);
