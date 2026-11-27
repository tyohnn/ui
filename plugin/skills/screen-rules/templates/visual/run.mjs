#!/usr/bin/env node

/**
 * Photographs every screen of each app and compares with the baseline (`visual.spec.ts`).
 *
 *   node scripts/visual/run.mjs --update web   # before a change: take a new baseline
 *   node scripts/visual/run.mjs web            # after it: compare with the baseline
 *
 * With no app named, every app in PORTS. Photos go to `VISUAL_DIR` (default `~/visual`); a screen that differs leaves
 * baseline, now and diff in `<VISUAL_DIR>/_results/<app>/`.
 *
 * - Stop the app's server first. The app's config reuses a running server, so a stale build would be photographed
 *   and reported unchanged. With it stopped, Playwright rebuilds with `npm run build && npm run start`.
 * - Any process holding the app's port is killed (`fuser -k`), including a dev server or e2e in another terminal.
 * - Baseline and comparison use the same data (seed). Do not rebuild the database in between.
 */

import { execSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/** The server port each app's Playwright config starts; whatever holds it is stopped first */
const PORTS = {
    web: [3000],
};

const args = process.argv.slice(2);
const update = args.includes("--update");
const apps = args.filter((arg) => !arg.startsWith("--"));
const targets = apps.length > 0 ? apps : Object.keys(PORTS);
const dir = process.env.VISUAL_DIR ?? join(homedir(), "visual");
const root = join(import.meta.dirname, "..", "..");

const chromium = () =>
{
    if (process.env.PLAYWRIGHT_CHROMIUM_PATH)
    {
        return process.env.PLAYWRIGHT_CHROMIUM_PATH;
    }

    const base = "/opt/pw-browsers";

    if (!existsSync(base))
    {
        return undefined;
    }

    const build = readdirSync(base).find((name) => /^chromium-\d+$/.test(name));
    const path = build === undefined ? undefined : join(base, build, "chrome-linux64", "chrome");

    return path !== undefined && existsSync(path) ? path : undefined;
};

const results = [];

for (const app of targets)
{
    if (!(app in PORTS))
    {
        console.error(`unknown app: ${app}`);
        process.exit(2);
    }

    for (const port of PORTS[app])
    {
        try
        {
            execSync(`fuser -k ${port}/tcp`, { stdio: "ignore" });
        }
        catch
        {
            // fuser exits with 1 when nothing holds the port
        }
    }

    const executable = chromium();
    const run = spawnSync(
        "npx",
        ["playwright", "test", "-c", "../../scripts/visual/visual.config.ts", ...(update ? ["--update-snapshots"] : [])],
        {
            cwd: join(root, "apps", app),
            stdio: "inherit",
            env: {
                ...process.env,
                VISUAL_APP: app,
                VISUAL_DIR: dir,
                ...(executable === undefined ? {} : { PLAYWRIGHT_CHROMIUM_PATH: executable }),
            },
        },
    );

    results.push({ app, ok: run.status === 0 });
}

console.log("");
results.forEach(({ app, ok }) => console.log(`${ok ? "✓" : "✗"} ${app}${ok ? "" : `  → ${join(dir, "_results", app)}`}`));
process.exit(results.every(({ ok }) => ok) ? 0 : 1);
