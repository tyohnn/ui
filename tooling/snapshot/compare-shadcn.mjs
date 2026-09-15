// compare-shadcn — a tyohnn system against the real shadcn preset it ports.
//
// Renders the component sheet twice: in the shadcn reference app (tooling/preset/make-reference.mjs,
// same Specimen markup over the shadcn components) and in the tyohnn preview started for the system.
// Both pages use the same viewport, colour scheme and `dark` class on <html>.
//
// Pairing: elements are paired by `data-slot` and order, not by document index, so a component whose
// DOM differs inside (an extra wrapper) only shifts its own children:
//   - an element with data-slot="x" is `x#n`, the n-th element with that slot on the page;
//   - an element without a slot is `<nearest slotted ancestor key>>tag#m`, the m-th element with that
//     tag under that ancestor (the specimen root is `root`).
// Each pair compares the computed properties of tooling/snapshot/props.mjs plus the box height. An
// <svg> compares by its box only and nothing inside it is walked (icon glyphs are not the system's).
//
// Text: Korean strings on the tyohnn page are swapped for the English of tooling/preset/specimen-text.json
// before measuring (the reference Specimen copy was written with the same map). Hangul left on either
// page fails the run.
//
// Exclusions: registry/systems/<system>/reference/compare-exclusions.json (or --exclusions <file>):
//   [{ "key": "<regex on the pair key>", "props": ["prop", …] | "*", "reason": "…" }]
// Matching mismatches are reported as excluded, with their reason, and do not count.
//
// Usage:
//   node tooling/snapshot/compare-shadcn.mjs --system vega [--mode light|dark] [--reference http://localhost:3100]
//        [--preview http://localhost:5173] [--states open|closed] [--shots dir] [--out file.json] [--exclusions file] [--max-shots 40]
//
// Open states (default; --states closed skips them): the Specimen's second select, its dropdown menu and
// its dialog are opened on both pages in turn and their popups (portalled outside the sheet) are measured
// under keys prefixed `select:` · `dropdown:` · `dialog:`. Each popup is also saved as <state>.<side>.png.
//
// Output: pairs, unpaired keys, mismatch count, a table grouped by component and property, and the
// paths of cropped screenshots of both sides for the first mismatching sheet element of each component.
// Exit 0 when nothing but exclusions remain.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

import { measureSheet, STATES } from "./collect.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const arg = (name, fallback) =>
{
    const index = process.argv.indexOf(`--${name}`);

    return index === -1 ? fallback : process.argv[index + 1];
};

const system = arg("system");
const mode = arg("mode", "light") === "dark" ? "dark" : "light";
const referenceUrl = arg("reference", "http://localhost:3100");
const previewUrl = `${arg("preview", "http://localhost:5173")}/?system=${encodeURIComponent(system ?? "")}&mode=${mode}`;
const shots = arg("shots", join(repoRoot, "tooling/snapshot/out", `shadcn-${system}-${mode}`));
const out = arg("out", join(shots, "result.json"));
const maxShots = Number(arg("max-shots", "40"));
const states = arg("states", "open") !== "closed";
const exclusionsFile = arg("exclusions", join(repoRoot, "registry/systems", system ?? "", "reference/compare-exclusions.json"));

if (!system)
{
    console.error("usage: compare-shadcn.mjs --system <name> [--mode light|dark] [--reference url] [--preview origin] [--shots dir] [--out file] [--exclusions file]");
    process.exit(2);
}

const { strings } = JSON.parse(readFileSync(join(repoRoot, "tooling/preset/specimen-text.json"), "utf8"));
const exclusions = existsSync(exclusionsFile)
    ? JSON.parse(readFileSync(exclusionsFile, "utf8")).map((rule) => ({ ...rule, pattern: new RegExp(rule.key) }))
    : [];

mkdirSync(shots, { recursive: true });

const browser = await chromium.launch();
const reference = await measureSheet(browser, { url: referenceUrl, mode, states: states ? STATES : [], shots, side: "shadcn" });
const tyohnn = await measureSheet(browser, { url: previewUrl, mode, states: states ? STATES : [], shots, side: "tyohnn", swap: strings });

if (reference.hangul.length || tyohnn.hangul.length)
{
    console.error(`Hangul on the page (add it to tooling/preset/specimen-text.json): shadcn ${JSON.stringify(reference.hangul)} · tyohnn ${JSON.stringify(tyohnn.hangul)}`);
    await browser.close();
    process.exit(2);
}

const byKey = (rows) => new Map(rows.map((row) => [row.key, row]));
const a = byKey(reference.rows);
const b = byKey(tyohnn.rows);
const onlyReference = [...a.keys()].filter((key) => !b.has(key));
const onlyTyohnn = [...b.keys()].filter((key) => !a.has(key));
const mismatches = [];
const excluded = [];
let pairs = 0;

const classify = (row) =>
{
    const rule = exclusions.find((candidate) => candidate.pattern.test(row.key) && (candidate.props === "*" || candidate.props.includes(row.prop)));

    if (rule) excluded.push({ ...row, reason: rule.reason });
    else mismatches.push(row);
};

// An element only one side has is a mismatch of its own (prop "(unpaired)"), unless excluded.
onlyReference.forEach((key) => classify({ key, component: a.get(key).component, prop: "(unpaired)", shadcn: a.get(key).tag, tyohnn: "(none)", text: a.get(key).text }));
onlyTyohnn.forEach((key) => classify({ key, component: b.get(key).component, prop: "(unpaired)", shadcn: "(none)", tyohnn: b.get(key).tag, text: b.get(key).text }));

for (const [key, left] of a)
{
    const right = b.get(key);

    if (!right) continue;
    pairs += 1;

    if (left.tag !== right.tag)
    {
        classify({ key, component: left.component, prop: "tag", shadcn: left.tag, tyohnn: right.tag, text: left.text });
        continue;
    }

    for (const prop of new Set([...Object.keys(left.values), ...Object.keys(right.values)]))
    {
        if (left.values[prop] === right.values[prop]) continue;

        classify({ key, component: left.component, prop, shadcn: left.values[prop] ?? "(none)", tyohnn: right.values[prop] ?? "(none)", text: left.text });
    }
}

// Group by component, then property
const groups = new Map();

for (const row of mismatches)
{
    const group = groups.get(row.component) ?? new Map();
    const list = group.get(row.prop) ?? [];

    list.push(row);
    group.set(row.prop, list);
    groups.set(row.component, group);
}

const shotsTaken = [];

for (const [component, group] of groups)
{
    if (shotsTaken.length >= maxShots) break;

    const key = [...group.values()][0][0].key;
    const safe = key.replace(/[^a-z0-9#-]+/gi, "_").replace(/#/g, "-");
    const left = await reference.shot(key, join(shots, `${safe}.shadcn.png`));
    const right = await tyohnn.shot(key, join(shots, `${safe}.tyohnn.png`));

    shotsTaken.push({ component, key, shadcn: left, tyohnn: right });
}

await reference.close();
await tyohnn.close();
await browser.close();

const result = {
    system,
    mode,
    reference: referenceUrl,
    preview: previewUrl,
    elements: { shadcn: reference.rows.length, tyohnn: tyohnn.rows.length },
    pairs,
    unpaired: { shadcn: onlyReference, tyohnn: onlyTyohnn },
    mismatches,
    excluded,
    shots: shotsTaken,
};

writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);

const clip = (value) => String(value).replace(/\|/g, "\\|").slice(0, 70);

console.log(`${system} vs shadcn (${mode}): elements shadcn=${reference.rows.length} tyohnn=${tyohnn.rows.length} · pairs ${pairs} · unpaired ${onlyReference.length}/${onlyTyohnn.length} · mismatches ${mismatches.length} · excluded ${excluded.length}`);

if (mismatches.length)
{
    console.log("\n| component | property | count | first key | shadcn | tyohnn |\n|---|---|---|---|---|---|");

    for (const [component, group] of groups)
    {
        for (const [prop, list] of group)
        {
            console.log(`| ${component} | ${prop} | ${list.length} | ${list[0].key} | ${clip(list[0].shadcn)} | ${clip(list[0].tyohnn)} |`);
        }
    }
}

if (onlyReference.length || onlyTyohnn.length)
{
    console.log(`\nunpaired shadcn: ${onlyReference.slice(0, 15).join(", ")}${onlyReference.length > 15 ? " …" : ""}`);
    console.log(`unpaired tyohnn: ${onlyTyohnn.slice(0, 15).join(", ")}${onlyTyohnn.length > 15 ? " …" : ""}`);
}

if (excluded.length)
{
    const reasons = new Map();

    excluded.forEach((row) => reasons.set(row.reason, (reasons.get(row.reason) ?? 0) + 1));
    console.log("\nexcluded:");
    reasons.forEach((count, reason) => console.log(`  ${count} × ${reason}`));
}

if (shotsTaken.length) console.log(`\nshots: ${shots} (${shotsTaken.length} components, <key>.shadcn.png / <key>.tyohnn.png)`);
console.log(`result: ${out}`);

process.exit(mismatches.length === 0 ? 0 : 1);
