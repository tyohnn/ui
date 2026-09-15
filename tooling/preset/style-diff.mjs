// style-diff — utility-level difference between two shadcn style files.
//
// Usage: node tooling/preset/style-diff.mjs <from> <to> [--only cn-button,cn-card] [--json]
//        <from>/<to> are preset names (mira, vega …) read from the cached shadcn checkout
//        (tooling/preset/.cache/ui-<version>, filled by make-reference.mjs) or paths to style-*.css files.
//
// shadcn's apps/v4/registry/styles/style-<name>.css is a list of `.cn-* { @apply …; }` rules. foundation
// ports mira, so porting a preset means porting the utilities that differ from mira. This prints, per
// `cn-*` selector, the utilities only <from> has (-) and only <to> has (+), so the diff is read per hook
// instead of per text line. Nothing from the sources is printed beyond those utility names.

import { existsSync, readFileSync } from "node:fs";

import { shadcnCheckout } from "./shared.mjs";

const args = process.argv.slice(2);
const positional = args.filter((arg, index) => !arg.startsWith("--") && args[index - 1] !== "--only");
const only = args.includes("--only") ? new Set(args[args.indexOf("--only") + 1].split(",")) : null;
const json = args.includes("--json");

if (positional.length !== 2)
{
    console.error("usage: node tooling/preset/style-diff.mjs <from> <to> [--only cn-a,cn-b] [--json]");
    process.exit(2);
}

const resolve = (value) =>
{
    if (existsSync(value)) return value;

    return `${shadcnCheckout()}/apps/v4/registry/styles/style-${value}.css`;
};

/** selector → Set of utilities */
export const parseStyle = (file) =>
{
    const source = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const rules = new Map();

    for (const match of source.matchAll(/([^{};]+)\{\s*@apply\s+([^;]*);\s*\}/g))
    {
        const selector = match[1].trim();
        const utilities = match[2].trim().split(/\s+/).filter(Boolean);

        rules.set(selector, new Set([...(rules.get(selector) ?? []), ...utilities]));
    }

    return rules;
};

const from = parseStyle(resolve(positional[0]));
const to = parseStyle(resolve(positional[1]));
const selectors = [...new Set([...from.keys(), ...to.keys()])].filter((selector) => !only || only.has(selector));
const rows = [];

for (const selector of selectors)
{
    const a = from.get(selector) ?? new Set();
    const b = to.get(selector) ?? new Set();
    const removed = [...a].filter((utility) => !b.has(utility));
    const added = [...b].filter((utility) => !a.has(utility));

    if (removed.length || added.length) rows.push({ selector, removed, added, onlyIn: !from.has(selector) ? "to" : !to.has(selector) ? "from" : null });
}

if (json)
{
    console.log(JSON.stringify(rows, null, 2));
}
else
{
    for (const row of rows)
    {
        console.log(`${row.selector}${row.onlyIn ? ` (only in ${row.onlyIn === "to" ? positional[1] : positional[0]})` : ""}`);
        if (row.removed.length) console.log(`  - ${row.removed.join(" ")}`);
        if (row.added.length) console.log(`  + ${row.added.join(" ")}`);
    }

    console.error(`${rows.length} selectors differ (${positional[0]} → ${positional[1]}, ${from.size} → ${to.size} rules)`);
}
