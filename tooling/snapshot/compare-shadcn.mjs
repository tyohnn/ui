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

import { BLOCK_DISPLAYS, PROPS } from "./props.mjs";

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
const rootSelector = '[data-specimen="canvas"]';
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

/** Runs in the page: computed values of every element under the roots, keyed by data-slot and order. */
const collectInPage = ({ selectors, up, prefix, PROPS, BLOCK }) =>
{
    const roots = selectors.map((selector) =>
    {
        let element = document.querySelector(selector);

        for (let step = 0; element && step < up; step += 1) element = element.parentElement;

        return element;
    });

    if (roots.some((element) => !element)) return { missing: selectors.filter((_, index) => !roots[index]), rows: [], hangul: [] };
    const block = new Set(BLOCK);
    const canvas = document.createElement("canvas");

    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const cache = new Map();
    // Colours compare as the 8-bit sRGB pixel the browser paints, so one colour written in two
    // colour spaces (oklch in shadcn, lab after a build) is not a difference.
    const toPixel = (colour) =>
    {
        if (!cache.has(colour))
        {
            context.clearRect(0, 0, 1, 1);
            context.fillStyle = "#000";
            context.fillStyle = colour;
            context.fillRect(0, 0, 1, 1);
            const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;

            cache.set(colour, `rgba(${r},${g},${b},${a})`);
        }

        return cache.get(colour);
    };
    const normalise = (value) => value.replace(/\b(?:oklab|oklch|lab|lch|rgba?|hsla?|color)\([^()]*\)/g, toPixel);
    // Tailwind composes ring and shadow utilities into one box-shadow list whose unused layers are
    // `rgba(0,0,0,0) 0px 0px 0px 0px`. A layer that is transparent, or has no offset, blur or spread,
    // paints nothing, so it is dropped; an empty list is `none`.
    const normaliseShadow = (value) =>
    {
        if (value === "none") return value;

        const layers = value.split(/,(?![^()]*\))/).map((layer) => layer.trim()).filter((layer) =>
        {
            const colour = layer.match(/rgba\((\d+),(\d+),(\d+),(\d+)\)/);
            const lengths = (layer.replace(/rgba\([^)]*\)/, "").match(/-?[\d.]+px/g) ?? []).map(parseFloat);

            return !(colour && colour[4] === "0") && lengths.some((length) => length !== 0);
        });

        return layers.length ? layers.join(", ") : "none";
    };
    const round = (value) => String(Math.round(value * 100) / 100);
    const hangul = /[\u3131-\u318e\uac00-\ud7a3]/;
    const keys = new Map();
    const slotCount = new Map();
    const tagCount = new Map();
    const rows = [];

    roots.forEach((root, index) => keys.set(root, roots.length === 1 ? `${prefix}root` : `${prefix}root${index}`));

    const isRoot = (element) => roots.includes(element);
    const elements = roots.flatMap((root) => [root, ...[...root.querySelectorAll("*")].filter((element) => !element.parentElement?.closest("svg"))]);

    for (const element of elements)
    {
        const tag = element.tagName.toLowerCase();
        const slot = element.getAttribute("data-slot");
        let key = keys.get(element);

        if (!key)
        {
            if (slot)
            {
                const n = slotCount.get(slot) ?? 0;

                slotCount.set(slot, n + 1);
                key = `${prefix}${slot}#${n}`;
            }
            else
            {
                let ancestor = element.parentElement;

                while (!keys.has(ancestor) || (!isRoot(ancestor) && !ancestor.getAttribute("data-slot"))) ancestor = ancestor.parentElement;
                const counter = `${keys.get(ancestor)}>${tag}`;
                const m = tagCount.get(counter) ?? 0;

                tagCount.set(counter, m + 1);
                key = `${counter}#${m}`;
            }

            keys.set(element, key);
        }

        // Component = the nearest slotted element at or above this one.
        let component = element;

        while (component && !isRoot(component) && !component.getAttribute("data-slot")) component = component.parentElement;

        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        const values = {};

        if (tag === "svg")
        {
            values.width = style.getPropertyValue("width");
            values.height = style.getPropertyValue("height");
            values["rect-width"] = round(box.width);
            values["rect-height"] = round(box.height);
        }
        else
        {
            for (const prop of PROPS)
            {
                if (prop === "width" && block.has(style.display)) continue;
                values[prop] = normalise(style.getPropertyValue(prop));
                if (prop === "box-shadow") values[prop] = normaliseShadow(values[prop]);
            }

            values["rect-height"] = round(box.height);

            // A side whose border width is 0 paints no border: its style and colour say nothing.
            for (const side of ["top", "right", "bottom", "left"])
            {
                if (values[`border-${side}-width`] === "0px")
                {
                    values[`border-${side}-style`] = "(no border)";
                    values[`border-${side}-color`] = "(no border)";
                }
            }

            // `rounded-full` (calc(infinity * 1px)) and 9999px both draw a pill on any box a
            // component renders: radii of 9999px and more compare as one value.
            for (const corner of ["top-left", "top-right", "bottom-right", "bottom-left"])
            {
                const prop = `border-${corner}-radius`;

                if (parseFloat(values[prop]) >= 9999) values[prop] = "(pill)";
            }
        }

        element.setAttribute("data-compare-key", key);
        rows.push({
            key,
            tag,
            component: !component || (isRoot(component) && !component.getAttribute("data-slot")) ? `${prefix}(layout)` : `${prefix}${component.getAttribute("data-slot")}`,
            text: (element.textContent ?? "").trim().slice(0, 32),
            values,
        });
    }

    const text = roots.map((root) => root.innerText + [...root.querySelectorAll("[placeholder]")].map((element) => element.getAttribute("placeholder")).join(" ")).join(" ");

    return { rows, hangul: hangul.test(text) ? [...new Set(text.match(/[\u3131-\u318e\uac00-\ud7a3][\u3131-\u318e\uac00-\ud7a3 ]*/g))] : [] };
};

/** Runs in the page: the Specimen's Korean strings → English (tooling/preset/specimen-text.json). */
const swapTextInPage = (map) =>
{
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

    for (let node = walker.nextNode(); node; node = walker.nextNode())
    {
        const trimmed = node.nodeValue.trim();

        if (map[trimmed]) node.nodeValue = node.nodeValue.replace(trimmed, map[trimmed]);
    }

    document.querySelectorAll("[placeholder]").forEach((element) =>
    {
        const value = element.getAttribute("placeholder");

        if (map[value]) element.setAttribute("placeholder", map[value]);
    });
};

/**
 * Open states compared after the closed sheet: each clicks a trigger of the Specimen, measures the popup
 * (portalled outside the sheet) under keys prefixed with the state name, and closes it with Escape.
 */
const STATES = [
    { name: "select", trigger: '[data-slot="select-trigger"]', index: 1, roots: ['[data-slot="select-content"]'] },
    { name: "dropdown", trigger: '[data-slot="dropdown-menu-trigger"]', index: 0, roots: ['[data-slot="dropdown-menu-content"]'] },
    { name: "dialog", trigger: '[data-slot="dialog-trigger"]', index: 0, roots: ['[data-slot="dialog-overlay"]', '[data-slot="dialog-content"]'] },
];

const snapshot = async (browser, url, side) =>
{
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: mode });
    const settle = async () =>
    {
        if (side === "tyohnn") await page.evaluate(swapTextInPage, strings);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(500);
    };
    const collect = (selectors, up, prefix) => page.evaluate(collectInPage, { selectors, up, prefix, PROPS, BLOCK: BLOCK_DISPLAYS });

    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: mode });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForSelector(rootSelector);
    await page.evaluate((dark) => document.documentElement.classList.toggle("dark", dark), mode === "dark");
    await settle();

    const sheet = await collect([rootSelector], 1, "");
    const rows = [...sheet.rows];
    const hangul = [...sheet.hangul];

    for (const state of states ? STATES : [])
    {
        await page.locator(state.trigger).nth(state.index).click();
        await page.waitForSelector(state.roots.at(-1), { state: "visible" });
        await page.mouse.move(1, 1);
        await settle();

        const open = await collect(state.roots, 0, `${state.name}:`);

        if (open.missing) throw new Error(`${side}: ${state.name} opened without ${open.missing.join(", ")}`);
        rows.push(...open.rows);
        hangul.push(...open.hangul);
        await page.locator(state.roots.at(-1)).screenshot({ path: join(shots, `${state.name}.${side}.png`), timeout: 3000 }).catch(() => {});
        await page.keyboard.press("Escape");
        await page.waitForSelector(state.roots.at(-1), { state: "detached" }).catch(() => {});
        await page.waitForTimeout(200);
    }

    // Screenshots are taken with the page closed again, so only sheet keys can be cropped.
    const shot = async (key, path) =>
    {
        try
        {
            await page.locator(`[data-compare-key="${key}"]`).first().screenshot({ path, timeout: 3000 });

            return path;
        }
        catch
        {
            return null;
        }
    };

    return { rows, hangul, shot, close: () => page.close() };
};

const browser = await chromium.launch();
const reference = await snapshot(browser, referenceUrl, "shadcn");
const tyohnn = await snapshot(browser, previewUrl, "tyohnn");

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
