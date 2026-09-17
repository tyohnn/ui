// check-templates — does every preview template render with every system, in both modes?
//
// A render check, not a value comparison (compare-blocks.mjs and compare-shadcn.mjs compare values). For each
// template of apps/preview/src/templates/catalog.ts × system × mode it opens `?system=&mode=&template=` at the
// template's catalog viewport and reports
//
//   - console errors and uncaught page errors;
//   - a missing `[data-template="<id>"]` root, or one that renders (almost) nothing;
//   - horizontal overflow: the document wider than the viewport, or than the template root plus its left offset
//     (a fixed-width showcase window such as crm-dashboard is as wide as it is drawn, with its margin on both
//     sides), or content spilling out of the root itself;
//   - system-font fallback: text whose font stack starts with a web font but is drawn, in part, with a platform
//     font (CDP CSS.getPlatformFontsForNode, as export-dc --verify does, asked per text node so each text is judged by
//     its own element's font-family: an inline mono `code` in sans text is not the paragraph's fallback). Stacks that start with a platform family
//     (`mono: system`) are skipped, and glyphs a Latin web font has no outline for (⌘ ↵ and other symbols) may fall back.
//
// The preview picks fonts and icons when it starts, so it is started once per system (like check-coverage's
// procedure), on --port (default 5240), and stopped afterwards. `node tooling/build-system <systems>` runs first so
// the compiled CSS carries the templates' classes (--no-build skips it).
//
// Usage:
//   node tooling/snapshot/check-templates.mjs [--templates all|id,id] [--systems all|name,name] [--modes light,dark]
//        [--port 5240] [--shots dir] [--no-build]
//
// Screenshots (the viewport): tooling/snapshot/out/templates/<system>-<mode>/<id>.png (gitignored).
// Exit 0 when nothing is reported.

import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, readdirSync } from "node:fs";
import { get } from "node:http";
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

// Node strips the catalog's types (a plain TS module with no imports).
const { TEMPLATE_CATALOG } = await import(pathToFileURL(join(repoRoot, "apps/preview/src/templates/catalog.ts")).href);
const knownSystems = readdirSync(join(repoRoot, "registry/systems")).sort();

const templatesArg = arg("templates", "all");
const systemsArg = arg("systems", "all");
const templates = templatesArg === "all" ? TEMPLATE_CATALOG : list(templatesArg).map((id) => TEMPLATE_CATALOG.find((entry) => entry.id === id) ?? id);
const systems = systemsArg === "all" ? knownSystems : list(systemsArg);
const modes = list(arg("modes", "light,dark")).map((mode) => (mode === "dark" ? "dark" : "light"));
const port = Number(arg("port", "5240"));
const origin = `http://localhost:${port}`;
const shotsRoot = arg("shots", join(repoRoot, "tooling/snapshot/out/templates"));

const unknown = [...templates.filter((entry) => typeof entry === "string"), ...systems.filter((name) => !knownSystems.includes(name))];

if (unknown.length)
{
    console.error(`unknown template or system: ${unknown.join(", ")}\n  templates: ${TEMPLATE_CATALOG.map((entry) => entry.id).join(", ")}\n  systems: ${knownSystems.join(", ")}`);
    process.exit(2);
}

if (!process.argv.includes("--no-build"))
{
    const build = spawnSync(process.execPath, [join(repoRoot, "tooling/build-system"), ...systems], { stdio: ["ignore", "ignore", "inherit"] });

    if (build.status !== 0) process.exit(build.status ?? 1);
}

// node:http rather than fetch: after many preview restarts, fetch's socket setup threw an uncatchable
// `setTypeOfService EINVAL` on macOS (Node 24) and ended the run.
const reachable = () => new Promise((done) =>
{
    const request = get(origin, (response) =>
    {
        response.resume();
        done(response.statusCode === 200);
    });

    request.on("error", () => done(false));
    request.setTimeout(2000, () => request.destroy());
});

const startPreview = async (system) =>
{
    if (await reachable()) throw new Error(`port ${port} is in use; stop that server or pass --port`);

    const child = spawn(process.execPath, ["scripts/vite-system.mjs", "--port", String(port), "--strictPort"], {
        cwd: join(repoRoot, "apps/preview"),
        env: { ...process.env, SYSTEM: system },
        stdio: ["ignore", "ignore", "pipe"],
        detached: true,
    });
    let stderr = "";

    child.stderr.on("data", (chunk) => (stderr += chunk));

    for (let attempt = 0; attempt < 160; attempt += 1)
    {
        if (child.exitCode !== null) throw new Error(`preview exited (${child.exitCode}): ${stderr.slice(-400)}`);
        if (await reachable()) return child;
        await new Promise((done) => setTimeout(done, 250));
    }

    process.kill(-child.pid, "SIGTERM");
    throw new Error("preview did not start within 40s");
};

const stopPreview = async (child) =>
{
    try
    {
        process.kill(-child.pid, "SIGTERM");
    }
    catch
    {
        // already gone
    }

    for (let attempt = 0; attempt < 40 && (await reachable()); attempt += 1) await new Promise((done) => setTimeout(done, 250));
};

/** Runs in the page: root, overflow and the text elements whose fonts are checked (marked data-font-probe). */
const inspectInPage = (id) =>
{
    const root = document.querySelector(`[data-template="${id}"]`);

    if (!root) return { missing: true };

    const box = root.getBoundingClientRect();
    const PLATFORM = /^(ui-monospace|ui-sans-serif|ui-serif|system-ui|-apple-system|sfmono-regular|menlo|monaco|consolas|liberation mono|courier new|monospace|sans-serif|serif)$/i;
    const seen = new Set();
    let probes = 0;

    for (const element of root.querySelectorAll("*"))
    {
        if (element.closest("svg, style, script")) continue;

        const own = [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.nodeValue).join("").trim();

        if (!own) continue;

        const style = getComputedStyle(element);
        const first = style.fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "");

        if (PLATFORM.test(first)) continue;

        // One probe per font stack, weight, style and set of non-Latin symbols is enough.
        const symbols = own.replace(/[\u0000-\u024f\u2000-\u206f]/g, "");
        const signature = `${style.fontFamily}|${style.fontWeight}|${style.fontStyle}|${symbols}`;

        if (seen.has(signature) || probes >= 120) continue;
        seen.add(signature);
        element.setAttribute("data-font-probe", String(probes));
        probes += 1;
    }

    return {
        elements: root.querySelectorAll("*").length,
        height: Math.round(box.height),
        documentWidth: document.documentElement.scrollWidth,
        allowedWidth: Math.max(innerWidth, Math.round(box.right + Math.max(0, box.left))),
        rootOverflow: root.scrollWidth - root.clientWidth,
        banner: Boolean(document.querySelector('[data-preview-banner="system-mismatch"]')),
    };
};

/** Non-Latin symbols in a text: glyphs a webfont may leave to a platform font. The page probe uses the same range. */
const symbolCount = (text) => [...text.replace(/[\u0000-\u024f\u2000-\u206f]/g, "")].length;

// CSS.getPlatformFontsForNode on an element counts the glyphs of every descendant, so a sans paragraph holding an inline
// mono <code> (a platform stack in most systems) looked like a fallback. Each probe's own text nodes are asked instead:
// a text node's fonts are the ones its element's own font-family rendered.
const fallbackFonts = async (page) =>
{
    const session = await page.context().newCDPSession(page);
    const problems = [];

    try
    {
        await session.send("DOM.enable");
        await session.send("CSS.enable");
        const { root } = await session.send("DOM.getDocument", { depth: -1 });
        const probes = [];
        const walk = (node) =>
        {
            if (node.attributes?.includes("data-font-probe")) probes.push(node);
            (node.children ?? []).forEach(walk);
            (node.shadowRoots ?? []).forEach(walk);
            if (node.contentDocument) walk(node.contentDocument);
        };

        walk(root);

        for (const element of probes)
        {
            const fonts = new Map();
            let symbols = 0;
            let text = "";

            for (const child of element.children ?? [])
            {
                if (child.nodeType !== 3 || !child.nodeValue.trim()) continue;

                const { fonts: used } = await session.send("CSS.getPlatformFontsForNode", { nodeId: child.nodeId });

                used.filter((font) => !font.isCustomFont).forEach((font) => fonts.set(font.familyName, (fonts.get(font.familyName) ?? 0) + font.glyphCount));
                symbols += symbolCount(child.nodeValue);
                text += child.nodeValue;
            }

            const localGlyphs = [...fonts.values()].reduce((sum, count) => sum + count, 0);

            if (localGlyphs > symbols)
            {
                problems.push(`fallback font ${[...fonts].map(([family, count]) => `${family} ×${count}`).join(" + ")} for "${text.replace(/\s+/g, " ").trim().slice(0, 40)}"`);
            }
        }
    }
    finally
    {
        await session.detach();
    }

    return problems;
};

const browser = await chromium.launch();
const report = [];
let checked = 0;

try
{
    for (const system of systems)
    {
        const child = await startPreview(system);

        try
        {
            for (const mode of modes)
            {
                const shots = join(shotsRoot, `${system}-${mode}`);

                mkdirSync(shots, { recursive: true });

                for (const entry of templates)
                {
                    const page = await browser.newPage({ viewport: entry.viewport, deviceScaleFactor: 1, colorScheme: mode });
                    const problems = [];

                    page.on("console", (message) => { if (message.type() === "error") problems.push(`console: ${message.text().replace(/\s+/g, " ").slice(0, 160)}`); });
                    page.on("pageerror", (error) => problems.push(`pageerror: ${String(error).replace(/\s+/g, " ").slice(0, 160)}`));
                    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: mode });

                    try
                    {
                        await page.goto(`${origin}/?system=${system}&mode=${mode}&template=${entry.id}&motion=off`, { waitUntil: "networkidle", timeout: 90000 });
                        await page.waitForSelector(`[data-template="${entry.id}"]`, { timeout: 15000 }).catch(() => {});
                        await page.evaluate(() => document.fonts.ready);
                        await page.waitForTimeout(400);

                        const state = await page.evaluate(inspectInPage, entry.id);

                        if (state.missing) problems.push(`no [data-template="${entry.id}"] root`);
                        else
                        {
                            if (state.banner) problems.push(`the preview on ${port} was started for another system`);
                            if (state.elements < 5 || state.height < 40) problems.push(`empty root (${state.elements} elements, ${state.height}px)`);
                            if (state.documentWidth > state.allowedWidth + 1) problems.push(`horizontal overflow: document ${state.documentWidth}px > ${state.allowedWidth}px`);
                            if (state.rootOverflow > 1) problems.push(`horizontal overflow inside the root: ${state.rootOverflow}px`);
                            problems.push(...(await fallbackFonts(page)));
                        }

                        await page.screenshot({ path: join(shots, `${entry.id}.png`) });
                    }
                    catch (error)
                    {
                        problems.push(`failed: ${String(error).split("\n")[0].slice(0, 160)}`);
                    }

                    await page.close();
                    checked += 1;

                    const unique = [...new Set(problems)];

                    if (unique.length) report.push({ system, mode, template: entry.id, problems: unique });
                    console.log(`${unique.length ? "✗" : "✓"} ${system} ${mode} ${entry.id}${unique.length ? `: ${unique.length} problem(s)` : ""}`);
                }
            }
        }
        finally
        {
            await stopPreview(child);
        }
    }
}
finally
{
    await browser.close();
}

console.log(`\n${checked} renders (${templates.length} templates × ${systems.length} systems × ${modes.length} modes) · ${report.length} with problems · shots ${shotsRoot}/<system>-<mode>/`);

for (const row of report)
{
    console.log(`\n${row.system} ${row.mode} ${row.template}`);
    row.problems.slice(0, 12).forEach((problem) => console.log(`  ${problem}`));
    if (row.problems.length > 12) console.log(`  … ${row.problems.length - 12} more`);
}

process.exit(report.length ? 1 : 0);
