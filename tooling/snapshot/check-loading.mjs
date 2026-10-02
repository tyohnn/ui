// check-loading — does a template's waiting face keep the frame it has with the data?
//
// A block that is `loading` (registry/blocks/lib/pending.tsx) swaps its values for bars and marks its frame
// `data-loading`. For each template × system this opens the template with `?loading` (apps/preview/src/templates/
// loading.ts), takes the box of every `data-loading` frame, then opens it without and measures the same elements
// (found again by their path from the template root). A frame whose box moved or changed size by more than
// --tolerance px (default 0.5) is reported: the screen would jump when the data arrives.
//
// Usage:
//   node tooling/snapshot/check-loading.mjs --templates id,id [--systems all|name,name] [--port 5245] [--tolerance 0.5]
//        [--shots dir] [--no-build]
//
// --shots writes the waiting faces: <dir>/<system>/<id>.png. Exit 0 when nothing is reported; a template with no
// `data-loading` frame at all is reported too.

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
const { TEMPLATE_CATALOG } = await import(pathToFileURL(join(repoRoot, "apps/preview/src/templates/catalog.ts")).href);
const knownSystems = readdirSync(join(repoRoot, "registry/systems")).sort();
const templates = list(arg("templates", "")).map((id) => TEMPLATE_CATALOG.find((entry) => entry.id === id) ?? id);
const systemsArg = arg("systems", "vega,cirrus,clover,lyra,nocturne");
const systems = systemsArg === "all" ? knownSystems : list(systemsArg);
const port = Number(arg("port", "5245"));
const tolerance = Number(arg("tolerance", "0.5"));
const shots = arg("shots");
const origin = `http://localhost:${port}`;
const unknown = [...templates.filter((entry) => typeof entry === "string"), ...systems.filter((name) => !knownSystems.includes(name))];

if (!templates.length || unknown.length)
{
    console.error(unknown.length ? `unknown template or system: ${unknown.join(", ")}` : "usage: check-loading.mjs --templates id,id [--systems all|name,name]");
    process.exit(2);
}

if (!process.argv.includes("--no-build"))
{
    const build = spawnSync(process.execPath, [join(repoRoot, "tooling/build-system"), ...systems], { stdio: ["ignore", "ignore", "inherit"] });

    if (build.status !== 0) process.exit(build.status ?? 1);
}

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
        stdio: "ignore",
        detached: true,
    });

    for (let attempt = 0; attempt < 160; attempt += 1)
    {
        if (child.exitCode !== null) throw new Error(`preview exited (${child.exitCode})`);
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

/**
 * In the page: every data-loading frame with its path from the template root and its box. A step of the path is
 * the element's tag and data-slot with its index among the siblings of that kind, so an element that is there
 * only with the data (a selection bar, a banner) does not renumber a `data-slot` sibling after it.
 */
const framesInPage = (id) =>
{
    const root = document.querySelector(`[data-template="${id}"]`);

    if (!root) return null;

    const kind = (node) => `${node.tagName}|${node.dataset.slot ?? ""}`;

    return [...root.querySelectorAll("[data-loading]")].map((frame) =>
    {
        const path = [];

        for (let node = frame; node !== root; node = node.parentElement)
        {
            path.unshift([kind(node), [...node.parentElement.children].filter((sibling) => kind(sibling) === kind(node)).indexOf(node)]);
        }

        const box = frame.getBoundingClientRect();

        return { path, name: `${frame.tagName.toLowerCase()}${frame.dataset.slot ? `[${frame.dataset.slot}]` : ""}`, box: [box.x, box.y, box.width, box.height] };
    });
};

/** In the page: the boxes of the elements at those paths */
const boxesInPage = ([id, paths]) =>
{
    const root = document.querySelector(`[data-template="${id}"]`);
    const kind = (node) => `${node.tagName}|${node.dataset.slot ?? ""}`;

    return paths.map((path) =>
    {
        let node = root;

        for (const [wanted, index] of path) node = node && [...node.children].filter((child) => kind(child) === wanted)[index];

        const box = node?.getBoundingClientRect();

        return box ? [box.x, box.y, box.width, box.height] : null;
    });
};

const where = (frame) => frame.path.map(([, index]) => index).join(".");
const browser = await chromium.launch();
let failed = 0;
let checked = 0;

try
{
    for (const system of systems)
    {
        const child = await startPreview(system);

        try
        {
            for (const entry of templates)
            {
                const page = await browser.newPage({ viewport: entry.viewport, deviceScaleFactor: 1 });
                const url = (query) => `${origin}/?system=${system}&mode=light&template=${entry.id}&motion=off${query}`;

                await page.goto(url("&loading"), { waitUntil: "networkidle", timeout: 90000 });
                await page.evaluate(() => document.fonts.ready);

                const frames = await page.evaluate(framesInPage, entry.id);

                if (shots)
                {
                    mkdirSync(join(shots, system), { recursive: true });
                    await page.screenshot({ path: join(shots, system, `${entry.id}.png`) });
                }

                await page.goto(url(""), { waitUntil: "networkidle", timeout: 90000 });
                await page.evaluate(() => document.fonts.ready);

                const loaded = frames ? await page.evaluate(boxesInPage, [entry.id, frames.map((frame) => frame.path)]) : [];
                const problems = [];

                if (!frames?.length) problems.push("no data-loading frame: the template passes `loading` to no block");

                frames?.forEach((frame, index) =>
                {
                    const after = loaded[index];

                    if (!after)
                    {
                        problems.push(`${frame.name} (${where(frame)}): not there with the data`);

                        return;
                    }

                    const delta = frame.box.map((value, at) => Math.round((after[at] - value) * 10) / 10);

                    if (delta.some((value) => Math.abs(value) > tolerance)) problems.push(`${frame.name} (${where(frame)}): x ${delta[0]} · y ${delta[1]} · w ${delta[2]} · h ${delta[3]} px when the data arrives`);
                });

                checked += 1;
                if (problems.length) failed += 1;
                console.log(`${problems.length ? "✗" : "✓"} ${system} ${entry.id} · ${frames?.length ?? 0} frames`);
                problems.forEach((problem) => console.log(`    ${problem}`));
                await page.close();
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

console.log(`\n${checked} checks (${templates.length} templates × ${systems.length} systems) · ${failed} with a frame that moves`);
process.exit(failed ? 1 : 0);
