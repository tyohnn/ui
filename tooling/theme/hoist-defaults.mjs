// hoist-defaults — stop the slot union: move a slot's default out of layer 1 and into the rule that
// reads it.
//
//   node tooling/theme/hoist-defaults.mjs [--dry]
//
// A slot exists because ONE system wants a different look there. Until now every other system still had
// to declare it — `scan-tokens` fails a system that lacks a token foundation defines — so one system's
// idea cost 10 lines of filler in the others, twice (`:root` and `.dark`), for ever.
//
// The fix is the escape hatch layer 3 already uses for shapes (`var(--button-shape-radius,
// var(--control-radius))`): the reader carries the default.
//
//   3층  .cn-sidebar-menu-button { border-color: var(--sidebar-item-border, var(--border)); }
//   1층  nothing — until a system wants its own edge, and then it declares that one line.
//
// A slot qualifies when foundation gives it the same value in both modes (a fallback cannot vary by
// mode) and it is not a palette colour. Two kinds never qualify, both found by rendering the result:
//   · a CSS-wide keyword default (`initial`). `var(--x)` on a custom property set to `initial` is
//     guaranteed-invalid, so the property inherits; `var(--x, initial)` sets the property's initial
//     value instead — black text where the dialog's close button used to inherit the foreground.
//   · a slot read through Tailwind's `text-(color:--x)` shorthand, which has nowhere to put a fallback.
// Every other read, in every layer and every system copy, gets the fallback; every system that agrees
// with foundation loses the declaration.

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { foundationRoot, listSystems, readTokens, styleFiles, systemRoot } from "@tyohnn/build-system/registry";
import { PALETTE } from "@tyohnn/theme";

const dry = process.argv.includes("--dry");
const palette = new Set(PALETTE.map((name) => `--${name}`));
const roots = [foundationRoot, ...listSystems().map(systemRoot)];

const layerOne = (root) =>
{
    const rows = readTokens(styleFiles(root).colors);
    const scope = (selector) => Object.fromEntries(rows.filter((row) => row.scope === selector).map((row) => [row.name, row.value]));

    return { light: scope(":root"), dark: scope(".dark") };
};

const cssFiles = (root) =>
{
    const styles = join(root, "styles");
    const walk = (dir) => readdirSync(dir).flatMap((entry) =>
        statSync(join(dir, entry)).isDirectory() ? walk(join(dir, entry)) : entry.endsWith(".css") ? [join(dir, entry)] : []);

    return walk(styles);
};

const foundation = layerOne(foundationRoot);
const KEYWORD = /^(?:initial|inherit|unset|revert)$/;
const shorthandReads = new Set();

for (const root of [foundationRoot, ...listSystems().map(systemRoot)])
{
    for (const file of cssFiles(root))
    {
        for (const found of readFileSync(file, "utf8").matchAll(/\((?:color|length|[a-z-]+):(--[A-Za-z0-9_-]+)\)/g)) shorthandReads.add(found[1]);
    }
}

const defaults = Object.fromEntries(Object.entries(foundation.light)
    .filter(([name, value]) => !palette.has(name) && foundation.dark[name] === value && !KEYWORD.test(value.trim()) && !shorthandReads.has(name))
    .map(([name, value]) => [name, value]));

// A fallback is written into the rule; a slot whose default reads another hoisted slot would nest for
// ever, so those keep their declaration.
for (const [name, value] of Object.entries(defaults))
{
    if (Object.keys(defaults).some((other) => other !== name && value.includes(`var(${other})`))) delete defaults[name];
}

let reads = 0;
let dropped = 0;

for (const root of roots)
{

    for (const file of cssFiles(root))
    {
        const isTheme = file.endsWith("theme.css");

        if (isTheme) continue;

        const before = readFileSync(file, "utf8");
        const isGlobals = file === styleFiles(root).colors;

        // Decide what to drop from the original text, before any rewriting changes it.
        const drop = new Set();

        if (isGlobals)
        {
            // A custom property declared in `:root` alone still applies in dark, so a token is dropped
            // only when BOTH scopes repeat the default. Dropping one scope silently gives dark the
            // light value (luma's dialog ring, found by rendering).
            const lines = before.split("\n");
            const seen = new Map();

            lines.forEach((line, index) =>
            {
                const found = /^\s*(--[A-Za-z0-9_-]+)\s*:\s*([^;]*);/.exec(line);

                if (found && found[1] in defaults) seen.set(found[1], [...(seen.get(found[1]) ?? []), { index, value: found[2].trim() }]);
            });

            for (const [name, rows] of seen)
            {
                if (rows.length !== 2 || !rows.every((row) => row.value === defaults[name])) continue;

                rows.forEach((row) => drop.add(row.index));
            }
        }

        let text = before;

        // 1. every read carries the default
        for (const [name, value] of Object.entries(defaults))
        {
            text = text.replaceAll(`var(${name})`, () => { reads += 1; return `var(${name}, ${value})`; });
        }

        // 2. a declaration that only repeats the default goes away
        if (drop.size > 0)
        {
            text = text.split("\n").filter((line, index) => !drop.has(index)).join("\n");
            dropped += drop.size;
        }

        if (text !== before && !dry) writeFileSync(file, text);
    }
}

console.log(`${Object.keys(defaults).length} slots hoisted · ${reads} reads given a fallback · ${dropped} declarations dropped${dry ? " (dry run)" : ""}`);
