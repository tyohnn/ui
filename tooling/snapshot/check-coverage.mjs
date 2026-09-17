// check-coverage — does the coverage template render for a system?
//
// Not a value comparison (that is compare-shadcn.mjs): this only asks whether a system draws the whole
// template without breaking. It opens `?template=coverage`, then every section alone
// (`&section=<name>`, which opens the section's popups) and reports
//
//   - console errors and uncaught page errors,
//   - sections that render (almost) nothing,
//   - a section whose `data-coverage-portals` selector matches no element when it is opened alone.
//
// Usage:
//   node tooling/snapshot/check-coverage.mjs --system graphite [--preview http://localhost:5173]
//        [--mode light|dark] [--shots dir]
//
// Exit 0 when nothing is reported.

import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const arg = (name, fallback) =>
{
    const index = process.argv.indexOf(`--${name}`);

    return index === -1 ? fallback : process.argv[index + 1];
};

const system = arg("system");
const mode = arg("mode", "light") === "dark" ? "dark" : "light";
const origin = arg("preview", "http://localhost:5173");

if (!system)
{
    console.error("usage: check-coverage.mjs --system <name> [--preview origin] [--mode light|dark] [--shots dir]");
    process.exit(2);
}

const shots = arg("shots", join(repoRoot, "tooling/snapshot/out", `coverage-${system}-${mode}`));

mkdirSync(shots, { recursive: true });

const url = (section) => `${origin}/?system=${encodeURIComponent(system)}&mode=${mode}&motion=off&template=coverage${section ? `&section=${encodeURIComponent(section)}` : ""}`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: mode });
const problems = [];

page.on("console", (message) => { if (message.type() === "error") problems.push(`console: ${message.text().replace(/\s+/g, " ").slice(0, 160)}`); });
page.on("pageerror", (error) => problems.push(`pageerror: ${String(error).replace(/\s+/g, " ").slice(0, 160)}`));

const open = async (section) =>
{
    await page.goto(url(section), { waitUntil: "networkidle" });
    await page.evaluate((dark) => document.documentElement.classList.toggle("dark", dark), mode === "dark");
    await page.waitForSelector('[data-specimen="coverage"]');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(section ? 250 : 800);
};

await page.emulateMedia({ reducedMotion: "reduce", colorScheme: mode });
await open(null);

const sections = await page.$$eval("[data-coverage-section]", (nodes) => nodes.map((node) => ({
    name: node.getAttribute("data-coverage-section"),
    components: (node.getAttribute("data-coverage-components") ?? "").split(" ").filter(Boolean),
    portals: (node.getAttribute("data-coverage-portals") ?? "").split("|").filter(Boolean),
    elements: node.querySelectorAll("*").length,
    height: Math.round(node.getBoundingClientRect().height),
})));

await page.screenshot({ path: join(shots, "all-sections.png"), fullPage: true });

for (const section of sections)
{
    // A section that only shows a popup trigger is two or three elements tall; nothing at all is a bug.
    if (section.elements < 2 || section.height < 8) problems.push(`empty section: ${section.name} (${section.elements} elements, ${section.height}px)`);
}

let withPopups = 0;

for (const section of sections)
{
    if (section.portals.length === 0) continue;
    await open(section.name);
    withPopups += 1;

    // `<selector>^<n>` measures the n-th ancestor of the match; only the selector part is looked up here.
    const counts = await page.evaluate((list) => list.map((selector) => document.querySelectorAll(selector.replace(/\^\d+$/, "")).length), section.portals);

    section.portals.forEach((selector, index) =>
    {
        if (counts[index] === 0) problems.push(`section ${section.name}: no element for portal ${selector}`);
    });

    await page.screenshot({ path: join(shots, `${section.name}.png`) });
}

await browser.close();

const components = new Set(sections.flatMap((section) => section.components));

console.log(`${system} coverage (${mode}): ${sections.length} sections · ${components.size} components · ${withPopups} with popups · shots ${shots}`);

if (problems.length)
{
    console.log(`\n${problems.length} problems:`);
    [...new Set(problems)].slice(0, 40).forEach((line) => console.log(`  ${line}`));
}
else console.log("no console errors, no page errors, no empty sections, every popup present");

process.exit(problems.length ? 1 : 0);
