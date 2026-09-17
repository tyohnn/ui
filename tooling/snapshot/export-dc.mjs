// Exports one preview template, rendered with one design system, as a static Claude Design canvas
// artboard (`.dc.html`).
//
//   node tooling/snapshot/export-dc.mjs --system <name> --template crm-dashboard --out <dir>
//        [--mode dark|light] [--file <Name>.dc.html] [--port 5199] [--reuse] [--sizes <sizes.json>]
//        [--verify <shots dir>] [--no-trim]
//
// 1. Starts the preview for the system (one server at a time, port 5199 by default; --reuse takes a
//    server already running there, after checking it was started for the same system).
// 2. Renders `?system=&mode=&template=` in Playwright and takes the template root
//    (`[data-template="<template>"]`): its outerHTML without <script> and <style> elements, the
//    <style> texts it carries, the rendered size, the text's code points and the font weights used.
// 3. Writes a fully static artboard: `<x-dc><helmet>` with a Google Fonts <link> (google-provider fonts)
//    and one <style> — the system's dist/systems/<name>/compiled.css (rules for classes the DOM never
//    uses removed, see trimCss), inline @font-face rules for local fonts (Pretendard: the woff2 subsets
//    of the dynamic-subset build whose unicode-range meets the text, as data URIs), the template's own
//    styles and a body/link reset — then the root, inside `<div class="dark">` in dark mode.
//    In dark mode the `.dark` token block also applies to `:root` (`:root, .dark`), because layer-2
//    compositions resolve on :root (DESIGN.md §7) and the canvas owns <html>.
// 4. Prints JSON: file, bytes, rendered w/h, fonts, css sizes. --sizes merges {file: {w, h}} into a file.
//    --verify <dir> opens the artboard from file:// (support.js 404 is expected), screenshots both
//    renders (<system>-preview.png · <system>-dc.png), measures a few computed values on both and the
//    share of differing pixels.
//
// The artboard format: no <script data-dc-script>, no {{ }}, no <sc-for>; every non-void element closed
// and every attribute quoted (the HTML serializer of outerHTML guarantees both).

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { chromium } from "@playwright/test";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const require = createRequire(join(repoRoot, "apps/preview/package.json"));

const arg = (name, fallback) =>
{
    const index = process.argv.indexOf(`--${name}`);

    return index === -1 ? fallback : process.argv[index + 1];
};
const flag = (name) => process.argv.includes(`--${name}`);

const system = arg("system");
const template = arg("template", "crm-dashboard");
const outDir = arg("out");

if (!system || !outDir) throw new Error("usage: export-dc.mjs --system <name> --template <template> --out <dir>");
if (!/^[a-z0-9-]+$/.test(system) || !/^[a-z0-9-]+$/.test(template)) throw new Error("system and template are plain names");

const systemDir = join(repoRoot, "registry/systems", system);
const meta = JSON.parse(readFileSync(join(systemDir, "system.json"), "utf8"));
// system.json defaultMode; without one, dark only for a system tagged dark and not light (vega carries both → light).
const tags = meta.tags ?? [];
const mode = arg("mode") ?? (meta.defaultMode || (tags.includes("dark") && !tags.includes("light") ? "dark" : "light"));
const port = Number(arg("port", "5199"));
const origin = `http://localhost:${port}`;
const fileName = arg("file", `${system[0].toUpperCase()}${system.slice(1)}.dc.html`);
const cssPath = join(repoRoot, "dist/systems", system, "compiled.css");

if (!existsSync(cssPath)) throw new Error(`${cssPath} is missing: run node tooling/build-system ${system}`);

// ---------------------------------------------------------------- preview server

const reachable = async () =>
{
    try
    {
        return (await fetch(origin)).ok;
    }
    catch
    {
        return false;
    }
};

const startPreview = async () =>
{
    if (await reachable())
    {
        if (flag("reuse")) return null;
        throw new Error(`port ${port} is in use; stop that server or pass --reuse`);
    }

    const child = spawn(process.execPath, ["scripts/vite-system.mjs", "--port", String(port), "--strictPort"], {
        cwd: join(repoRoot, "apps/preview"),
        env: { ...process.env, SYSTEM: system },
        stdio: ["ignore", "ignore", "pipe"],
        detached: true,
    });
    let stderr = "";

    child.stderr.on("data", (chunk) => (stderr += chunk));

    for (let attempt = 0; attempt < 120; attempt += 1)
    {
        if (child.exitCode !== null) throw new Error(`preview exited (${child.exitCode}): ${stderr.slice(-400)}`);
        if (await reachable()) return child;
        await new Promise((done) => setTimeout(done, 250));
    }

    process.kill(-child.pid, "SIGTERM");
    throw new Error("preview did not start within 30s");
};

const stopPreview = (child) =>
{
    if (!child) return;

    try
    {
        process.kill(-child.pid, "SIGTERM");
    }
    catch
    {
        // already gone
    }
};

// ---------------------------------------------------------------- in-page collection

/** Runs in the page. */
const collect = (selector) =>
{
    const root = document.querySelector(selector);

    if (!root) return { missing: true };
    const clone = root.cloneNode(true);
    const styles = [...clone.querySelectorAll("style")].map((element) => element.textContent ?? "");

    clone.querySelectorAll("script, style").forEach((element) => element.remove());
    // Nothing React-specific reaches the DOM in React 19; drop inline handlers in case a component sets one.
    clone.querySelectorAll("*").forEach((element) =>
    {
        [...element.attributes].filter((attribute) => /^on/i.test(attribute.name)).forEach((attribute) => element.removeAttribute(attribute.name));
    });

    const classes = new Set(["dark"]);
    const weights = new Set();
    const families = new Set();
    const elements = [root, ...root.querySelectorAll("*")];

    for (const element of elements)
    {
        element.classList.forEach((name) => classes.add(name));
        const hasText = [...element.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim());

        if (hasText)
        {
            const style = getComputedStyle(element);

            weights.add(Number(style.fontWeight));
            families.add(style.fontFamily);
        }
    }

    const rect = root.getBoundingClientRect();

    return {
        html: clone.outerHTML,
        styles,
        classes: [...classes],
        weights: [...weights].sort((a, b) => a - b),
        families: [...families],
        // From the clone, so the text of the removed <style> elements does not count.
        codePoints: [...new Set([...(clone.textContent ?? "")].map((char) => char.codePointAt(0)))],
        w: Math.round(rect.width * 100) / 100,
        h: Math.round(rect.height * 100) / 100,
        bodyBackground: getComputedStyle(document.body).backgroundColor,
        banner: Boolean(document.querySelector("[data-preview-banner]")),
    };
};

// ---------------------------------------------------------------- CSS trimming

/**
 * Splits CSS into top-level items, respecting comments, strings and nested blocks. Each item is either
 * a statement (`@layer a, b;`) or a block `{ prelude, body }`.
 */
const parseBlocks = (css) =>
{
    const items = [];
    let index = 0;
    let start = 0;

    const skipString = (quote) =>
    {
        index += 1;
        while (index < css.length && css[index] !== quote)
        {
            if (css[index] === "\\") index += 1;
            index += 1;
        }
    };

    while (index < css.length)
    {
        const char = css[index];

        if (char === "/" && css[index + 1] === "*")
        {
            const end = css.indexOf("*/", index + 2);

            index = end === -1 ? css.length : end + 2;
            continue;
        }

        if (char === '"' || char === "'")
        {
            skipString(char);
            index += 1;
            continue;
        }

        if (char === "\\")
        {
            index += 2;
            continue;
        }

        if (char === ";")
        {
            const text = css.slice(start, index + 1).trim();

            if (text) items.push({ statement: text });
            start = index + 1;
            index += 1;
            continue;
        }

        if (char === "{")
        {
            const prelude = css.slice(start, index).trim();
            let depth = 1;
            const bodyStart = index + 1;

            index += 1;
            while (index < css.length && depth > 0)
            {
                const inner = css[index];

                if (inner === "/" && css[index + 1] === "*")
                {
                    const end = css.indexOf("*/", index + 2);

                    index = end === -1 ? css.length : end + 2;
                    continue;
                }

                if (inner === '"' || inner === "'") skipString(inner);
                else if (inner === "\\") index += 1;
                else if (inner === "{") depth += 1;
                else if (inner === "}") depth -= 1;
                index += 1;
            }

            items.push({ prelude, body: css.slice(bodyStart, index - 1) });
            start = index;
            continue;
        }

        index += 1;
    }

    const rest = css.slice(start).trim();

    if (rest && !rest.startsWith("/*")) items.push({ statement: rest });

    return items;
};

/** Splits a selector list on top-level commas. */
const splitSelectors = (prelude) =>
{
    const parts = [];
    let depth = 0;
    let start = 0;

    for (let index = 0; index < prelude.length; index += 1)
    {
        const char = prelude[index];

        if (char === "\\") index += 1;
        else if (char === "(" || char === "[") depth += 1;
        else if (char === ")" || char === "]") depth -= 1;
        else if (char === "," && depth === 0)
        {
            parts.push(prelude.slice(start, index));
            start = index + 1;
        }
    }

    parts.push(prelude.slice(start));

    return parts.map((part) => part.trim()).filter(Boolean);
};

/**
 * Class names a selector requires outside functional pseudo-classes (`:is()`, `:where()`, `:not()`,
 * `:has()` … are skipped, so the check never removes a selector that could match). `&` nesting is kept.
 */
const requiredClasses = (selector) =>
{
    const names = [];
    let depth = 0;

    for (let index = 0; index < selector.length; index += 1)
    {
        const char = selector[index];

        if (char === "\\")
        {
            index += 1;
            continue;
        }

        if (char === "(" || char === "[")
        {
            depth += 1;
            continue;
        }

        if (char === ")" || char === "]")
        {
            depth -= 1;
            continue;
        }

        if (char === "." && depth === 0)
        {
            let name = "";
            let cursor = index + 1;

            while (cursor < selector.length)
            {
                const next = selector[cursor];

                if (next === "\\")
                {
                    name += selector[cursor + 1];
                    cursor += 2;
                    continue;
                }

                if (!/[A-Za-z0-9_-]/.test(next) && next.charCodeAt(0) < 128) break;
                name += next;
                cursor += 1;
            }

            if (name && !/^\d/.test(name)) names.push(name);
            index = cursor - 1;
        }
    }

    return names;
};

const STYLE_RULE_AT = /^@(media|supports|layer|container|scope|starting-style|document)\b/;

/**
 * Removes selectors that need a class no element of the static DOM has, then rules left without
 * selectors and at-rule blocks left empty. Keeps statements (`@layer a, b;`, `@import`), declarations,
 * `@property`, `@keyframes`, `@font-face` and every rule without class requirements (`:root`, `.dark`
 * because `dark` counts as used).
 */
const trimCss = (css, classes) =>
{
    const used = new Set(classes);

    const walk = (text) =>
    {
        const output = [];

        for (const item of parseBlocks(text))
        {
            if (item.statement)
            {
                output.push(item.statement);
                continue;
            }

            const { prelude, body } = item;

            if (prelude.startsWith("@"))
            {
                if (!STYLE_RULE_AT.test(prelude))
                {
                    output.push(`${prelude} {${body}}`);
                    continue;
                }

                const inner = walk(body);

                if (inner.trim()) output.push(`${prelude} {\n${inner}\n}`);
                continue;
            }

            const kept = splitSelectors(prelude).filter((selector) => requiredClasses(selector).every((name) => used.has(name)));

            if (kept.length === 0) continue;
            // A style rule's body may nest rules (`&:hover { … }`); trim those too, keep declarations.
            const hasNested = body.includes("{");
            const nextBody = hasNested ? walkRuleBody(body) : body;

            output.push(`${kept.join(", ")} {${nextBody}}`);
        }

        return output.join("\n");
    };

    const walkRuleBody = (body) =>
    {
        const parts = [];

        for (const item of parseBlocks(body))
        {
            if (item.statement)
            {
                parts.push(item.statement);
                continue;
            }

            const trimmed = walk(`${item.prelude} {${item.body}}`);

            if (trimmed.trim()) parts.push(trimmed);
        }

        return `\n${parts.join("\n")}\n`;
    };

    return walk(css);
};

// ---------------------------------------------------------------- fonts

const catalogFont = (id) => JSON.parse(readFileSync(join(repoRoot, "registry/fonts", `${id}.json`), "utf8"));

const roleFontIds = () =>
{
    const { fonts } = meta;
    const ids = [fonts.sans];

    if (fonts.heading && fonts.heading !== "inherit") ids.push(fonts.heading);
    if (fonts.mono && fonts.mono !== "system") ids.push(fonts.mono);

    return [...new Set(ids)];
};

const parseUnicodeRange = (value) =>
    value.split(",").map((part) =>
    {
        const [from, to] = part.trim().replace(/^U\+/i, "").split("-");

        return [parseInt(from, 16), parseInt(to ?? from, 16)];
    });

/** Pretendard and any other local font with a dynamic-subset build: the woff2 subsets the text needs. */
const localFontFaces = (font, weights, codePoints) =>
{
    const cssEntry = require.resolve(font.npm.css);
    const subsetCss = join(dirname(cssEntry), "pretendard-dynamic-subset.css");
    const available = font.weights;
    const wanted = new Set(weights.map((weight) => available.reduce((best, candidate) => (Math.abs(candidate - weight) < Math.abs(best - weight) ? candidate : best))));

    if (!existsSync(subsetCss)) throw new Error(`${font.id}: no dynamic-subset stylesheet next to ${font.npm.css}`);
    const faces = [];
    let bytes = 0;

    for (const block of readFileSync(subsetCss, "utf8").split("@font-face").slice(1))
    {
        const weight = Number(/font-weight:\s*(\d+)/.exec(block)?.[1]);
        const url = /url\((\.\/woff2-dynamic-subset\/[^)]+\.woff2)\)/.exec(block)?.[1];
        const range = /unicode-range:\s*([^;]+);/.exec(block)?.[1];

        if (!wanted.has(weight) || !url || !range) continue;
        const ranges = parseUnicodeRange(range);

        if (!codePoints.some((point) => ranges.some(([from, to]) => point >= from && point <= to))) continue;
        const data = readFileSync(join(dirname(subsetCss), url));

        bytes += data.length;
        faces.push(
            `@font-face{font-family:"${font.family}";font-style:normal;font-weight:${weight};font-display:swap;` +
                `src:url(data:font/woff2;base64,${data.toString("base64")}) format("woff2");unicode-range:${range.trim()}}`,
        );
    }

    return { faces, bytes, weights: [...wanted].sort() };
};

const fontAssets = (weights, codePoints, families) =>
{
    const google = [];
    const faces = [];
    const report = [];

    for (const id of roleFontIds())
    {
        const font = catalogFont(id);
        const inStack = families.some((stack) => stack.split(",").map((name) => name.trim().replace(/^["']|["']$/g, "")).includes(font.family));

        if (font.provider === "google")
        {
            const [min, max] = [Math.min(...font.weights), Math.max(...font.weights)];
            const request = [...new Set(weights.map((weight) => Math.min(max, Math.max(min, weight))))].sort((a, b) => a - b);

            google.push(`family=${font.family.replaceAll(" ", "+")}:wght@${request.join(";")}`);
            report.push({ id, family: font.family, source: "google", weights: request, inStack });
        }
        else
        {
            const local = localFontFaces(font, weights, codePoints);

            faces.push(...local.faces);
            report.push({ id, family: font.family, source: "inline", weights: local.weights, subsets: local.faces.length, bytes: local.bytes, inStack });
        }
    }

    const link = google.length ? `https://fonts.googleapis.com/css2?${google.join("&")}&display=swap` : null;

    return { link, faces, report };
};

// ---------------------------------------------------------------- artboard

const escapeAttribute = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");

const buildArtboard = ({ html, styles, css, fonts, bodyBackground }) =>
{
    const inner = mode === "dark" ? `<div class="dark">${html}</div>` : html;
    const styleText = [
        css,
        ...fonts.faces,
        ...styles,
        `body{margin:0;background:${bodyBackground}}`,
        "a{color:inherit;text-decoration:none}",
        "a:hover{text-decoration:underline}",
    ].join("\n").replaceAll("</style", "<\\/style");

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
${fonts.link ? `  <link rel="stylesheet" href="${escapeAttribute(fonts.link)}">\n` : ""}  <style>
${styleText}
  </style>
</helmet>
${inner}
</x-dc>
</body>
</html>
`;
};

// ---------------------------------------------------------------- verification

const MEASURE = {
    "window w": ["[data-template]", "width"],
    "window h": ["[data-template]", "height"],
    "primary button h": ["[data-template] .cn-button-variant-default", "height"],
    "outline button h": ["[data-template] .cn-button-variant-outline", "height"],
    "select trigger h": ["[data-template] .cn-select-trigger", "height"],
    "table row h": ["[data-template] .cn-table-body tr", "height"],
    "table head h": ["[data-template] .cn-table-header tr", "height"],
    "sidebar w": ["[data-template] [data-slot=sidebar]", "width"],
    "sidebar item h": ["[data-template] .cn-sidebar-menu-button:not([data-active])", "height"],
    "tag h": ["[data-template] .cn-badge[data-tone]", "height"],
    "company font-family": ["[data-template] .crm-company", "fontFamily"],
    "company font-size": ["[data-template] .crm-company", "fontSize"],
    "title font-weight": ["[data-template] .crm-page-title", "fontWeight"],
    "primary background": ["[data-template] .cn-button-variant-default", "backgroundColor"],
};

const measure = async (page) =>
{
    const values = await page.evaluate((spec) =>
        Object.fromEntries(
            Object.entries(spec).map(([label, [selector, property]]) =>
            {
                const element = document.querySelector(selector);

                if (!element) return [label, "(missing)"];
                if (property === "width" || property === "height") return [label, Math.round(element.getBoundingClientRect()[property] * 100) / 100];

                return [label, getComputedStyle(element)[property]];
            }),
        ), MEASURE);
    // The font the text is actually drawn with (a missing web font shows up as a platform fallback).
    const session = await page.context().newCDPSession(page);

    await session.send("DOM.enable");
    await session.send("CSS.enable");
    const { root } = await session.send("DOM.getDocument", { depth: -1 });
    const rendered = {};

    for (const [label, selector] of [["company rendered font", "[data-template] .crm-company"], ["title rendered font", "[data-template] .crm-page-title"]])
    {
        const { nodeId } = await session.send("DOM.querySelector", { nodeId: root.nodeId, selector });

        if (!nodeId)
        {
            rendered[label] = "(missing)";
            continue;
        }

        const { fonts } = await session.send("CSS.getPlatformFontsForNode", { nodeId });

        rendered[label] = fonts.map((font) => `${font.familyName}${font.isCustomFont ? " (web)" : " (local)"}`).join(" + ");
    }

    await session.detach();

    return { ...values, ...rendered };
};

const pixelDifference = async (browser, a, b) =>
{
    const page = await browser.newPage();
    const result = await page.evaluate(async ([first, second]) =>
    {
        const load = (src) => new Promise((done, fail) =>
        {
            const image = new Image();

            image.onload = () => done(image);
            image.onerror = fail;
            image.src = src;
        });
        const [one, two] = await Promise.all([load(first), load(second)]);
        const width = Math.max(one.width, two.width);
        const height = Math.max(one.height, two.height);
        const draw = (image) =>
        {
            const canvas = new OffscreenCanvas(width, height);
            const context = canvas.getContext("2d");

            context.drawImage(image, 0, 0);

            return context.getImageData(0, 0, width, height).data;
        };
        const [x, y] = [draw(one), draw(two)];
        let differing = 0;

        for (let index = 0; index < x.length; index += 4)
        {
            if (Math.abs(x[index] - y[index]) > 16 || Math.abs(x[index + 1] - y[index + 1]) > 16 || Math.abs(x[index + 2] - y[index + 2]) > 16) differing += 1;
        }

        return { size: [one.width, one.height, two.width, two.height], share: differing / (width * height) };
    }, [`data:image/png;base64,${a.toString("base64")}`, `data:image/png;base64,${b.toString("base64")}`]);

    await page.close();

    return result;
};

// ---------------------------------------------------------------- main

const server = await startPreview();
const browser = await chromium.launch();

try
{
    const viewport = { width: 1600, height: 1200 };
    const page = await browser.newPage({ viewport });
    const url = `${origin}/?system=${system}&mode=${mode}&template=${template}&motion=off`;

    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const selector = `[data-template="${template}"]`;

    await page.waitForSelector(selector);
    const page1 = await page.evaluate(collect, selector);

    if (page1.missing) throw new Error(`${url}: no ${selector}`);
    if (page1.banner) throw new Error(`${url}: the preview on port ${port} was started for another system`);

    const rawCss = readFileSync(cssPath, "utf8");
    // Comments go first: none of them carries meaning in the built file, and the trimmer then never
    // mistakes one for part of a selector.
    const bareCss = rawCss.replace(/\/\*[\s\S]*?\*\//g, "");
    let css = flag("no-trim") ? bareCss : trimCss(bareCss, page1.classes);

    if (mode === "dark")
    {
        const before = css;

        css = css.replace(/^\.dark\s*\{/m, ":root, .dark {");
        if (css === before) throw new Error("dark mode: no top-level .dark token block found in compiled.css");
    }

    const fonts = fontAssets(page1.weights, page1.codePoints, page1.families);
    const artboard = buildArtboard({ html: page1.html, styles: page1.styles, css, fonts, bodyBackground: page1.bodyBackground });

    if (/data-dc-script|\{\{|<sc-for/.test(artboard)) throw new Error("artboard contains dynamic canvas markup");
    mkdirSync(outDir, { recursive: true });
    const file = resolve(outDir, fileName);

    writeFileSync(file, artboard);

    const report = {
        file,
        system,
        mode,
        template,
        bytes: Buffer.byteLength(artboard),
        w: page1.w,
        h: page1.h,
        css: { compiled: Buffer.byteLength(rawCss), kept: Buffer.byteLength(css) },
        fonts: fonts.report,
        weights: page1.weights,
    };

    if (report.bytes > 1.5 * 1024 * 1024) report.warning = "artboard is larger than 1.5 MB";

    const sizes = arg("sizes");

    if (sizes)
    {
        const current = existsSync(sizes) ? JSON.parse(readFileSync(sizes, "utf8")) : {};

        current[fileName] = { w: page1.w, h: page1.h };
        writeFileSync(sizes, `${JSON.stringify(current, null, 2)}\n`);
    }

    const shots = arg("verify");

    if (shots)
    {
        mkdirSync(shots, { recursive: true });
        const previewShot = await page.locator(selector).screenshot({ path: join(shots, `${system}-preview.png`) });
        const previewValues = await measure(page);
        const dcPage = await browser.newPage({ viewport });

        await dcPage.goto(pathToFileURL(file).href, { waitUntil: "load" });
        await dcPage.waitForLoadState("networkidle").catch(() => {});
        await dcPage.evaluate(() => document.fonts.ready);
        const dcShot = await dcPage.locator(selector).screenshot({ path: join(shots, `${system}-dc.png`) });
        const dcValues = await measure(dcPage);

        report.verify = {
            pixels: await pixelDifference(browser, previewShot, dcShot),
            values: Object.fromEntries(Object.keys(previewValues).map((key) => [key, { preview: previewValues[key], dc: dcValues[key], same: previewValues[key] === dcValues[key] }])),
        };
        await dcPage.close();
    }

    console.log(JSON.stringify(report, null, 2));
}
finally
{
    await browser.close();
    stopPreview(server);
}
