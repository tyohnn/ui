// Computed-style equivalence between two renders of the same markup.
//
// Walks every element under the specimen root in document order on both pages and compares the
// visual computed properties plus the bounding-box height, element by element.
//
// Usage:
//   node tooling/snapshot/compare-computed.mjs --a <url> (--b <url> | --system <name> [--mode dark|light]) [--label name] [--light]
//        [--root '[data-specimen="canvas"]' --root-up 1] [--shots dir] [--out file.json]
// --light removes `dark` from <html> on both pages after load (for apps that hard-code it).

import { writeFileSync } from "node:fs";

import { chromium } from "@playwright/test";

const arg = (name, fallback) =>
{
    const index = process.argv.indexOf(`--${name}`);

    return index === -1 ? fallback : process.argv[index + 1];
};

const A = arg("a");
// --system <name> [--mode dark|light] [--preview http://localhost:5173] is shorthand for the preview URL as --b
const system = arg("system");
const B = arg("b") ?? (system ? `${arg("preview", "http://localhost:5173")}/?system=${encodeURIComponent(system)}&mode=${arg("mode", "dark")}` : undefined);
const label = arg("label", "pair");
const rootSelector = arg("root", '[data-specimen="canvas"]');
const rootUp = Number(arg("root-up", "1"));
const shots = arg("shots");
const out = arg("out");
const light = process.argv.includes("--light");

if (!A || !B)
{
    console.error("usage: compare-computed.mjs --a <url> (--b <url> | --system <name> [--mode dark|light]) [--label] [--light] [--shots dir] [--out file]");
    process.exit(2);
}

export const PROPS = [
    "color", "background-color", "background-image",
    "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
    "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
    "border-top-style", "border-right-style", "border-bottom-style", "border-left-style",
    "border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
    "box-shadow",
    "padding-top", "padding-right", "padding-bottom", "padding-left",
    "margin-top", "margin-right", "margin-bottom", "margin-left",
    "row-gap", "column-gap",
    "height", "width",
    "font-size", "font-weight", "line-height", "letter-spacing",
    "opacity",
    "outline-color", "outline-style", "outline-width", "outline-offset",
    "text-transform",
];

const BLOCK_DISPLAYS = new Set(["block", "flex", "grid", "table", "list-item", "flow-root"]);

const snapshot = async (browser, url) =>
{
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForSelector(rootSelector);

    if (light)
    {
        await page.evaluate(() => document.documentElement.classList.remove("dark"));
    }

    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);

    const rows = await page.evaluate(({ rootSelector, rootUp, PROPS, BLOCK }) =>
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
        const elements = [root, ...root.querySelectorAll("*")];

        return elements.map((element, index) =>
        {
            const style = getComputedStyle(element);
            const values = {};

            for (const prop of PROPS)
            {
                if (prop === "width" && block.has(style.display)) continue;
                values[prop] = normalise(style.getPropertyValue(prop));
            }

            values["rect-height"] = String(Math.round(element.getBoundingClientRect().height * 100) / 100);

            const classes = typeof element.className === "string" ? element.className : element.getAttribute("class") ?? "";
            const hook = classes.split(/\s+/).find((name) => name.startsWith("cn-")) ?? "";
            const slot = element.getAttribute("data-slot") ?? "";

            return { index, tag: element.tagName.toLowerCase(), id: `${element.tagName.toLowerCase()}${slot ? `[${slot}]` : ""}${hook ? `.${hook}` : ""}`, text: (element.textContent ?? "").trim().slice(0, 24), values };
        });
    }, { rootSelector, rootUp, PROPS, BLOCK: [...BLOCK_DISPLAYS] });

    const screenshot = async (path) =>
    {
        let handle = await page.$(rootSelector);

        for (let step = 0; step < rootUp; step += 1) handle = await handle.evaluateHandle((element) => element.parentElement);
        await handle.asElement().screenshot({ path });
    };

    return { rows, screenshot, close: () => page.close() };
};

const browser = await chromium.launch();
const left = await snapshot(browser, A);
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

const result = { label, a: A, b: B, elements: { a: left.rows.length, b: right.rows.length }, structural, mismatches };

if (out) writeFileSync(out, JSON.stringify(result, null, 2));

console.log(`${label}: elements a=${left.rows.length} b=${right.rows.length} · structural ${structural.length} · property mismatches ${mismatches.length}`);

const top = mismatches.slice(0, 25);

if (top.length > 0)
{
    console.log("| # | element | prop | a | b |\n|---|---|---|---|---|");
    top.forEach((row) => console.log(`| ${row.index} | ${row.element} | ${row.prop} | ${row.a.slice(0, 60)} | ${row.b.slice(0, 60)} |`));
}

structural.slice(0, 10).forEach((row) => console.log(`structural @${row.index}: a=${row.a} b=${row.b}`));
process.exit(mismatches.length + structural.length === 0 ? 0 : 1);
