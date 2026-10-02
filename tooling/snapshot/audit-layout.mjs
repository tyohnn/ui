// audit-layout — what is each screen's layout made of?
//
// Not a check: it reports. For every screen template (or any page given with --url) it measures the layer above
// the components — the layer no system owns today — at several widths:
//
//   - shell: the sidebars (side, variant, collapsible, drawn width) and the inset's header (height, what it holds);
//   - content: the box under the header — padding, gap, direction, and whether it is as tall as the viewport;
//   - title: the h1's size and family, its distance from the inset's edge (the gutter a reader sees), and whether
//     a description and actions sit with it;
//   - panes: a row of two or more tall boxes (list + detail, canvas + inspector), with their widths;
//   - measure: a centred column narrower than its parent (a reading width);
//   - scroll owners: every element that actually scrolls, with the share of the inset it covers, and whether the
//     document itself scrolls;
//   - sticky elements, and horizontal overflow of the page.
//
// The output is the evidence for the frame contract (registry/frames/README.md): a frame is adopted when two or
// more screens share an arrangement, and these numbers say which do.
//
// The preview must be running (it is started per system, see check-coverage.mjs).
//
// Usage:
//   node tooling/snapshot/audit-layout.mjs [--preview http://localhost:5173] [--system mira]
//        [--templates all|id,id] [--widths 1440,768,390] [--json file]
//   node tooling/snapshot/audit-layout.mjs --url http://localhost:3000/a,http://localhost:3000/b [--widths …]

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { chromium } from "@playwright/test";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const arg = (name, fallback) =>
{
    const index = process.argv.indexOf(`--${name}`);

    return index === -1 ? fallback : process.argv[index + 1];
};
const list = (value) => value.split(",").map((item) => item.trim()).filter(Boolean);

const origin = arg("preview", "http://localhost:5173");
const system = arg("system", "mira");
const widths = list(arg("widths", "1440,768,390")).map(Number);
const urls = arg("url");
const jsonFile = arg("json");

const { TEMPLATE_CATALOG } = await import(pathToFileURL(join(repoRoot, "apps/preview/src/templates/catalog.ts")).href);
const templatesArg = arg("templates", "all");
const screens = TEMPLATE_CATALOG.filter((entry) => entry.kind === "screen" && entry.built !== false && (templatesArg === "all" || list(templatesArg).includes(entry.id)));

const targets = urls
    ? list(urls).map((url) => ({ id: new URL(url).pathname, url }))
    : screens.map((entry) => ({ id: entry.id, url: `${origin}/?system=${encodeURIComponent(system)}&mode=light&motion=off&template=${entry.id}` }));

/** Runs in the page. Everything is measured from the DOM as drawn; nothing is read from source. */
const measure = () =>
{
    const style = (element) => getComputedStyle(element);
    const rect = (element) => element.getBoundingClientRect();
    const px = (value) => Math.round(parseFloat(value) || 0);
    const drawn = (element) =>
    {
        const box = rect(element);

        return box.width > 1 && box.height > 1 && style(element).visibility !== "hidden" && style(element).display !== "none";
    };
    const name = (element) => element.getAttribute("data-slot") ?? element.getAttribute("role") ?? (element.id ? `#${element.id}` : element.tagName.toLowerCase());

    const root = document.querySelector("[data-template]") ?? document.body;
    const inset = root.querySelector('[data-slot="sidebar-inset"]') ?? root.querySelector("main") ?? root;
    const insetBox = rect(inset);

    // Shell
    const sidebars = [...root.querySelectorAll('[data-slot="sidebar"]')]
        .filter((element) => !element.parentElement.closest('[data-slot="sidebar"]') && drawn(element))
        .map((element) =>
        {
            const holder = element.matches("[data-side]") ? element : element.closest("[data-side]") ?? element;
            const box = rect(element.querySelector('[data-slot="sidebar-container"]') ?? element);

            return { side: holder.getAttribute("data-side") ?? "left", variant: holder.getAttribute("data-variant") ?? "sidebar", collapsible: holder.getAttribute("data-collapsible") || "none", width: Math.round(box.width) };
        });
    const header = [...inset.querySelectorAll("header")].find((element) => drawn(element) && rect(element).top - insetBox.top < 8) ?? null;
    const headerFacts = header && {
        height: Math.round(rect(header).height),
        border: px(style(header).borderBottomWidth) > 0,
        sticky: style(header).position === "sticky",
        holds: [
            header.querySelector('[data-slot="sidebar-trigger"]') && "trigger",
            header.querySelector('[data-slot="breadcrumb"]') && "breadcrumb",
            header.querySelector("h1") && "title",
            header.querySelector('input, [data-slot="input-group"]') && "search",
            [...header.querySelectorAll("button, a")].filter((element) => drawn(element) && !element.closest('[data-slot="breadcrumb"]') && !element.matches('[data-slot="sidebar-trigger"]')).length > 0 && "actions",
        ].filter(Boolean),
    };

    // Content: the first drawn box under the header that is not the header.
    const content = [...inset.children].find((element) => element !== header && drawn(element) && !["STYLE", "SCRIPT"].includes(element.tagName)) ?? inset;
    const contentStyle = style(content);
    const contentBox = rect(content);
    const contentFacts = {
        padding: [contentStyle.paddingTop, contentStyle.paddingRight, contentStyle.paddingBottom, contentStyle.paddingLeft].map(px).join(" "),
        gap: contentStyle.rowGap === "normal" ? 0 : px(contentStyle.rowGap),
        direction: contentStyle.display.includes("flex") ? contentStyle.flexDirection : contentStyle.display,
        fillsViewport: Math.abs(contentBox.bottom - window.innerHeight) < 2 && px(contentStyle.height) > 0 && content.scrollHeight <= content.clientHeight + 1,
        children: [...content.children].filter(drawn).length,
    };

    // Title
    const h1 = [...root.querySelectorAll("h1")].find(drawn) ?? null;
    const titleRow = h1 && (h1.parentElement.children.length > 1 ? h1.parentElement : h1.parentElement.parentElement);
    const titleFacts = h1 && {
        size: px(style(h1).fontSize),
        family: style(h1).fontFamily.split(",")[0].replace(/"/g, "").trim(),
        inHeader: Boolean(header && header.contains(h1)),
        // The gutter as a reader sees it: from the inset's edge to the title's left edge.
        gutter: Math.round(rect(h1).left - insetBox.left),
        description: Boolean(h1.nextElementSibling && drawn(h1.nextElementSibling) && h1.nextElementSibling.textContent.trim().length > 0),
        actions: titleRow ? [...titleRow.querySelectorAll("button, a")].filter(drawn).length : 0,
    };

    // Panes: the widest row of two or more boxes that are each at least 60% of the content's height.
    let panes = [];
    const walk = (element, depth) =>
    {
        if (depth > 4) return;

        const kids = [...element.children].filter(drawn);
        const row = kids.filter((kid) => rect(kid).height >= contentBox.height * 0.6 && rect(kid).width >= 160);
        const sideBySide = row.length >= 2 && row.every((kid, index) => index === 0 || rect(kid).left >= rect(row[index - 1]).right - 1);

        if (sideBySide && row.length > panes.length) panes = row.map((kid) => Math.round(rect(kid).width));
        for (const kid of kids) walk(kid, depth + 1);
    };

    walk(content, 0);

    // Measure: a centred box noticeably narrower than its parent.
    let measureWidth = null;

    for (const element of content.querySelectorAll("*"))
    {
        if (!drawn(element) || style(element).maxWidth === "none") continue;

        const box = rect(element);
        const parent = rect(element.parentElement);
        const centred = Math.abs((box.left - parent.left) - (parent.right - box.right)) < 4;

        if (centred && parent.width - box.width > 80 && box.width > 320 && box.height > contentBox.height * 0.4)
        {
            measureWidth = Math.round(box.width);
            break;
        }
    }

    // Scroll owners
    const scrollers = [];

    for (const element of inset.querySelectorAll("*"))
    {
        if (!drawn(element)) continue;

        const elementStyle = style(element);
        const y = ["auto", "scroll"].includes(elementStyle.overflowY) && element.scrollHeight > element.clientHeight + 1;
        const x = ["auto", "scroll"].includes(elementStyle.overflowX) && element.scrollWidth > element.clientWidth + 1;

        if (!x && !y) continue;

        const box = rect(element);

        scrollers.push({ what: name(element), axis: `${x ? "x" : ""}${y ? "y" : ""}`, share: Math.round((box.width * box.height) / (insetBox.width * insetBox.height) * 100) });
    }

    const sticky = [...inset.querySelectorAll("*")].filter((element) => drawn(element) && style(element).position === "sticky").map(name);

    return {
        shell: { sidebars, header: headerFacts },
        content: contentFacts,
        title: titleFacts,
        panes,
        measure: measureWidth,
        scroll: { document: document.documentElement.scrollHeight > window.innerHeight + 1, owners: scrollers.sort((a, b) => b.share - a.share).slice(0, 5) },
        sticky: [...new Set(sticky)],
        overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
};

const browser = await chromium.launch();
const report = [];

for (const target of targets)
{
    const entry = { id: target.id, widths: {} };

    for (const width of widths)
    {
        const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });

        await page.goto(target.url, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(300);
        entry.widths[width] = await page.evaluate(measure);
        await page.close();
    }

    report.push(entry);
}

await browser.close();

const sidebarText = (sidebars) => (sidebars.length === 0 ? "none" : sidebars.map((sidebar) => `${sidebar.side} ${sidebar.variant}/${sidebar.collapsible} ${sidebar.width}`).join(" + "));

for (const entry of report)
{
    console.log(`\n${entry.id}`);

    for (const [width, facts] of Object.entries(entry.widths))
    {
        const { shell, content, title, panes, scroll } = facts;

        console.log(`  ${String(width).padStart(4)}  shell ${sidebarText(shell.sidebars)} · header ${shell.header ? `${shell.header.height}${shell.header.border ? " border" : ""} [${shell.header.holds.join(" ")}]` : "none"}`);
        console.log(`        content pad ${content.padding} · gap ${content.gap} · ${content.direction}${content.fillsViewport ? " · fills viewport" : ""} · ${content.children} children`);
        console.log(`        title ${title ? `${title.size}px ${title.family} at ${title.gutter}${title.inHeader ? " (in header)" : ""}${title.description ? " + description" : ""}${title.actions ? ` + ${title.actions} actions` : ""}` : "none"} · panes ${panes.length ? panes.join(" | ") : "—"} · measure ${facts.measure ?? "—"}`);
        console.log(`        scroll ${scroll.document ? "document" : "contained"}${scroll.owners.length ? `: ${scroll.owners.map((owner) => `${owner.what} ${owner.axis} ${owner.share}%`).join(", ")}` : ""}${facts.sticky.length ? ` · sticky ${facts.sticky.join(", ")}` : ""}${facts.overflowX ? " · PAGE OVERFLOWS X" : ""}`);
    }
}

if (jsonFile)
{
    writeFileSync(jsonFile, `${JSON.stringify(report, null, 4)}\n`);
    console.log(`\nwrote ${jsonFile}`);
}
