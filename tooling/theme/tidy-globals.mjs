// tidy-globals — after a pass that deletes declarations, drop the comments left with nothing to say and
// collapse the blank runs.
//
//   node tooling/theme/tidy-globals.mjs [--dry] [name…]
//
// A comment inside `:root` or `.dark` earns its place by introducing a declaration. When the run it
// introduced is gone — the palette moved to theme.css, a slot default moved into layer 3 — the comment
// becomes a note about nothing. Section headers (a comment followed by a blank line and then
// declarations) are kept.

import { readFileSync, writeFileSync } from "node:fs";

import { foundationRoot, listSystems, styleFiles, systemRoot } from "@tyohnn/build-system/registry";

const dry = process.argv.includes("--dry");
const names = process.argv.slice(2).filter((value) => !value.startsWith("--"));
const targets = names.length > 0 ? names : ["foundation", ...listSystems()];

const DECLARATION = /^\s*--[A-Za-z0-9_-]+\s*:/;

for (const name of targets)
{
    const path = styleFiles(name === "foundation" ? foundationRoot : systemRoot(name)).colors;
    const lines = readFileSync(path, "utf8").split("\n");
    const drop = new Set();

    let scope = null;
    let depth = 0;
    let index = 0;

    while (index < lines.length)
    {
        const opening = /^([.:][A-Za-z-]+)\s*\{/.exec(lines[index]);

        if (depth === 0 && opening) { scope = opening[1]; depth = 1; index += 1; continue; }
        if (depth > 0)
        {
            depth += (lines[index].match(/\{/g) ?? []).length - (lines[index].match(/\}/g) ?? []).length;
            if (depth <= 0) { scope = null; depth = 0; index += 1; continue; }
        }

        if ((scope !== ":root" && scope !== ".dark") || !/^\s*\/\*/.test(lines[index])) { index += 1; continue; }

        let end = index;

        while (end < lines.length && !lines[end].includes("*/")) end += 1;

        // What follows: a declaration means the comment still introduces something; another comment, a
        // blank line or the end of the block means it does not — a header keeps the blank line.
        const next = lines[end + 1] ?? "";
        const isHeader = next.trim() === "" && DECLARATION.test(lines[end + 2] ?? "");

        if (!DECLARATION.test(next) && !isHeader)
        {
            for (let line = index; line <= end; line += 1) drop.add(line);
        }

        index = end + 1;
    }

    const out = [];

    lines.forEach((line, position) =>
    {
        if (drop.has(position)) return;
        if (line.trim() === "" && out.at(-1)?.trim() === "") return;

        out.push(line);
    });

    const text = out.join("\n").replace(/\{\n\n/g, "{\n").replace(/\n\n(\s*\})/g, "\n$1");

    if (!dry) writeFileSync(path, text);
    console.log(`${name}: ${drop.size} comment lines dropped · ${lines.length} → ${out.length} lines`);
}
