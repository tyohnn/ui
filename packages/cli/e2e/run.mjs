// Fixture end-to-end runs of the built CLI (not part of `npm test`: they install packages and build apps).
//
//   npm run e2e -w tyohnn                    all scenarios
//   npm run e2e -w tyohnn -- next vite       some of them (next · vite · turborepo)
//
// Each scenario copies a fixture from packages/cli/fixtures into a temporary folder and runs the CLI with
// `--source <tarball>`, the tarball being `git archive HEAD` of this repository: the same extraction path as a
// GitHub download. Then it installs, builds, serves the app on 3141–3149 and compares the component sheet with
// the preview (apps/preview on 5201) started for the same system: computed styles (tooling/snapshot/compare-computed,
// SVGs by box), icon glyph signatures, and the platform fonts Chromium actually draws with.
//
// Logs go to <work>/logs; the console gets one line per step. TYOHNN_E2E_DIR sets <work> (default: the OS temp dir).

import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const cliRoot = join(here, "..");
const repo = join(cliRoot, "../..");
const cli = join(cliRoot, "dist/index.js");
const work = process.env.TYOHNN_E2E_DIR ?? join(tmpdir(), "tyohnn-e2e");
const logs = join(work, "logs");
const cache = join(work, "cache");
const tarball = join(work, "tyohnn.tar.gz");
const PREVIEW_PORT = 5201;
const results = [];

rmSync(work, { recursive: true, force: true });
mkdirSync(logs, { recursive: true });

const env = { ...process.env, TYOHNN_CACHE_DIR: cache, NEXT_TELEMETRY_DISABLED: "1", TURBO_TELEMETRY_DISABLED: "1", FORCE_COLOR: "0", NO_COLOR: "1" };
let logIndex = 0;

const record = (scenario, step, ok, detail = "") =>
{
    results.push({ scenario, step, ok, detail });
    console.log(`${ok ? "ok  " : "FAIL"}  ${scenario.padEnd(10)} ${step}${detail ? ` — ${detail}` : ""}`);
};

/** Runs a command to completion with its output in a log file; returns { status, output, log } */
const logFile = (name) => join(logs, `${String(++logIndex).padStart(2, "0")}-${name.replace(/[^A-Za-z0-9.-]+/g, "-")}.log`);

const run = (name, command, args, cwd, extraEnv = {}) =>
{
    const log = logFile(name);
    const result = spawnSync(command, args, { cwd, env: { ...env, ...extraEnv }, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

    writeFileSync(log, `$ ${command} ${args.join(" ")}\n(cwd ${cwd})\n\n${output}`);

    return { status: result.status, output, log };
};

const tail = (output, lines = 12) => output.trimEnd().split("\n").slice(-lines).map((line) => `      ${line}`).join("\n");

const step = (scenario, name, command, args, cwd, extraEnv) =>
{
    const result = run(`${scenario}-${name}`, command, args, cwd, extraEnv);

    record(scenario, name, result.status === 0, result.status === 0 ? "" : `exit ${result.status}, log ${relative(work, result.log)}`);
    if (result.status !== 0) console.log(tail(result.output));

    return result;
};

const tyohnn = (scenario, name, args, cwd) => step(scenario, name, process.execPath, [cli, ...args, "--source", tarball], cwd);

const servers = new Set();

const waitFor = async (url, seconds = 120) =>
{
    const deadline = Date.now() + seconds * 1000;

    while (Date.now() < deadline)
    {
        try
        {
            const response = await fetch(url);

            if (response.ok) return true;
        }
        catch
        {
            // not up yet
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return false;
};

const serve = async (name, command, args, cwd, url, extraEnv = {}) =>
{
    const log = logFile(name);
    const child = spawn(command, args, { cwd, env: { ...env, ...extraEnv }, detached: true, stdio: ["ignore", "pipe", "pipe"] });
    const chunks = [];

    child.stdout.on("data", (chunk) => chunks.push(chunk));
    child.stderr.on("data", (chunk) => chunks.push(chunk));

    const stop = async () =>
    {
        servers.delete(stop);
        writeFileSync(log, Buffer.concat(chunks));

        try
        {
            process.kill(-child.pid, "SIGTERM");
        }
        catch
        {
            // already gone
        }

        await new Promise((resolve) => setTimeout(resolve, 800));
    };

    servers.add(stop);

    if (!(await waitFor(url)))
    {
        await stop();
        throw new Error(`${name} did not answer at ${url} (log ${relative(work, log)})`);
    }

    return stop;
};

const stopAll = async () =>
{
    for (const stop of [...servers]) await stop();
};

process.on("SIGINT", async () =>
{
    await stopAll();
    process.exit(130);
});

/** The preview (apps/preview) started for one system */
const preview = (system) =>
{
    if (!existsSync(join(repo, "dist/systems", system, "compiled.css"))) run(`build-system-${system}`, process.execPath, ["tooling/build-system", system], repo);

    return serve(`preview-${system}`, process.execPath, ["scripts/vite-system.mjs", "--port", String(PREVIEW_PORT), "--strictPort", "--force"], join(repo, "apps/preview"), `http://localhost:${PREVIEW_PORT}/`, { SYSTEM: system });
};

/**
 * compare-computed between an app page and the preview; plus the icon signature of both. `keepIcons` is the signature
 * the app must still draw (after `use`, which keeps the app's icon library while the preview draws the system's).
 */
const compare = (scenario, label, url, system, mode, keepIcons) =>
{
    const result = run(`${scenario}-compare-${label}`, process.execPath, [
        "tooling/snapshot/compare-computed.mjs", "--a", url, "--system", system, "--mode", mode, "--mode-a", mode,
        "--preview", `http://localhost:${PREVIEW_PORT}`, "--icons", "--label", label,
    ], repo);
    const summary = result.output.match(/elements a=\d+ b=\d+ · structural \d+ · property mismatches \d+/)?.[0] ?? "no summary";
    const icons = [...result.output.matchAll(/^icons ([ab]): (.*)$/gm)].map((match) => match[2]);
    record(scenario, `compare ${label} with preview ?system=${system}&mode=${mode}`, result.status === 0, summary);
    if (result.status !== 0) console.log(tail(result.output, 16));

    if (keepIcons) record(scenario, `icons ${label} kept (the preview draws ${system}'s library)`, icons[0] === keepIcons && icons[1] !== keepIcons, icons[0] ?? "no icon signature");
    else record(scenario, `icons ${label} match the preview`, icons.length === 2 && icons[0] === icons[1], icons[0] ?? "no icon signature");

    return { ok: result.status === 0, icons: icons[0] };
};

/** Platform fonts Chromium draws selected nodes with, on the app and on the preview */
const compareFonts = async (scenario, label, url, system, mode, expect = {}) =>
{
    const { chromium } = await import(join(repo, "node_modules/@playwright/test/index.mjs"));
    const browser = await chromium.launch();
    const selectors = { heading: '[data-slot="card-title"]', body: '[data-slot="button"]', hangul: "#tyohnn-e2e-hangul" };

    const measure = async (target) =>
    {
        const page = await browser.newPage();

        await page.goto(target, { waitUntil: "networkidle" });
        // The sheet has no Hangul text: add a line in the body font and wait for the fallback font to load.
        await page.evaluate(async () =>
        {
            const line = document.createElement("p");

            line.id = "tyohnn-e2e-hangul";
            line.textContent = "한글 대체 글꼴";
            document.body.appendChild(line);
            await document.fonts.ready;
        });
        await page.waitForTimeout(300);

        const client = await page.context().newCDPSession(page);

        await client.send("DOM.enable");
        await client.send("CSS.enable");

        const { root } = await client.send("DOM.getDocument", { depth: -1 });
        const out = {};

        for (const [role, selector] of Object.entries(selectors))
        {
            const { nodeId } = await client.send("DOM.querySelector", { nodeId: root.nodeId, selector });

            if (!nodeId)
            {
                out[role] = "(no node)";
                continue;
            }

            const { fonts } = await client.send("CSS.getPlatformFontsForNode", { nodeId });

            out[role] = fonts.map((font) => font.familyName.replace(/ Variable$/, "")).sort().join(" + ");
        }

        await page.close();

        return out;
    };

    try
    {
        const app = await measure(url);
        const reference = await measure(`http://localhost:${PREVIEW_PORT}/?system=${system}&mode=${mode}`);
        const same = Object.keys(selectors).every((role) => app[role] === reference[role]);
        const expected = Object.entries(expect).every(([role, family]) => app[role]?.includes(family));

        record(scenario, `fonts ${label} match the preview`, same && expected, Object.entries(app).map(([role, fonts]) => `${role}: ${fonts}${fonts === reference[role] ? "" : ` (preview ${reference[role]})`}`).join(" · "));
    }
    finally
    {
        await browser.close();
    }
};

const IGNORED = new Set(["node_modules", ".next", ".turbo", "dist", "next-env.d.ts", ".git"]);

const treeHash = (root) =>
{
    const hash = createHash("sha256");
    const walk = (dir) =>
    {
        for (const entry of readdirSync(dir).sort())
        {
            if (IGNORED.has(entry) || entry.endsWith(".tsbuildinfo")) continue;

            const path = join(dir, entry);

            if (statSync(path).isDirectory()) walk(path);
            else hash.update(`${relative(root, path)}\0`).update(readFileSync(path)).update("\0");
        }
    };

    walk(root);

    return hash.digest("hex").slice(0, 16);
};

const copyFixture = (name) =>
{
    const target = join(work, name);

    cpSync(join(cliRoot, "fixtures", name), target, { recursive: true });

    return target;
};

const lucideCount = async (url) => ((await (await fetch(url)).text()).match(/class="lucide /g) ?? []).length;

// Scenarios

const scenarios = {
    async next()
    {
        const s = "next";
        const app = copyFixture("next-app");

        if (tyohnn(s, "init --system vega", ["init", "--system", "vega", "--yes", "--example", "component-sheet"], app).status !== 0) return;

        const first = treeHash(app);

        tyohnn(s, "init again", ["init", "--system", "vega", "--yes", "--example", "component-sheet"], app);
        record(s, "second init changes nothing", treeHash(app) === first, first);

        if (step(s, "next build", "npm", ["run", "build"], app).status !== 0) return;
        step(s, "tsc --noEmit", "npx", ["tsc", "--noEmit"], app);

        const afterBuild = treeHash(app);

        tyohnn(s, "init after build", ["init", "--system", "vega", "--yes", "--example", "component-sheet"], app);
        record(s, "init after build changes nothing", treeHash(app) === afterBuild);
        tyohnn(s, "doctor", ["doctor"], app);

        const stopApp = await serve("next-start", "npm", ["run", "start"], app, "http://localhost:3141/tyohnn/component-sheet");
        const stopPreview = await preview("vega");

        try
        {
            compare(s, "vega", "http://localhost:3141/tyohnn/component-sheet", "vega", "dark");
            await compareFonts(s, "vega", "http://localhost:3141/tyohnn/component-sheet", "vega", "dark", { heading: "Inter", hangul: "Pretendard" });
        }
        finally
        {
            await stopPreview();
            await stopApp();
        }
    },

    async vite()
    {
        const s = "vite";
        const app = copyFixture("vite-app");

        if (tyohnn(s, "init --system sera", ["init", "--system", "sera", "--yes", "--example", "component-sheet"], app).status !== 0) return;

        const first = treeHash(app);

        tyohnn(s, "init again", ["init", "--system", "sera", "--yes", "--example", "component-sheet"], app);
        record(s, "second init changes nothing", treeHash(app) === first, first);

        writeFileSync(join(app, "src/App.tsx"), 'import { ComponentSheet } from "./tyohnn/component-sheet";\n\nfunction App() {\n  return <ComponentSheet />\n}\n\nexport default App\n');

        if (step(s, "tsc -b && vite build", "npm", ["run", "build"], app).status !== 0) return;
        tyohnn(s, "doctor", ["doctor"], app);

        const stopApp = await serve("vite-preview", "npm", ["run", "preview"], app, "http://localhost:3142/");
        const stopPreview = await preview("sera");

        try
        {
            compare(s, "sera", "http://localhost:3142/", "sera", "light");
            await compareFonts(s, "sera", "http://localhost:3142/", "sera", "light", { heading: "Playfair Display", body: "Noto Sans", hangul: "Pretendard" });
        }
        finally
        {
            await stopPreview();
            await stopApp();
        }
    },

    async turborepo()
    {
        const s = "turborepo";
        const root = copyFixture("turborepo");
        const crm = "http://localhost:3143/tyohnn/component-sheet";
        const admin = "http://localhost:3144/tyohnn/component-sheet";

        if (tyohnn(s, "init graphite --app apps/crm", ["init", "--system", "graphite", "--app", "apps/crm", "--scope", "@acme", "--yes", "--example", "component-sheet"], root).status !== 0) return;
        if (tyohnn(s, "add mira --app apps/admin --icons hugeicons", ["add", "mira", "--app", "apps/admin", "--icons", "hugeicons", "--yes", "--example", "component-sheet"], root).status !== 0) return;

        const first = treeHash(root);

        tyohnn(s, "init again (crm)", ["init", "--system", "graphite", "--app", "apps/crm", "--scope", "@acme", "--yes", "--example", "component-sheet"], root);
        record(s, "second init changes nothing", treeHash(root) === first, first);

        if (step(s, "turbo build (both apps)", "npx", ["turbo", "run", "build"], root).status !== 0) return;
        step(s, "turbo typecheck", "npx", ["turbo", "run", "typecheck"], root);
        tyohnn(s, "doctor --built", ["doctor", "--built"], root);

        let stopCrm = await serve("crm-start", "npm", ["run", "start", "-w", "apps/crm"], root, crm);
        let stopAdmin = await serve("admin-start", "npm", ["run", "start", "-w", "apps/admin"], root, admin);

        try
        {
            let stopPreview = await preview("graphite");

            compare(s, "crm graphite", crm, "graphite", "dark");
            await compareFonts(s, "crm graphite", crm, "graphite", "dark", { body: "Pretendard" });
            await stopPreview();

            stopPreview = await preview("mira");
            const mira = compare(s, "admin mira", admin, "mira", "light");
            await compareFonts(s, "admin mira", admin, "mira", "light", { body: "Inter" });
            await stopPreview();

            const crmLucide = await lucideCount(crm);
            const adminLucide = await lucideCount(admin);

            record(s, "apps draw different icon libraries", crmLucide > 0 && adminLucide === 0, `lucide svgs: crm ${crmLucide}, admin ${adminLucide}`);

            // use nova
            await stopAdmin();
            if (tyohnn(s, "use nova --app apps/admin", ["use", "nova", "--app", "apps/admin", "--yes"], root).status !== 0) return;
            if (step(s, "build admin (nova)", "npm", ["run", "build", "-w", "apps/admin"], root).status !== 0) return;
            tyohnn(s, "doctor after use", ["doctor"], root);
            stopAdmin = await serve("admin-start-nova", "npm", ["run", "start", "-w", "apps/admin"], root, admin);
            stopPreview = await preview("nova");
            compare(s, "admin nova", admin, "nova", "light", mira.icons);
            await compareFonts(s, "admin nova", admin, "nova", "light", { body: "Geist" });
            await stopPreview();

            // icons lucide
            await stopAdmin();
            if (tyohnn(s, "icons lucide --app apps/admin", ["icons", "lucide", "--app", "apps/admin", "--yes"], root).status !== 0) return;
            if (step(s, "build admin (lucide)", "npm", ["run", "build", "-w", "apps/admin"], root).status !== 0) return;
            stopAdmin = await serve("admin-start-lucide", "npm", ["run", "start", "-w", "apps/admin"], root, admin);

            const afterIcons = await lucideCount(admin);

            record(s, "icons lucide switches admin's icons", afterIcons > 0 && adminLucide === 0, `lucide svgs in admin: ${adminLucide} → ${afterIcons}`);
            tyohnn(s, "doctor after icons", ["doctor"], root);
        }
        finally
        {
            await stopAll();
        }
    },
};

const requested = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
const selected = requested.length ? requested : Object.keys(scenarios);

for (const name of selected) if (!scenarios[name]) throw new Error(`unknown scenario ${name} (${Object.keys(scenarios).join(", ")})`);

console.log(`work ${work}`);

const archive = spawnSync("git", ["archive", "--format=tar.gz", "--prefix=tyohnn-main/", "HEAD"], { cwd: repo, maxBuffer: 256 * 1024 * 1024 });

if (archive.status !== 0) throw new Error(`git archive failed: ${archive.stderr}`);
writeFileSync(tarball, archive.stdout);

for (const name of selected)
{
    try
    {
        await scenarios[name]();
    }
    catch (error)
    {
        record(name, "scenario", false, error.message);
    }
    finally
    {
        await stopAll();
    }
}

writeFileSync(join(work, "results.json"), `${JSON.stringify(results, null, 2)}\n`);

const failed = results.filter((row) => !row.ok);

console.log(`\n${results.length - failed.length}/${results.length} checks passed${failed.length ? `; failed: ${failed.map((row) => `${row.scenario} ${row.step}`).join(" · ")}` : ""}`);
process.exit(failed.length ? 1 : 0);
