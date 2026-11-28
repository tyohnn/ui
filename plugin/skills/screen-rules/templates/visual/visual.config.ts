import { join } from "node:path";

import { defineConfig, type PlaywrightTestConfig } from "@playwright/test";

/**
 * Takes the app's Playwright config (server, env, port) as it is and runs only the screen comparison
 * (`visual.spec.ts`). Called from the app folder as `VISUAL_APP=<app> npx playwright test -c ../../scripts/visual/visual.config.ts`
 * (`node scripts/visual/run.mjs` does this).
 *
 * - Screens behind login need a server that accepts seed accounts. With several projects, the one named `open` is
 *   used, else the first.
 */
const app = process.env.VISUAL_APP ?? "";
const dir = process.env.VISUAL_DIR ?? join(process.env.HOME ?? "/tmp", "visual");

// eslint-disable-next-line @typescript-eslint/no-require-imports -- Playwright loads configs as CommonJS, so no top-level await
const base = (require(join(process.cwd(), "playwright.config.ts")) as { default: PlaywrightTestConfig }).default;
const projects = base.projects ?? [];
const open = projects.find((project) => project.name === "open") ?? projects[0];

// webServer commands run in the config file's folder; this file sits outside the app, so pass the app folder
const servers = base.webServer === undefined ? [] : [base.webServer].flat();
const webServer = servers.map((server) => ({ ...server, cwd: server.cwd ?? process.cwd(), timeout: 900_000 }));

export default defineConfig({
    ...base,
    testDir: __dirname,
    testMatch: /visual\.spec\.ts/,
    testIgnore: [],
    fullyParallel: false,
    retries: 0,
    workers: 1,
    reporter: [["list"]],
    webServer,
    snapshotPathTemplate: join(dir, app, "{arg}{ext}"),
    outputDir: join(dir, "_results", app),
    // The shell is held to the viewport and the body scrolls inside a panel, so fullPage adds nothing; open a tall window instead
    projects: [{
        ...open,
        name: app,
        testMatch: /visual\.spec\.ts/,
        testIgnore: [],
        use: { ...open?.use, viewport: { width: 1440, height: 1600 } },
    }],
});
