// compare-blocks — the sidebar chrome of a block template against the real shadcn block.
//
// A block template (apps/preview/src/templates/blocks/<id>, catalog `block`) ports one of shadcn's sidebar blocks
// and fills the body with a product screen. The body is ours, so only the chrome is compared: the page is rendered
// in the preset's reference app (`/blocks/<block>`, tooling/preset/make-reference.mjs --blocks) and in the preview
// started for the system, at the same viewport (1440×900, DPR 1), colour scheme, `dark` class and clock, and these
// subtrees are measured on both:
//
//   - every `[data-slot="sidebar"]` that is not inside another one (sidebar-09's nested sidebars are inside the
//     outer one), with all descendants: sidebar-gap · sidebar-container · sidebar-inner · header · content ·
//     groups · menus · rail …;
//   - every `<header>` outside a sidebar: the page header inside SidebarInset (trigger · separator · breadcrumb) or
//     sidebar-16's site header;
//   - `--roots 'sel|sel'`: further roots on both pages (a block whose chrome lives elsewhere, e.g. sidebar-13's dialog).
//
// Roots pair by order; inside a root, elements pair by `data-slot` and order and compare the properties of
// tooling/snapshot/props.mjs plus box height, exactly as compare-shadcn does (collect.mjs). `<svg>` compares by box.
//
// Text is not the template's to match: labels, names and counts are fictional. Text content is never compared, and
// `width` is dropped for every element that holds text (its width follows the label). Heights, paddings, gaps,
// radii, colours, borders, shadows and every textless box (icons, avatars, logo squares, rail, gap, container) are
// compared. A template keeps upstream's nav structure (item count, nesting, open/closed) and changes labels only,
// so the keys pair one to one; anything else is an exclusion with a reason.
//
// Two more values follow the content rather than the chrome, and are skipped by rule (counted in the summary):
//
//   - page height: a root (`sidebarN/root`, the in-flow `[data-slot=sidebar]` wrapper) stretches to the page, whose
//     height is the body's (upstream's placeholder body vs the product screen). A root's `height` and `rect-height`
//     are skipped when, on each side, the value equals that page's document height (`scrollHeight` of the root
//     element, never below the viewport). A root that is not page-high on either side is still compared, and so is
//     every element inside it (the fixed `h-svh` container).
//   - auto margins: a margin whose computed value is `auto` (`ml-auto`, `sm:ml-auto`, read from the typed OM
//     `computedStyleMap()`, since getComputedStyle resolves it to the used px) is the space the neighbours' text
//     leaves. Skipped when it is `auto` on both sides; `auto` on one side only is a mismatch.
//
// Exclusions: apps/preview/src/templates/blocks/<template>/compare-exclusions.json (or --exclusions <file>):
//   [{ "key": "<regex on the reported key>", "props": ["prop", …] | "*", "reason": "…", "systems"?: ["sera"], "modes"?: ["dark"] }]
// Reported keys are `<root>/<key>`, root = `sidebar0` · `sidebar1` · `header0` · `extra0` ….
//
// Usage:
//   node tooling/snapshot/compare-blocks.mjs --system mira --block sidebar-07 --template block-ai-playground
//        [--mode light|dark] [--reference http://localhost:3150] [--preview http://localhost:5230]
//        [--clock 2026-01-14T12:00:00] [--roots 'sel|sel'] [--exclusions file] [--shots dir]
//
// The preview must be started for --system (fonts and icons are chosen at start). Output: pair and mismatch counts,
// a table grouped by slot and property, exclusions with reasons, both pages' screenshots and result.json in
// tooling/snapshot/out/blocks-<system>-<template>-<mode>/. Exit 0 when nothing but exclusions remain.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

import { collectInPage } from "./collect.mjs";
import { BLOCK_DISPLAYS, PROPS } from "./props.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const arg = (name, fallback) =>
{
    const index = process.argv.indexOf(`--${name}`);

    return index === -1 ? fallback : process.argv[index + 1];
};

const system = arg("system");
const block = arg("block");
const template = arg("template");
const mode = arg("mode", "light") === "dark" ? "dark" : "light";
const referenceOrigin = arg("reference", "http://localhost:3150");
const previewOrigin = arg("preview", "http://localhost:5230");
const clock = arg("clock", "2026-01-14T12:00:00");
const extraRoots = (arg("roots", "") || "").split("|").map((selector) => selector.trim()).filter(Boolean);
const shots = arg("shots", join(repoRoot, "tooling/snapshot/out", `blocks-${system}-${template}-${mode}`));
const exclusionsFile = arg("exclusions", join(repoRoot, "apps/preview/src/templates/blocks", template ?? "", "compare-exclusions.json"));

if (!system || !/^sidebar-\d\d$/.test(block ?? "") || !template)
{
    console.error("usage: compare-blocks.mjs --system <name> --block sidebar-NN --template <id> [--mode light|dark] [--reference origin] [--preview origin] [--clock iso] [--roots 'sel|sel'] [--exclusions file] [--shots dir]");
    process.exit(2);
}

const exclusions = (existsSync(exclusionsFile) ? JSON.parse(readFileSync(exclusionsFile, "utf8")) : [])
    .filter((rule) => (!rule.systems || rule.systems.includes(system)) && (!rule.modes || rule.modes.includes(mode)))
    .map((rule) => ({ ...rule, pattern: new RegExp(rule.key) }));

mkdirSync(shots, { recursive: true });

/** Runs in the page: marks the compared roots with data-compare-root and returns their names in order. */
const markRootsInPage = (extra) =>
{
    const names = [];
    const mark = (element, name) =>
    {
        element.setAttribute("data-compare-root", name);
        names.push(name);
    };

    [...document.querySelectorAll('[data-slot="sidebar"]')]
        .filter((element) => !element.parentElement?.closest('[data-slot="sidebar"]'))
        .forEach((element, index) => mark(element, `sidebar${index}`));
    [...document.querySelectorAll("header")]
        .filter((element) => !element.closest('[data-slot="sidebar"]'))
        .forEach((element, index) => mark(element, `header${index}`));
    extra.forEach((selector, index) =>
    {
        const element = document.querySelector(selector);

        if (element) mark(element, `extra${index}`);
    });

    return names;
};

/** Runs in the page after collection: `key → [margin props whose computed value is auto]` for the measured elements. */
const autoMarginsInPage = () =>
{
    const found = {};

    for (const element of document.querySelectorAll("[data-compare-key]"))
    {
        if (!element.computedStyleMap || element.tagName.toLowerCase() === "svg") continue;

        const map = element.computedStyleMap();
        const auto = ["margin-top", "margin-right", "margin-bottom", "margin-left"].filter((prop) => String(map.get(prop)) === "auto");

        if (auto.length) found[element.getAttribute("data-compare-key")] = auto;
    }

    return found;
};

const measure = async (browser, url, side) =>
{
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: mode });
    const errors = [];

    page.on("pageerror", (error) => errors.push(String(error).slice(0, 160)));
    await page.clock.setFixedTime(new Date(clock));
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: mode });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate((dark) => document.documentElement.classList.toggle("dark", dark), mode === "dark");
    await page.waitForSelector('[data-slot="sidebar"]', { timeout: 15000 });
    await page.mouse.move(1439, 899);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);

    const banner = await page.$('[data-preview-banner="system-mismatch"]');

    if (banner) throw new Error(`${side}: the preview at ${previewOrigin} was started for another system than ${system}`);

    const roots = await page.evaluate(markRootsInPage, extraRoots);
    const rows = [];

    // One root at a time, so a DOM difference in one root never shifts the keys of another.
    for (const root of roots)
    {
        const result = await page.evaluate(collectInPage, { selectors: [`[data-compare-root="${root}"]`], up: 0, prefix: `${root}/`, PROPS, BLOCK: BLOCK_DISPLAYS });

        rows.push(...result.rows);
    }

    const autoMargins = await page.evaluate(autoMarginsInPage);
    const pageHeight = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, window.innerHeight));

    await page.screenshot({ path: join(shots, `${side}.png`) });
    await page.close();

    return { roots, rows, errors, autoMargins, pageHeight };
};

const browser = await chromium.launch();
const referenceUrl = `${referenceOrigin}/blocks/${block}`;
const previewUrl = `${previewOrigin}/?system=${encodeURIComponent(system)}&mode=${mode}&template=${encodeURIComponent(template)}&motion=off`;
const reference = await measure(browser, referenceUrl, "shadcn");
const tyohnn = await measure(browser, previewUrl, "tyohnn");

await browser.close();

const mismatches = [];
const excluded = [];
const textWidth = [];
const pageHeights = [];
const autoMargins = [];
const classify = (row) =>
{
    const rule = exclusions.find((candidate) => candidate.pattern.test(row.key) && (candidate.props === "*" || candidate.props.includes(row.prop)));

    if (rule) excluded.push({ ...row, reason: rule.reason });
    else mismatches.push(row);
};

if (reference.roots.join(",") !== tyohnn.roots.join(","))
{
    classify({ key: "(roots)", component: "(roots)", prop: "roots", shadcn: reference.roots.join(",") || "(none)", tyohnn: tyohnn.roots.join(",") || "(none)" });
}

const a = new Map(reference.rows.map((row) => [row.key, row]));
const b = new Map(tyohnn.rows.map((row) => [row.key, row]));
const unpaired = { shadcn: [...a.keys()].filter((key) => !b.has(key)), tyohnn: [...b.keys()].filter((key) => !a.has(key)) };
let pairs = 0;

unpaired.shadcn.forEach((key) => classify({ key, component: a.get(key).component, prop: "(unpaired)", shadcn: a.get(key).tag, tyohnn: "(none)", text: a.get(key).text }));
unpaired.tyohnn.forEach((key) => classify({ key, component: b.get(key).component, prop: "(unpaired)", shadcn: "(none)", tyohnn: b.get(key).tag, text: b.get(key).text }));

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

        // The label is fictional: an element that holds text is as wide as its text.
        if (prop === "width" && (left.text || right.text))
        {
            textWidth.push(key);
            continue;
        }

        // A sidebar root is as tall as the page, and the page is as tall as the body.
        const pageHigh = (value, side) => Math.abs(parseFloat(value) - side.pageHeight) <= 1;

        if (/^[a-z]+\d+\/root$/.test(key) && (prop === "height" || prop === "rect-height")
            && pageHigh(left.values[prop], reference) && pageHigh(right.values[prop], tyohnn))
        {
            pageHeights.push(`${key} ${prop}`);
            continue;
        }

        const autoLeft = reference.autoMargins[key]?.includes(prop) ?? false;
        const autoRight = tyohnn.autoMargins[key]?.includes(prop) ?? false;

        // An auto margin is the room the neighbours' (fictional) text leaves.
        if (autoLeft && autoRight)
        {
            autoMargins.push(`${key} ${prop}`);
            continue;
        }

        const shown = (value, auto) => `${value ?? "(none)"}${auto ? " (auto)" : ""}`;

        classify({ key, component: left.component, prop, shadcn: shown(left.values[prop], autoLeft), tyohnn: shown(right.values[prop], autoRight), text: left.text });
    }
}

const result = {
    system, block, template, mode, clock,
    reference: referenceUrl, preview: previewUrl,
    roots: { shadcn: reference.roots, tyohnn: tyohnn.roots },
    elements: { shadcn: reference.rows.length, tyohnn: tyohnn.rows.length },
    pairs, unpaired, mismatches, excluded,
    textWidthsSkipped: textWidth.length,
    pageHeightsSkipped: pageHeights,
    autoMarginsSkipped: autoMargins,
    pageErrors: { shadcn: reference.errors, tyohnn: tyohnn.errors },
};

writeFileSync(join(shots, "result.json"), `${JSON.stringify(result, null, 2)}\n`);

const clip = (value) => String(value).replace(/\|/g, "\\|").slice(0, 70);

console.log(`${system} ${template} vs shadcn ${block} (${mode}): roots ${reference.roots.join(",")} · elements shadcn=${reference.rows.length} tyohnn=${tyohnn.rows.length} · pairs ${pairs} · unpaired ${unpaired.shadcn.length}/${unpaired.tyohnn.length} · mismatches ${mismatches.length} · excluded ${excluded.length} · text widths skipped ${textWidth.length} · page heights skipped ${pageHeights.length} · auto margins skipped ${autoMargins.length}`);

if (reference.errors.length || tyohnn.errors.length) console.log(`page errors: shadcn ${JSON.stringify(reference.errors)} · tyohnn ${JSON.stringify(tyohnn.errors)}`);

if (mismatches.length)
{
    const groups = new Map();

    for (const row of mismatches)
    {
        const id = `${row.component}\u0000${row.prop}`;

        groups.set(id, [...(groups.get(id) ?? []), row]);
    }

    console.log("\n| slot | property | count | first key | shadcn | tyohnn |\n|---|---|---|---|---|---|");

    for (const list of groups.values())
    {
        console.log(`| ${list[0].component} | ${list[0].prop} | ${list.length} | ${list[0].key} | ${clip(list[0].shadcn)} | ${clip(list[0].tyohnn)} |`);
    }
}

if (unpaired.shadcn.length || unpaired.tyohnn.length)
{
    console.log(`\nunpaired shadcn: ${unpaired.shadcn.slice(0, 12).join(", ")}${unpaired.shadcn.length > 12 ? " …" : ""}`);
    console.log(`unpaired tyohnn: ${unpaired.tyohnn.slice(0, 12).join(", ")}${unpaired.tyohnn.length > 12 ? " …" : ""}`);
}

if (excluded.length)
{
    const reasons = new Map();

    excluded.forEach((row) => reasons.set(row.reason, (reasons.get(row.reason) ?? 0) + 1));
    console.log("\nexcluded:");
    reasons.forEach((count, reason) => console.log(`  ${count} × ${reason}`));
}

console.log(`\nshots and result: ${shots}`);

process.exit(mismatches.length === 0 ? 0 : 1);
