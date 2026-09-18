// rewrite-globals — move the palette out of layer 1's hand-written file and turn the colours it
// derives into formulas.
//
//   node tooling/theme/rewrite-globals.mjs [--dry] [name…]
//
// Two edits per system, both driven by tooling/theme/out/classify.json (run classify.mjs first):
//   1. a palette colour is deleted — styles/theme.css declares it now;
//   2. a colour the classifier proved is the palette at some alpha is rewritten as that formula, so it
//      follows the theme instead of standing still (`--primary-soft: oklch(0.205 0 0 / 5%)` becomes
//      `color-mix(in oklab, var(--primary) 5%, transparent)`, the same pixel).
// Everything else — identity colours, constants, sizes, fonts, the `@theme` blocks — is left alone, and
// a comment is dropped only when every declaration it introduces is dropped with it.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { foundationRoot, listSystems, repoRoot, styleFiles, systemRoot } from "@tyohnn/build-system/registry";
import { PALETTE } from "@tyohnn/theme";

const dry = process.argv.includes("--dry");
const names = process.argv.slice(2).filter((value) => !value.startsWith("--"));
const targets = names.length > 0 ? names : ["foundation", ...listSystems()];
const report = JSON.parse(readFileSync(join(repoRoot, "tooling/theme/out/classify.json"), "utf8"));
const palette = new Set(PALETTE.map((name) => `--${name}`));

const DECLARATION = /^(\s*)(--[A-Za-z0-9_-]+)\s*:\s*([^;]*);(.*)$/;

// Material tints stay literal. They are the system's own stuff — layer 2 composes them into shadows and
// surfaces — and writing them as a step off the palette would tie a system's material to a theme's colour.
const MATERIAL = /^--clay-/;

/** The formula for a token in one scope, or null to leave the line alone. */
const formulaFor = (row, scope) =>
{
    if (!row) return null;
    if (row.kind === "derived") return row.formula;
    if (row.kind === "derived-per-mode") return scope === ":root" ? row.lightFormula : row.darkFormula;

    return null;
};

for (const name of targets)
{
    const path = styleFiles(name === "foundation" ? foundationRoot : systemRoot(name)).colors;
    const rows = new Map((report[name]?.rows ?? []).map((row) => [row.token, row]));
    const lines = readFileSync(path, "utf8").split("\n");
    const drop = new Set();
    const counts = { deleted: 0, rewritten: 0, comments: 0 };

    let scope = null;
    let depth = 0;

    // 1. declarations
    lines.forEach((line, index) =>
    {
        const opening = /^([.:][A-Za-z-]+)\s*\{/.exec(line);

        if (depth === 0 && opening) { scope = opening[1]; depth = 1; return; }
        if (depth > 0)
        {
            depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
            if (depth <= 0) { scope = null; depth = 0; return; }
        }

        if (scope !== ":root" && scope !== ".dark") return;

        const found = DECLARATION.exec(line);

        if (!found) return;

        const [, indent, token, value, rest] = found;

        if (palette.has(token)) { drop.add(index); counts.deleted += 1; return; }

        const formula = MATERIAL.test(token) ? null : formulaFor(rows.get(token), scope);

        if (formula && formula !== value)
        {
            lines[index] = `${indent}${token}: ${formula};${rest}`;
            counts.rewritten += 1;
        }
    });

    // 2. comments that only introduced dropped declarations
    const isComment = (line) => /^\s*(\/\*|\*|[^/*\s].*\*\/\s*$)/.test(line.trim() ? line : "x") && /^\s*(\/\*|\*)/.test(line);
    let index = 0;

    while (index < lines.length)
    {
        if (!/^\s*\/\*/.test(lines[index])) { index += 1; continue; }

        let end = index;

        while (end < lines.length && !lines[end].includes("*/")) end += 1;

        let cursor = end + 1;
        let introduced = 0;
        let kept = 0;

        while (cursor < lines.length && lines[cursor].trim() !== "" && !/^\s*\/\*/.test(lines[cursor]) && !/^\s*\}/.test(lines[cursor]))
        {
            if (DECLARATION.test(lines[cursor])) { introduced += 1; if (!drop.has(cursor)) kept += 1; }
            cursor += 1;
        }

        if (introduced > 0 && kept === 0)
        {
            for (let line = index; line <= end; line += 1) drop.add(line);
            counts.comments += 1;
        }

        index = end + 1;
    }

    // 3. write, collapsing the blank runs the deletions leave behind
    const out = [];

    lines.forEach((line, position) =>
    {
        if (drop.has(position)) return;
        if (line.trim() === "" && out.at(-1)?.trim() === "") return;

        out.push(line);
    });

    const text = out.join("\n").replace(/\{\n\n/g, "{\n").replace(/\n\n(\s*\})/g, "\n$1");

    if (!dry) writeFileSync(path, text);
    console.log(`${name}: ${counts.deleted} palette declarations deleted · ${counts.rewritten} rewritten as formulas · ${counts.comments} comment blocks dropped · ${lines.length} → ${out.length} lines`);
}
