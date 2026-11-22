// role-steps — axis contract 7: give foundation and every system the role steps, and point the
// component slots that hold the same value at them.
//
// Usage: node tooling/role-steps [--check]
//
// registry/foundation/reference/roles.md is the table this follows. For foundation and each system:
//   1. every role step in STEPS that the file lacks is added on the line above its first source slot,
//      with that slot's current value (so the system's own feel becomes the role's value);
//   2. every slot listed for a step whose resolved value equals the step's resolved value becomes
//      `var(--<step>)`; a slot that differs keeps its value (the system tuned it on purpose).
// Nothing resolves differently afterwards. The script checks that itself: it resolves every :root token
// of globals.css + tokens.css before and after and fails on any difference. --check edits nothing.
// It only reads :root; check-modes.mjs compares light and dark against a git ref after the run.

import { readFileSync, writeFileSync } from "node:fs";
import { relative } from "node:path";

import { foundationRoot, listSystems, readTokens, repoRoot, styleFiles, systemRoot } from "@tyohnn/build-system/registry";

/** Role step → the component slots that become its aliases. The first slot is the source of the value. */
const STEPS = [
    ["--item-height-sm", ["--menu-item-height", "--sidebar-sub-item-height"]],
    ["--item-height-md", ["--sidebar-item-height", "--table-head-height-compact"]],
    ["--item-height-lg", ["--table-head-height-default"]],
    ["--item-radius", ["--menu-item-radius", "--sidebar-item-radius"]],
    ["--item-padding-x", ["--menu-item-padding-x", "--sidebar-item-padding-x"]],
    ["--item-padding-x-lg", ["--command-item-padding-x"]],
    ["--item-padding-y-sm", ["--menu-item-padding-y", "--table-cell-padding-y-compact"]],
    ["--item-padding-y-lg", ["--table-cell-padding-y-default"]],
    ["--item-gap", ["--menu-item-gap", "--sidebar-item-gap"]],
    ["--item-spacing", ["--sidebar-item-spacing"]],
    ["--popup-shadow-lg", ["--menu-sub-shadow", "--sheet-shadow"]],
    ["--indicator-radius-pill", ["--tag-radius", "--switch-radius"]],
    ["--indicator-radius-sm", ["--kbd-radius"]],
    ["--indicator-size-sm", ["--avatar-size-sm"]],
    ["--indicator-size-md", ["--avatar-size-md"]],
    ["--indicator-size-lg", ["--avatar-size-lg"]],
    ["--indicator-padding-x", ["--kbd-padding-x", "--sidebar-badge-padding-x"]],
    ["--indicator-padding-y", ["--badge-padding-y"]],
    ["--indicator-inset", ["--sidebar-badge-inset-end"]],
    // the indicator that carries text (a badge): roles.css's default indicator reads these
    ["--indicator-height", ["--badge-height"]],
    ["--indicator-radius", ["--badge-radius"]],
    ["--indicator-padding-x-lg", ["--badge-padding-x"]],
    ["--indicator-gap", ["--badge-gap"]],
    ["--indicator-border-width", ["--badge-border-width"]],
    ["--indicator-icon-size", ["--badge-icon-size"]],
    ["--indicator-font-size", ["--badge-font-size"]],
    ["--indicator-line-height", ["--badge-line-height"]],
    ["--indicator-font-weight", ["--badge-font-weight"]],
    ["--indicator-letter-spacing", ["--badge-letter-spacing"]],
    ["--indicator-text-transform", ["--badge-text-transform"]],
    ["--control-track-padding", ["--tabs-list-padding"]],
    ["--control-nested-padding-x", ["--tabs-trigger-padding-x", "--tabs-line-trigger-padding-x"]],
    ["--control-nested-padding-x-icon", ["--tabs-line-trigger-padding-x-icon"]],
    ["--control-nested-padding-y", ["--tabs-trigger-padding-y"]],
    ["--control-nested-gap", ["--tabs-trigger-gap"]],
    ["--surface-padding-xs", ["--bubble-padding-y"]],
    // roles.css's default surface is the raised plane the card is
    ["--surface-raised-radius", ["--card-radius"]],
    ["--surface-shadow", ["--card-shadow"]],
];

/** Slots that point at the same role token as another role token already, by value: no new step */
const SHARED = [
    ["--control-icon-size-lg", ["--sidebar-item-icon-size", "--sidebar-item-action-icon-size"]],
    ["--control-height-xs", ["--sidebar-item-action-size"]],
    ["--ui-font-weight", ["--sidebar-item-font-weight"]],
];

const check = process.argv.includes("--check");

/** :root tokens of the colour and token files, last declaration wins */
const rootTokens = (files) =>
{
    const map = new Map();

    for (const file of [files.colors, files.tokens])
    {
        for (const row of readTokens(file).filter((candidate) => candidate.scope === ":root"))
        {
            map.set(row.name, row.value);
        }
    }

    return map;
};

/** A value with every var() it can resolve inside `map` substituted, whitespace normalised */
const resolve = (map, value, seen = new Set()) =>
    value
        .replace(/var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,\s*([^()]*(?:\([^()]*\)[^()]*)*))?\)/g, (whole, name, fallback) =>
        {
            if (seen.has(name)) return `<cycle ${name}>`;
            if (map.has(name)) return resolve(map, map.get(name), new Set([...seen, name]));
            return fallback === undefined ? whole : resolve(map, fallback, seen);
        })
        .replace(/\s+/g, " ")
        .trim();

const snapshot = (files) =>
{
    const map = rootTokens(files);
    return new Map([...map.keys()].map((name) => [name, resolve(map, map.get(name))]));
};

/** Last top-level :root declaration of a name in tokens.css, as a 1-based line number */
const lastLine = (rows, name) => rows.filter((row) => row.name === name && row.scope === ":root").at(-1)?.line;

const migrate = (name) =>
{
    const files = styleFiles(systemRoot(name));
    const before = snapshot(files);
    const source = readFileSync(files.tokens, "utf8");
    const lines = source.split("\n");
    const inserts = new Map();
    const report = { added: [], aliased: [], kept: [] };
    let rows = readTokens(files.tokens);
    const has = (token) => rows.some((row) => row.name === token && row.scope === ":root") || before.has(token);

    // 1. role steps the file lacks, above their source slot, with the source's value
    for (const [step, slots] of STEPS)
    {
        if (has(step)) continue;
        const sourceSlot = slots.find((slot) => lastLine(rows, slot));
        if (!sourceSlot) throw new Error(`${name}: no source slot for ${step}`);
        const line = lastLine(rows, sourceSlot);
        const indent = lines[line - 1].match(/^\s*/)[0];
        const value = rows.filter((row) => row.name === sourceSlot && row.scope === ":root").at(-1).value;
        const list = inserts.get(line) ?? [];
        list.push(`${indent}${step}: ${value};`);
        inserts.set(line, list);
        report.added.push(step);
    }

    const withSteps = [];
    lines.forEach((text, index) =>
    {
        for (const added of inserts.get(index + 1) ?? []) withSteps.push(added);
        withSteps.push(text);
    });

    const stepped = withSteps.join("\n");

    // 2. slots whose resolved value equals the step's become its alias
    const working = stepped.split("\n");
    rows = readTokensFromText(files, stepped);
    const map = new Map(rootTokens(files));
    for (const row of rows.filter((candidate) => candidate.scope === ":root")) map.set(row.name, row.value);

    // a step that already exists as an alias of its source slot (`--item-gap: var(--menu-item-gap)`)
    // takes the slot's value, so the slot can turn round and point at the step
    for (const [step, slots] of STEPS)
    {
        const stepLine = lastLine(rows, step);
        if (!stepLine || map.get(step) !== `var(${slots[0]})`) continue;
        const sourceValue = map.get(slots[0]);
        working[stepLine - 1] = working[stepLine - 1].replace(/(:\s*)[^;]+;/, `$1${sourceValue};`);
        map.set(step, sourceValue);
        map.set(slots[0], `var(${step})`);
        const slotLine = lastLine(rows, slots[0]);
        working[slotLine - 1] = working[slotLine - 1].replace(/(:\s*)[^;]+;/, `$1var(${step});`);
        report.aliased.push(slots[0]);
    }

    for (const [step, slots] of [...STEPS, ...SHARED])
    {
        const target = resolve(map, `var(${step})`);

        for (const slot of slots)
        {
            const line = lastLine(rows, slot);
            if (!line) continue;
            const current = rows.filter((row) => row.name === slot && row.scope === ":root").at(-1).value;
            if (current === `var(${step})`) continue;

            // the step's own value must not read the slot, or the alias would be a cycle
            const trial = new Map(map);
            trial.set(slot, `var(${step})`);
            const after = resolve(trial, `var(${slot})`);

            if (resolve(map, `var(${slot})`) === target && !after.includes("<cycle"))
            {
                working[line - 1] = working[line - 1].replace(
                    new RegExp(`(${slot.replace(/[-]/g, "\\-")}\\s*:\\s*)[^;]+;`),
                    `$1var(${step});`,
                );
                map.set(slot, `var(${step})`);
                report.aliased.push(slot);
            }
            else
            {
                report.kept.push(slot);
            }
        }
    }

    const result = working.join("\n");
    const finalMap = new Map(rootTokens(files));
    for (const row of readTokensFromText(files, result).filter((candidate) => candidate.scope === ":root")) finalMap.set(row.name, row.value);
    const after = new Map([...finalMap.keys()].map((token) => [token, resolve(finalMap, finalMap.get(token))]));

    const moved = [...before].filter(([token, value]) => after.get(token) !== value);
    if (moved.length)
    {
        throw new Error(`${name}: values moved\n${moved.map(([token, value]) => `  ${token}: ${value} → ${after.get(token)}`).join("\n")}`);
    }

    if (!check) writeFileSync(files.tokens, result);

    return report;
};

/** readTokens on text that is not on disk yet */
function readTokensFromText(files, text)
{
    const original = readFileSync(files.tokens, "utf8");
    writeFileSync(files.tokens, text);

    try
    {
        return readTokens(files.tokens);
    }
    finally
    {
        writeFileSync(files.tokens, original);
    }
}

for (const name of ["foundation", ...listSystems()])
{
    const report = migrate(name);
    console.log(
        `${relative(repoRoot, systemRoot(name))}: +${report.added.length} steps, ${report.aliased.length} aliased, ${report.kept.length} kept`
            + (report.kept.length ? ` (${report.kept.join(" ")})` : ""),
    );
}

void foundationRoot;
