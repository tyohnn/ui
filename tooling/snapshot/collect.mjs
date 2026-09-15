// Shared by compare-shadcn and compare-computed (--dump / --diff): the in-page collector that keys every
// element by data-slot and order, and the open states measured after the closed page.

import { join } from "node:path";

import { BLOCK_DISPLAYS, PROPS } from "./props.mjs";

/** Runs in the page: computed values of every element under the roots, keyed by data-slot and order. */
export const collectInPage = ({ selectors, up, prefix, PROPS, BLOCK }) =>
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
export const swapTextInPage = (map) =>
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
export const STATES = [
    { name: "select", trigger: '[data-slot="select-trigger"]', index: 1, roots: ['[data-slot="select-content"]'] },
    { name: "dropdown", trigger: '[data-slot="dropdown-menu-trigger"]', index: 0, roots: ['[data-slot="dropdown-menu-content"]'] },
    { name: "dialog", trigger: '[data-slot="dialog-trigger"]', index: 0, roots: ['[data-slot="dialog-overlay"]', '[data-slot="dialog-content"]'] },
];


/**
 * Opens `url` at 1440×900 · DPR 1 · reduced motion in `mode`, measures the sheet under `rootSelector`
 * (one level up) and then each open state in turn. `swap` (a Korean → English map) is applied before
 * each measurement; `shots` saves each open popup as <state>.<side>.png.
 * Returns the rows, Hangul left on the page, a `shot(key, path)` cropper for sheet keys and `close`.
 */
export const measureSheet = async (browser, { url, mode, rootSelector = '[data-specimen="canvas"]', states = STATES, swap, shots, side = "page" }) =>
{
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: mode });
    const settle = async () =>
    {
        if (swap) await page.evaluate(swapTextInPage, swap);
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

    for (const state of states)
    {
        await page.locator(state.trigger).nth(state.index).click();
        await page.waitForSelector(state.roots.at(-1), { state: "visible" });
        await page.mouse.move(1, 1);
        await settle();

        const open = await collect(state.roots, 0, `${state.name}:`);

        if (open.missing) throw new Error(`${side}: ${state.name} opened without ${open.missing.join(", ")}`);
        rows.push(...open.rows);
        hangul.push(...open.hangul);
        if (shots) await page.locator(state.roots.at(-1)).screenshot({ path: join(shots, `${state.name}.${side}.png`), timeout: 3000 }).catch(() => {});
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
