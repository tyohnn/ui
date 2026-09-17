// compare-shadcn — a tyohnn system against the real shadcn preset it ports.
//
// Renders the same template twice: in the shadcn reference app (tooling/preset/make-reference.mjs, the
// same markup over the shadcn components) and in the tyohnn preview started for the system. Both pages
// use the same viewport, colour scheme and `dark` class on <html>.
//
// Two templates (`--template`):
//   - `coverage` (default) — every registry/ui component, section by section. Each section is opened
//     alone (`?template=coverage&section=<name>`), which renders its popups open, and the section
//     element is measured together with those popups (the portals the section declares), so an open
//     dialog is compared beside its trigger. Reports a per-component coverage table.
//   - `component-sheet` — the Specimen, plus the three open states of collect.mjs.
//
// Pairing: elements are paired by `data-slot` and order, not by document index, so a component whose
// DOM differs inside (an extra wrapper) only shifts its own children:
//   - an element with data-slot="x" is `x#n`, the n-th element with that slot on the page;
//   - an element without a slot is `<nearest slotted ancestor key>>tag#m`, the m-th element with that
//     tag under that ancestor (the root is `root`, or `root0` · `root1` … with several roots).
// In the coverage template every key is read within one section and reported as `<section>/<key>`, so a
// difference in one section never shifts another. Each pair compares the computed properties of
// tooling/snapshot/props.mjs plus the box height. An <svg> compares by its box only and nothing inside
// it is walked (icon glyphs are not the system's).
//
// Text: Korean strings on the tyohnn page are swapped for the English of tooling/preset/specimen-text.json
// before measuring (the reference copy was written with the same map). Hangul left on either page fails
// the run.
//
// Exclusions: registry/systems/<system>/reference/compare-exclusions.json (or --exclusions <file>):
//   [{ "key": "<regex on the pair key>", "props": ["prop", …] | "*", "reason": "…" }]
// Matching mismatches are reported as excluded, with their reason, and do not count.
//
// Usage:
//   node tooling/snapshot/compare-shadcn.mjs --system vega [--template coverage|component-sheet] [--mode light|dark]
//        [--reference http://localhost:3100] [--preview http://localhost:5173] [--sections a,b] [--states open|closed]
//        [--shots dir] [--out file.json] [--exclusions file] [--max-shots 40]
//
// Open states of the component sheet (--states closed skips them): the Specimen's second select, its
// dropdown menu and its dialog are opened on both pages in turn and their popups measured under keys
// prefixed `select:` · `dropdown:` · `dialog:`. Each popup is also saved as <state>.<side>.png.
//
// Output: pairs, unpaired keys, mismatch count, a table grouped by component and property, the coverage
// template's per-component table (slots compared · mismatches, or "no slots" for a component that
// renders no data-slot of its own) and screenshots of both sides where they differ.
// Exit 0 when nothing but exclusions remain.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

import { coveragePage, measureSheet, STATES } from "./collect.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const arg = (name, fallback) =>
{
    const index = process.argv.indexOf(`--${name}`);

    return index === -1 ? fallback : process.argv[index + 1];
};

const system = arg("system");
const template = arg("template", "coverage") === "component-sheet" ? "component-sheet" : "coverage";
const mode = arg("mode", "light") === "dark" ? "dark" : "light";
const referenceOrigin = arg("reference", "http://localhost:3100");
const previewOrigin = arg("preview", "http://localhost:5173");
const only = (arg("sections", "") || "").split(",").map((name) => name.trim()).filter(Boolean);
const shots = arg("shots", join(repoRoot, "tooling/snapshot/out", `shadcn-${system}-${template}-${mode}`));
const out = arg("out", join(shots, "result.json"));
const maxShots = Number(arg("max-shots", "40"));
const states = arg("states", "open") !== "closed";
const exclusionsFile = arg("exclusions", join(repoRoot, "registry/systems", system ?? "", "reference/compare-exclusions.json"));

if (!system)
{
    console.error("usage: compare-shadcn.mjs --system <name> [--template coverage|component-sheet] [--mode light|dark] [--reference url] [--preview origin] [--sections a,b] [--shots dir] [--out file] [--exclusions file]");
    process.exit(2);
}

const { strings } = JSON.parse(readFileSync(join(repoRoot, "tooling/preset/specimen-text.json"), "utf8"));
const exclusions = existsSync(exclusionsFile)
    ? JSON.parse(readFileSync(exclusionsFile, "utf8")).map((rule) => ({ ...rule, pattern: new RegExp(rule.key) }))
    : [];

mkdirSync(shots, { recursive: true });

const mismatches = [];
const excluded = [];
let pairs = 0;

const classify = (row) =>
{
    const rule = exclusions.find((candidate) => candidate.pattern.test(row.key) && (candidate.props === "*" || candidate.props.includes(row.prop)));

    if (rule) excluded.push({ ...row, reason: rule.reason });
    else mismatches.push(row);
};

/**
 * Pairs two sets of rows by key and classifies every difference. `scope` prefixes the reported key (the
 * coverage section) and is not part of the pairing. Returns what this call added.
 */
const compareRows = (referenceRows, tyohnnRows, scope = "") =>
{
    const a = new Map(referenceRows.map((row) => [row.key, row]));
    const b = new Map(tyohnnRows.map((row) => [row.key, row]));
    const before = mismatches.length;
    const onlyReference = [...a.keys()].filter((key) => !b.has(key));
    const onlyTyohnn = [...b.keys()].filter((key) => !a.has(key));
    const at = (key) => `${scope}${key}`;
    let added = 0;

    // An element only one side has is a mismatch of its own (prop "(unpaired)"), unless excluded.
    onlyReference.forEach((key) => classify({ key: at(key), component: a.get(key).component, prop: "(unpaired)", shadcn: a.get(key).tag, tyohnn: "(none)", text: a.get(key).text }));
    onlyTyohnn.forEach((key) => classify({ key: at(key), component: b.get(key).component, prop: "(unpaired)", shadcn: "(none)", tyohnn: b.get(key).tag, text: b.get(key).text }));

    for (const [key, left] of a)
    {
        const right = b.get(key);

        if (!right) continue;
        pairs += 1;
        added += 1;

        if (left.tag !== right.tag)
        {
            classify({ key: at(key), component: left.component, prop: "tag", shadcn: left.tag, tyohnn: right.tag, text: left.text });
            continue;
        }

        for (const prop of new Set([...Object.keys(left.values), ...Object.keys(right.values)]))
        {
            if (left.values[prop] === right.values[prop]) continue;

            classify({ key: at(key), component: left.component, prop, shadcn: left.values[prop] ?? "(none)", tyohnn: right.values[prop] ?? "(none)", text: left.text });
        }
    }

    return { paired: added, unpaired: { shadcn: onlyReference.map(at), tyohnn: onlyTyohnn.map(at) }, mismatched: mismatches.length - before };
};

const browser = await chromium.launch();
const shotsTaken = [];
const unpaired = { shadcn: [], tyohnn: [] };
let elements = { shadcn: 0, tyohnn: 0 };
let coverage = null;
let sectionsCompared = [];

if (template === "component-sheet")
{
    const referenceUrl = referenceOrigin;
    const previewUrl = `${previewOrigin}/?system=${encodeURIComponent(system)}&mode=${mode}&motion=off`;
    const reference = await measureSheet(browser, { url: referenceUrl, mode, states: states ? STATES : [], shots, side: "shadcn" });
    const tyohnn = await measureSheet(browser, { url: previewUrl, mode, states: states ? STATES : [], shots, side: "tyohnn", swap: strings });

    if (reference.hangul.length || tyohnn.hangul.length)
    {
        console.error(`Hangul on the page (add it to tooling/preset/specimen-text.json): shadcn ${JSON.stringify(reference.hangul)} · tyohnn ${JSON.stringify(tyohnn.hangul)}`);
        await browser.close();
        process.exit(2);
    }

    elements = { shadcn: reference.rows.length, tyohnn: tyohnn.rows.length };

    const result = compareRows(reference.rows, tyohnn.rows);

    unpaired.shadcn.push(...result.unpaired.shadcn);
    unpaired.tyohnn.push(...result.unpaired.tyohnn);

    // One cropped pair per component that differs, taken with the page closed again.
    const seen = new Set();

    for (const row of mismatches)
    {
        if (seen.has(row.component) || shotsTaken.length >= maxShots) continue;
        seen.add(row.component);

        const safe = row.key.replace(/[^a-z0-9#-]+/gi, "_").replace(/#/g, "-");

        shotsTaken.push({
            component: row.component,
            key: row.key,
            shadcn: await reference.shot(row.key, join(shots, `${safe}.shadcn.png`)),
            tyohnn: await tyohnn.shot(row.key, join(shots, `${safe}.tyohnn.png`)),
        });
    }

    await reference.close();
    await tyohnn.close();
}
else
{
    const url = (origin, extra) => (section) =>
        `${origin}/?${extra}motion=off&template=coverage${section ? `&section=${encodeURIComponent(section)}` : ""}`;
    const reference = await coveragePage(browser, { url: url(referenceOrigin, ""), mode, side: "shadcn" });
    const tyohnn = await coveragePage(browser, { url: url(previewOrigin, `system=${encodeURIComponent(system)}&mode=${mode}&`), mode, swap: strings, side: "tyohnn" });
    const declared = await reference.sections();
    const mine = await tyohnn.sections();
    const names = (list) => list.map((section) => section.name).join(",");

    if (names(declared) !== names(mine))
    {
        console.error(`The two apps render different coverage sections. Re-run tooling/preset/make-reference.mjs ${system}.\n  shadcn: ${names(declared)}\n  tyohnn: ${names(mine)}`);
        await browser.close();
        process.exit(2);
    }

    // registry/ui component of a data-slot: the longest component name the slot starts with
    // (`dropdown-menu-item` → dropdown-menu, `input-group-addon` → input-group).
    const components = readdirSync(join(repoRoot, "registry/ui/components"))
        .filter((file) => file.endsWith(".tsx")).map((file) => file.replace(/\.tsx$/, ""))
        .sort((a, b) => b.length - a.length);
    const stats = new Map(components.map((name) => [name, { compared: 0, mismatches: 0, sections: new Set(), declaredIn: new Set() }]));
    const componentOf = (slot, section) =>
    {
        if (!slot || slot === "(layout)") return null;

        return components.find((name) => slot === name || slot.startsWith(`${name}-`))
            ?? (section.components.length === 1 ? section.components[0] : null);
    };

    const sections = only.length ? declared.filter((section) => only.includes(section.name)) : declared;
    const hangul = [];

    for (const section of sections)
    {
        section.components.forEach((name) => stats.get(name)?.declaredIn.add(section.name));

        const left = await reference.measure(section);
        const right = await tyohnn.measure(section);

        hangul.push(...left.hangul, ...right.hangul);
        elements = { shadcn: elements.shadcn + left.rows.length, tyohnn: elements.tyohnn + right.rows.length };

        const before = mismatches.length;
        const result = compareRows(left.rows, right.rows, `${section.name}/`);

        unpaired.shadcn.push(...result.unpaired.shadcn);
        unpaired.tyohnn.push(...result.unpaired.tyohnn);

        for (const row of left.rows)
        {
            const name = componentOf(row.component, section);

            if (!name) continue;
            const entry = stats.get(name);

            entry.compared += 1;
            entry.sections.add(section.name);
        }

        for (const row of mismatches.slice(before))
        {
            const name = componentOf(row.component, section);

            if (name) stats.get(name).mismatches += 1;
        }

        sectionsCompared.push({ name: section.name, components: section.components, pairs: result.paired, mismatches: result.mismatched });

        if (result.mismatched && shotsTaken.length < maxShots)
        {
            shotsTaken.push({
                component: section.name,
                key: `${section.name}/`,
                shadcn: await reference.shot(join(shots, `${section.name}.shadcn.png`)),
                tyohnn: await tyohnn.shot(join(shots, `${section.name}.tyohnn.png`)),
            });
        }
    }

    if (hangul.length)
    {
        console.error(`Hangul on the page (add it to tooling/preset/specimen-text.json): ${JSON.stringify([...new Set(hangul)])}`);
        await browser.close();
        process.exit(2);
    }

    coverage = components.slice().sort().map((name) => ({
        component: name,
        rendered: stats.get(name).declaredIn.size > 0,
        compared: stats.get(name).compared,
        mismatches: stats.get(name).mismatches,
        sections: [...stats.get(name).sections].sort(),
        declaredIn: [...stats.get(name).declaredIn].sort(),
    }));

    await reference.close();
    await tyohnn.close();
}

await browser.close();

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

const result = {
    system,
    template,
    mode,
    reference: referenceOrigin,
    preview: previewOrigin,
    elements,
    pairs,
    sections: sectionsCompared,
    coverage,
    unpaired,
    mismatches,
    excluded,
    shots: shotsTaken,
};

writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);

const clip = (value) => String(value).replace(/\|/g, "\\|").slice(0, 70);

console.log(`${system} vs shadcn (${template}, ${mode}): elements shadcn=${elements.shadcn} tyohnn=${elements.tyohnn} · pairs ${pairs} · unpaired ${unpaired.shadcn.length}/${unpaired.tyohnn.length} · mismatches ${mismatches.length} · excluded ${excluded.length}`);

if (coverage)
{
    const withSlots = coverage.filter((row) => row.compared > 0);
    const none = coverage.filter((row) => row.compared === 0 && row.rendered);
    const absent = coverage.filter((row) => !row.rendered);

    console.log(`\ncoverage: ${sectionsCompared.length} sections · ${withSlots.length} components compared (${withSlots.reduce((sum, row) => sum + row.compared, 0)} slots) · ${none.length} rendered with no slots of their own · ${absent.length} not in the compared sections`);
    console.log("\n| component | slots compared | mismatches |\n|---|---|---|");
    withSlots.forEach((row) => console.log(`| ${row.component} | ${row.compared} | ${row.mismatches} |`));
    none.forEach((row) => console.log(`| ${row.component} | no slots | — |`));
    absent.forEach((row) => console.log(`| ${row.component} | not compared | — |`));
}

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

if (unpaired.shadcn.length || unpaired.tyohnn.length)
{
    console.log(`\nunpaired shadcn: ${unpaired.shadcn.slice(0, 15).join(", ")}${unpaired.shadcn.length > 15 ? " …" : ""}`);
    console.log(`unpaired tyohnn: ${unpaired.tyohnn.slice(0, 15).join(", ")}${unpaired.tyohnn.length > 15 ? " …" : ""}`);
}

if (excluded.length)
{
    const reasons = new Map();

    excluded.forEach((row) => reasons.set(row.reason, (reasons.get(row.reason) ?? 0) + 1));
    console.log("\nexcluded:");
    reasons.forEach((count, reason) => console.log(`  ${count} × ${reason}`));
}

if (shotsTaken.length) console.log(`\nshots: ${shots} (${shotsTaken.length} ${template === "coverage" ? "sections" : "components"})`);
console.log(`result: ${out}`);

process.exit(mismatches.length === 0 ? 0 : 1);
