// Computed-style equivalence between two renders of the same markup.
//
// Walks every element under the specimen root in document order on both pages and compares the
// visual computed properties plus the bounding-box height, element by element.
//
// Icons: by default (--svg box) an <svg> is compared by its box only (width · height · rendered
// width and height) and nothing inside it is walked, so two icon libraries drawing the same slot
// compare equal. --svg full walks and compares SVG internals like any other element.
//
// Usage:
//   node tooling/snapshot/compare-computed.mjs --a <url> (--b <url> | --system <name> [--mode dark|light]) [--label name] [--light]
//        [--root '[data-specimen="canvas"]' --root-up 1] [--svg box|full] [--mode-a dark|light] [--icons] [--shots dir] [--out file.json]
// --light removes `dark` from <html> on both pages after load (for apps that hard-code it).
// --mode-a dark|light sets `dark` on page a's <html> only (an app whose default mode differs from the compared preview mode).
// --icons prints the first <svg> under the root on each page (class and the first drawing element) and how many
// svgs carry lucide's class, to show which icon library each page draws with; --svg box compares their boxes only.
//
// Keyed dumps (for before/after checks of one system, e.g. a registry/ui change):
//   node tooling/snapshot/compare-computed.mjs --dump before.json --system <name> [--mode dark|light] [--preview origin] [--states open|closed]
//   node tooling/snapshot/compare-computed.mjs --diff before.json after.json [--out diff.json]
// --dump measures one page (default the preview for --system; --a <url> for any page) with the keys of
// compare-shadcn (data-slot and order, see collect.mjs), the sheet plus its open select · dropdown · dialog.
// --diff compares two dumps by key and prints the differences grouped by component and property.

import { readFileSync, writeFileSync } from "node:fs";

import { chromium } from "@playwright/test";

import { measureSheet, STATES } from "./collect.mjs";
import { BLOCK_DISPLAYS as BLOCK_LIST, PROPS } from "./props.mjs";

const arg = (name, fallback) =>
{
    const index = process.argv.indexOf(`--${name}`);

    return index === -1 ? fallback : process.argv[index + 1];
};

const A = arg("a");
// --system <name> [--mode dark|light] [--preview http://localhost:5173] is shorthand for the preview URL as --b
const system = arg("system");
const B = arg("b") ?? (system ? `${arg("preview", "http://localhost:5173")}/?system=${encodeURIComponent(system)}&mode=${arg("mode", "dark")}&motion=off` : undefined);
const label = arg("label", "pair");
const rootSelector = arg("root", '[data-specimen="canvas"]');
const rootUp = Number(arg("root-up", "1"));
const shots = arg("shots");
const out = arg("out");
const light = process.argv.includes("--light");
const modeA = arg("mode-a");
const icons = process.argv.includes("--icons");
const svgMode = arg("svg", "box");

const dump = arg("dump");
const diff = arg("diff");

if (dump)
{
    const url = A ?? B;
    const mode = arg("mode", "dark") === "light" ? "light" : "dark";

    if (!url) throw new Error("--dump needs --system <name> or --a <url>");
    const browser = await chromium.launch();
    const page = await measureSheet(browser, { url, mode, rootSelector, states: arg("states", "open") === "closed" ? [] : STATES, side: "dump" });

    await page.close();
    await browser.close();
    writeFileSync(dump, `${JSON.stringify({ url, system, mode, date: new Date().toISOString(), rows: page.rows }, null, 1)}\n`);
    console.log(`dump ${url} (${mode}): ${page.rows.length} elements → ${dump}`);
    process.exit(0);
}

if (diff)
{
    const before = JSON.parse(readFileSync(diff, "utf8"));
    const after = JSON.parse(readFileSync(process.argv[process.argv.indexOf("--diff") + 2], "utf8"));
    const a = new Map(before.rows.map((row) => [row.key, row]));
    const b = new Map(after.rows.map((row) => [row.key, row]));
    const rows = [];

    for (const key of new Set([...a.keys(), ...b.keys()]))
    {
        const left = a.get(key);
        const right = b.get(key);

        if (!left || !right)
        {
            rows.push({ key, component: (left ?? right).component, prop: "(unpaired)", before: left?.tag ?? "(none)", after: right?.tag ?? "(none)" });
            continue;
        }

        for (const prop of new Set([...Object.keys(left.values), ...Object.keys(right.values), "tag"]))
        {
            const l = prop === "tag" ? left.tag : left.values[prop];
            const r = prop === "tag" ? right.tag : right.values[prop];

            if (l !== r) rows.push({ key, component: left.component, prop, before: l ?? "(none)", after: r ?? "(none)" });
        }
    }

    const groups = new Map();

    rows.forEach((row) => groups.set(`${row.component}|${row.prop}`, [...(groups.get(`${row.component}|${row.prop}`) ?? []), row]));
    if (out) writeFileSync(out, `${JSON.stringify({ before: diff, after: process.argv[process.argv.indexOf("--diff") + 2], rows }, null, 1)}\n`);
    console.log(`diff: ${before.rows.length} → ${after.rows.length} elements · ${rows.length} differences in ${groups.size} component/property groups`);
    if (rows.length) console.log("| component | property | count | first key | before | after |\n|---|---|---|---|---|---|");
    const clip = (value) => String(value).replace(/\|/g, "\\|").slice(0, 60);

    groups.forEach((list, group) => console.log(`| ${group.replace("|", " | ")} | ${list.length} | ${list[0].key} | ${clip(list[0].before)} | ${clip(list[0].after)} |`));
    process.exit(rows.length ? 1 : 0);
}

if (!A || !B)
{
    console.error("usage: compare-computed.mjs --a <url> (--b <url> | --system <name> [--mode dark|light]) [--label] [--light] [--shots dir] [--out file]");
    process.exit(2);
}

const BLOCK_DISPLAYS = new Set(BLOCK_LIST);

const snapshot = async (browser, url, mode) =>
{
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForSelector(rootSelector);

    if (light)
    {
        await page.evaluate(() => document.documentElement.classList.remove("dark"));
    }

    if (mode)
    {
        await page.evaluate((dark) => document.documentElement.classList.toggle("dark", dark), mode === "dark");
    }

    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);

    const rows = await page.evaluate(({ rootSelector, rootUp, PROPS, BLOCK, svgMode }) =>
    {
        let root = document.querySelector(rootSelector);

        for (let step = 0; step < rootUp; step += 1) root = root.parentElement;

        const block = new Set(BLOCK);

        // Colours are compared as the 8-bit sRGB pixel the browser paints (on a 1×1 canvas), so the
        // same colour serialised in different spaces (oklch · lab · oklab after build-time conversion,
        // or color-mix float noise) is not reported as a difference.
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        const cache = new Map();
        const toPixel = (colour) =>
        {
            if (!cache.has(colour))
            {
                context.clearRect(0, 0, 1, 1);
                context.fillStyle = "#000";
                context.fillStyle = colour;
                context.fillRect(0, 0, 1, 1);
                const [r, g, bl, al] = context.getImageData(0, 0, 1, 1).data;

                cache.set(colour, `rgba(${r},${g},${bl},${al})`);
            }

            return cache.get(colour);
        };
        const normalise = (value) => value.replace(/\b(?:oklab|oklch|lab|lch|rgba?|hsla?|color)\([^()]*\)/g, toPixel);
        const elements = [root, ...root.querySelectorAll("*")]
            .filter((element) => svgMode === "full" || !element.parentElement?.closest("svg"));
        const round = (value) => String(Math.round(value * 100) / 100);

        return elements.map((element, index) =>
        {
            const style = getComputedStyle(element);
            const values = {};
            const box = element.getBoundingClientRect();

            if (svgMode !== "full" && element.tagName.toLowerCase() === "svg")
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
                }

                values["rect-height"] = round(box.height);
            }

            const classes = typeof element.className === "string" ? element.className : element.getAttribute("class") ?? "";
            const hook = classes.split(/\s+/).find((name) => name.startsWith("cn-")) ?? "";
            const slot = element.getAttribute("data-slot") ?? "";

            return { index, tag: element.tagName.toLowerCase(), id: `${element.tagName.toLowerCase()}${slot ? `[${slot}]` : ""}${hook ? `.${hook}` : ""}`, text: (element.textContent ?? "").trim().slice(0, 24), values };
        });
    }, { rootSelector, rootUp, PROPS, BLOCK: [...BLOCK_DISPLAYS], svgMode });

    const screenshot = async (path) =>
    {
        let handle = await page.$(rootSelector);

        for (let step = 0; step < rootUp; step += 1) handle = await handle.evaluateHandle((element) => element.parentElement);
        await handle.asElement().screenshot({ path });
    };

    const iconSignature = await page.evaluate((rootSelector) =>
    {
        const svgs = [...document.querySelector(rootSelector).parentElement.querySelectorAll("svg")];
        const first = svgs[0];
        const drawing = first?.querySelector("path, circle, rect, line, polyline");

        return {
            count: svgs.length,
            lucide: svgs.filter((svg) => (svg.getAttribute("class") ?? "").split(/\s+/).includes("lucide")).length,
            class: first?.getAttribute("class") ?? null,
            first: drawing ? `<${drawing.tagName.toLowerCase()} ${[...drawing.attributes].map((attr) => `${attr.name}="${attr.value.slice(0, 32)}"`).join(" ")}>` : null,
        };
    }, rootSelector);

    return { rows, iconSignature, screenshot, close: () => page.close() };
};

const browser = await chromium.launch();
const left = await snapshot(browser, A, modeA);
const right = await snapshot(browser, B);

if (shots)
{
    await left.screenshot(`${shots}/tyohnn-p1-${label}-a.png`);
    await right.screenshot(`${shots}/tyohnn-p1-${label}-b.png`);
}

const mismatches = [];
const structural = [];
const count = Math.max(left.rows.length, right.rows.length);

for (let index = 0; index < count; index += 1)
{
    const a = left.rows[index];
    const b = right.rows[index];

    if (!a || !b || a.tag !== b.tag)
    {
        structural.push({ index, a: a?.id, b: b?.id });
        continue;
    }

    for (const prop of Object.keys({ ...a.values, ...b.values }))
    {
        if (a.values[prop] !== b.values[prop])
        {
            mismatches.push({ index, element: a.id, text: a.text, prop, a: a.values[prop], b: b.values[prop] });
        }
    }
}

await left.close();
await right.close();
await browser.close();

const result = { label, a: A, b: B, svg: svgMode, elements: { a: left.rows.length, b: right.rows.length }, icons: { a: left.iconSignature, b: right.iconSignature }, structural, mismatches };

if (out) writeFileSync(out, JSON.stringify(result, null, 2));

console.log(`${label} (svg ${svgMode}): elements a=${left.rows.length} b=${right.rows.length} · structural ${structural.length} · property mismatches ${mismatches.length}`);

if (icons)
{
    for (const [side, signature] of [["a", left.iconSignature], ["b", right.iconSignature]])
    {
        console.log(`icons ${side}: ${signature.lucide}/${signature.count} svg with class lucide · first class="${signature.class}" ${signature.first}`);
    }
}

const top = mismatches.slice(0, 25);

if (top.length > 0)
{
    console.log("| # | element | prop | a | b |\n|---|---|---|---|---|");
    top.forEach((row) => console.log(`| ${row.index} | ${row.element} | ${row.prop} | ${row.a.slice(0, 60)} | ${row.b.slice(0, 60)} |`));
}

structural.slice(0, 10).forEach((row) => console.log(`structural @${row.index}: a=${row.a} b=${row.b}`));
process.exit(mismatches.length + structural.length === 0 ? 0 : 1);
