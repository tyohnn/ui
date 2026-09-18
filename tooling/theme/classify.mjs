// classify — sort every literal colour in a system's layer 1 into palette, derived and identity.
//
//   node tooling/theme/classify.mjs [name…]        (default: foundation and every system)
//
// Themes own the palette; a system keeps only formulas over it plus its own identity colours. This reads each
// globals.css (`:root` and `.dark` separately), renders every literal and every palette value to an 8-bit pixel in
// Chromium (the same canvas normalisation tooling/snapshot/collect.mjs compares with), and for each non-palette
// literal looks for a formula that paints the same pixel:
//   - var(--p)                                         the palette colour itself
//   - color-mix(in oklab, var(--p) N%, transparent)    the palette colour at N% (Tailwind's `bg-p/N`)
//   - color-mix(in oklab, var(--p) N%, var(--q))       two opaque palette colours mixed
// A proposal is kept only when the browser paints the formula to exactly the literal's pixel. Anything left over is
// an identity candidate for a person to confirm. Writes tooling/theme/out/classify.json and classify.md.

import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

import { foundationRoot, listSystems, readTokens, repoRoot, styleFiles, systemRoot } from "@tyohnn/build-system/registry";
import { PALETTE, PALETTE_GROUPS } from "@tyohnn/theme";

// A derived colour is a step off the neutral ramp, the accent or the sidebar. Tag tones, avatar tones,
// status colours and the chart ramp are destinations, not sources: they are where a palette ends, and a
// formula that reads one of them would tie a control's colour to a badge.
const SOURCES = new Set([...PALETTE_GROUPS.base, ...PALETTE_GROUPS.sidebar].map((name) => `--${name}`));

const require = createRequire(import.meta.url);
const { chromium } = require("@playwright/test");


const LITERAL = /^(?:oklch|oklab|lab|lch|rgba?|hsla?|color)\([^()]*\)$|^#[0-9a-f]{3,8}$|^(?:white|black|transparent)$/i;

const args = process.argv.slice(2);
const targets = args.length > 0 ? args : ["foundation", ...listSystems()];
const outDir = join(repoRoot, "tooling/theme/out");

const browser = await chromium.launch();
const page = await browser.newPage();

await page.setContent("<canvas width=1 height=1></canvas><div id=probe></div>");

/** Pixels [r, g, b, a] (0–255) for CSS colour strings, resolved in the browser; custom properties come from `vars`. */
const paint = (colours, vars = {}) => page.evaluate(([list, variables]) =>
{
    const probe = document.getElementById("probe");
    const context = document.querySelector("canvas").getContext("2d", { willReadFrequently: true });

    for (const [name, value] of Object.entries(variables)) probe.style.setProperty(name, value);

    return list.map((colour) =>
    {
        probe.style.color = "";
        probe.style.color = colour;

        if (!probe.style.color) return null;

        context.clearRect(0, 0, 1, 1);
        context.fillStyle = getComputedStyle(probe).color;
        context.fillRect(0, 0, 1, 1);

        return [...context.getImageData(0, 0, 1, 1).data];
    });
}, [colours, vars]);

/** The literal an alias chain ends at, within one scope. */
const resolveAlias = (values, value, depth = 0) =>
{
    const alias = /^var\(\s*(--[A-Za-z0-9_-]+)\s*\)$/.exec(String(value).trim());

    return alias && depth < 8 && values[alias[1]] !== undefined ? resolveAlias(values, values[alias[1]], depth + 1) : value;
};

const same = (a, b) => a && b && a.every((channel, index) => channel === b[index]);
const near = (a, b, tolerance) => a && b && a.every((channel, index) => Math.abs(channel - b[index]) <= tolerance);

const KEYWORD = /^(?:transparent|currentColor|inherit|initial)$/i;

/** How strongly a palette source suits a token by name: `--border-subtle` wants `--border`, `--sidebar-icon` wants a sidebar colour. */
const affinity = (token, source) =>
{
    const t = token.slice(2);
    const s = source.slice(2);

    if (t.startsWith(`${s}-`)) return 3 + s.length / 100;
    if (s.split("-")[0] === t.split("-")[0]) return 2;

    return ["background", "foreground", "border", "input", "ring", "muted", "secondary", "primary"].includes(s) ? 1 : 0;
};

/** Every formula over the palette that paints exactly `target` in this scope. */
const matches = async (target, palette, pixelOf) =>
{
    const keys = Object.keys(palette).filter((key) => SOURCES.has(key));
    const found = [];

    for (const key of keys)
    {
        const source = pixelOf[key];

        if (!source || source[3] === 0) continue;

        if (source.every((channel, index) => channel === target[index])) found.push({ source: key, percent: 100, formula: `var(${key})` });
        if (target[3] === 0 || target[3] >= source[3] && target[3] !== source[3]) continue;

        // Low alpha rounds the unpremultiplied channels coarsely: prefilter loosely, then let the browser decide.
        const tolerance = Math.ceil((255 * 1.5) / target[3]);

        if (!near(source.slice(0, 3), target.slice(0, 3), tolerance)) continue;

        const ratio = (target[3] / source[3]) * 100;
        const percents = [...new Set([Math.round(ratio), Math.floor(ratio), Math.ceil(ratio), Math.round(ratio * 10) / 10])].filter((value) => value > 0 && value < 100);
        const formulas = percents.map((percent) => `color-mix(in oklab, var(${key}) ${percent}%, transparent)`);
        const painted = await paint(formulas, palette);

        painted.forEach((pixel, index) =>
        {
            if (same(pixel, target)) found.push({ source: key, percent: percents[index], formula: formulas[index] });
        });
    }

    if (found.length === 0 && target[3] === 255)
    {
        const opaque = keys.filter((key) => pixelOf[key]?.[3] === 255);
        const formulas = [];

        for (const p of opaque) for (const q of opaque) if (p !== q) for (let percent = 1; percent < 100; percent += 1) formulas.push({ source: p, other: q, percent, formula: `color-mix(in oklab, var(${p}) ${percent}%, var(${q}))` });

        for (let start = 0; start < formulas.length; start += 4000)
        {
            const chunk = formulas.slice(start, start + 4000);
            const painted = await paint(chunk.map((entry) => entry.formula), palette);

            painted.forEach((pixel, index) =>
            {
                if (same(pixel, target)) found.push(chunk[index]);
            });
        }
    }

    return found;
};

const pick = (token, candidates) => [...candidates].sort((a, b) =>
    affinity(token, b.source) + (b.other ? affinity(token, b.other) / 10 - 0.5 : 0) - (affinity(token, a.source) + (a.other ? affinity(token, a.other) / 10 - 0.5 : 0))
    || Number.isInteger(b.percent) - Number.isInteger(a.percent))[0];

const report = {};

for (const name of targets)
{
    const root = name === "foundation" ? foundationRoot : systemRoot(name);
    const tokens = [...readTokens(styleFiles(root).theme), ...readTokens(styleFiles(root).colors)];
    const scopes = {};

    for (const scope of [":root", ".dark"])
    {
        const rows = tokens.filter((row) => row.scope === scope);
        const declared = Object.fromEntries(rows.filter((row) => PALETTE.includes(row.name.slice(2))).map((row) => [row.name, row.value]));
        // A palette colour may be written as an alias (`--tag-blue-fg: var(--foreground)`). Resolve those
        // to the literal they stand for before painting, so every source is a colour the canvas can read.
        const palette = Object.fromEntries(Object.entries(declared).map(([name, value]) => [name, resolveAlias(declared, value)]));
        const keys = Object.keys(palette);
        const pixels = await paint(keys.map((key) => palette[key]));
        const pixelOf = Object.fromEntries(keys.map((key, index) => [key, pixels[index]]));
        const literals = rows.filter((row) => !PALETTE.includes(row.name.slice(2)) && LITERAL.test(row.value));
        const literalPixels = await paint(literals.map((row) => row.value));
        const found = {};

        for (const [index, row] of literals.entries())
        {
            if (KEYWORD.test(row.value)) found[row.name] = { row, kind: "keyword" };
            else found[row.name] = { row, pixel: literalPixels[index], candidates: await matches(literalPixels[index], palette, pixelOf) };
        }

        scopes[scope] = { palette, found, missingPalette: PALETTE.filter((key) => !(`--${key}` in palette)) };
    }

    // One formula for both modes when one exists; otherwise the best per mode; nothing paints it → a constant
    // (pure black/white at some alpha) or an identity candidate.
    const names = [...new Set([...Object.keys(scopes[":root"].found), ...Object.keys(scopes[".dark"].found)])];
    const rows = names.map((token) =>
    {
        const light = scopes[":root"].found[token];
        const dark = scopes[".dark"].found[token];
        const row = { token, light: light?.row.value, dark: dark?.row.value };

        if (light?.kind === "keyword" && (!dark || dark.kind === "keyword")) return { ...row, kind: "keyword" };

        const shared = (light?.candidates ?? []).filter((a) => (dark?.candidates ?? []).some((b) => b.formula === a.formula));
        const constant = (entry) => entry?.pixel && entry.pixel.slice(0, 3).every((channel) => channel === 0 || channel === 255) && new Set(entry.pixel.slice(0, 3)).size === 1;

        if (shared.length > 0) return { ...row, kind: "derived", formula: pick(token, shared).formula };

        const lightPick = light?.candidates?.length ? pick(token, light.candidates) : null;
        const darkPick = dark?.candidates?.length ? pick(token, dark.candidates) : null;

        if ((lightPick || light?.kind === "keyword" || !light) && (darkPick || dark?.kind === "keyword" || !dark))
        {
            return { ...row, kind: "derived-per-mode", lightFormula: lightPick?.formula ?? light?.row.value, darkFormula: darkPick?.formula ?? dark?.row.value };
        }

        if ((constant(light) || !light || lightPick) && (constant(dark) || !dark || darkPick)) return { ...row, kind: "constant", lightFormula: lightPick?.formula, darkFormula: darkPick?.formula };

        return { ...row, kind: "identity?", lightFormula: lightPick?.formula, darkFormula: darkPick?.formula };
    });

    report[name] = { missingPalette: { light: scopes[":root"].missingPalette, dark: scopes[".dark"].missingPalette }, rows };

    const tally = rows.reduce((counts, row) => ({ ...counts, [row.kind]: (counts[row.kind] ?? 0) + 1 }), {});

    console.log(`${name}: ${Object.entries(tally).map(([kind, count]) => `${kind} ${count}`).join(" · ")}`);
}

await browser.close();

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "classify.json"), `${JSON.stringify(report, null, 2)}\n`);

const markdown = Object.entries(report).map(([name, data]) => [
    `## ${name}`,
    data.missingPalette.light.length || data.missingPalette.dark.length ? `missing palette — light: ${data.missingPalette.light.join(", ")} · dark: ${data.missingPalette.dark.join(", ")}` : "",
    "| token | light | dark | kind | formula |",
    "|---|---|---|---|---|",
    ...data.rows.map((row) => `| ${row.token} | \`${row.light ?? ""}\` | \`${row.dark ?? ""}\` | ${row.kind} | ${row.formula ? `\`${row.formula}\`` : [row.lightFormula, row.darkFormula].filter(Boolean).map((f) => `\`${f}\``).join(" / ")} |`),
].join("\n")).join("\n\n");

writeFileSync(join(outDir, "classify.md"), `${markdown}\n`);
console.log(`wrote ${join("tooling/theme/out", "classify.json")} and classify.md`);
