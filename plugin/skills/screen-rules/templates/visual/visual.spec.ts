import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { expect, test, type Page } from "@playwright/test";

/**
 * Photographs every screen of one app and compares it pixel by pixel with the baseline, so a wide change to
 * components or tokens can be checked without clicking through every screen. `visual.config.ts` builds the config
 * from the app's own.
 *
 * - Photos stay out of the repo, in `VISUAL_DIR`. Take before and after on the same day: screens that print "today"
 *   change overnight and an old baseline reports breakage that is not there.
 * - The screen list comes from the route folders. A route with an id is opened through a link of that shape found on
 *   screens already visited; with none, it is skipped and named.
 */

const APP = process.env.VISUAL_APP ?? "";

/** A local seed account per app. Never a real account */
const ACCOUNTS: Record<string, { email: string; password: string }> = {
    web: { email: "admin@example.test", password: "local-password" },
};

/** Routes seen only before login, or that only redirect */
const SKIP = [/^\/login$/, /^\/oauth\//];

type Route = { readonly pattern: string; readonly regex: RegExp | null };

const appDir = join(process.cwd(), "src", "app");

const pagesOf = (dir: string): ReadonlyArray<string> =>
    readdirSync(dir).flatMap((name) =>
    {
        const path = join(dir, name);

        if (statSync(path).isDirectory())
        {
            return name.startsWith("@") || name.startsWith("_") || name === "api" ? [] : pagesOf(path);
        }

        return name === "page.tsx" ? [dir] : [];
    });

const routes: ReadonlyArray<Route> = pagesOf(appDir)
    .map((dir) => "/" + relative(appDir, dir).split(sep).filter((part) => !/^\(.*\)$/.test(part)).join("/"))
    .map((path) => path === "/" ? "/" : path.replace(/\/$/, ""))
    .filter((path) => !SKIP.some((skip) => skip.test(path)))
    .sort()
    .map((pattern) => ({
        pattern,
        regex: pattern.includes("[")
            ? new RegExp("^" + pattern.replace(/\[\.\.\.[^\]]+\]/g, ".+").replace(/\[[^\]]+\]/g, "[^/?#]+") + "$")
            : null,
    }));

const nameOf = (path: string): string => (path === "/" ? "root" : path.slice(1).replaceAll("/", "__"));

/** Waits until drawing stops; fonts or loading faces still settling make the same screen differ */
const settle = async (page: Page): Promise<void> =>
{
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await page.evaluate(async () => document.fonts.ready);
    await page.locator('[data-slot="skeleton"]').first().waitFor({ state: "detached", timeout: 5_000 }).catch(() => undefined);
    await page.waitForTimeout(400);
};

const shoot = async (page: Page, name: string): Promise<void> =>
{
    await expect.soft(page).toHaveScreenshot(`${name}.png`, {
        animations: "disabled",
        caret: "hide",
        maxDiffPixelRatio: 0.002,
    });
};

/** On a list, opens the first row's sheet too: sheets and dialogs break most when components change */
const shootFirstRow = async (page: Page, name: string): Promise<void> =>
{
    const row = page.locator("main tbody tr").first();

    if (!(await row.isVisible().catch(() => false)))
    {
        return;
    }

    await row.click({ position: { x: 24, y: 12 } }).catch(() => undefined);

    const panel = page.locator('[role="dialog"]').first();

    if (!(await panel.isVisible({ timeout: 3_000 }).catch(() => false)))
    {
        return;
    }

    await settle(page);
    await shoot(page, `${name}__row`);
};

/**
 * Opens one popup of each kind per screen. Closed screens alone say nothing when menus, selects, popovers and
 * tooltips move to another engine. Triggers are found by accessibility attributes, not part names, so the same place
 * opens after a swap.
 */
const POPUPS: ReadonlyArray<{ readonly kind: string; readonly selector: string; readonly hover?: boolean }> = [
    { kind: "menu", selector: '[aria-haspopup="menu"]' },
    { kind: "listbox", selector: '[aria-haspopup="listbox"]:not(input), button[role="combobox"]' },
    { kind: "dialog", selector: '[aria-haspopup="dialog"]' },
    { kind: "tooltip", selector: '[data-slot="tooltip-trigger"]', hover: true },
];

const shootPopups = async (page: Page, path: string, name: string): Promise<void> =>
{
    for (const popup of POPUPS)
    {
        const scope = (await page.locator("main").count()) > 0 ? page.locator("main") : page.locator("body");
        const trigger = scope.locator(popup.selector).filter({ visible: true }).first();

        if ((await trigger.count()) === 0)
        {
            continue;
        }

        const opened = popup.hover === true
            ? await trigger.hover({ timeout: 3_000 }).then(() => true, () => false)
            : await trigger.click({ timeout: 3_000 }).then(() => true, () => false);

        if (!opened)
        {
            continue;
        }

        await page.waitForTimeout(popup.hover === true ? 900 : 300);
        await settle(page);
        await shoot(page, `${name}__${popup.kind}`);

        await page.goto(path);
        await settle(page);
    }
};

/** Only local hosts, so a seed password never goes to a remote app */
const LOCAL_HOSTS: ReadonlyArray<string> = ["127.0.0.1", "localhost"];

test(`${APP} screens`, async ({ page, baseURL }) =>
{
    test.setTimeout(routes.length * 60_000);

    if (baseURL === undefined || !LOCAL_HOSTS.includes(new URL(baseURL).hostname))
    {
        throw new Error(`only local apps are photographed: ${baseURL ?? "(no baseURL)"}`);
    }

    const account = ACCOUNTS[APP];

    if (account === undefined)
    {
        throw new Error(`unknown VISUAL_APP: ${APP}`);
    }

    // Change to the login screen's field names
    await page.goto("/login");
    await page.getByLabel("Email").fill(account.email);
    await page.getByLabel("Password").fill(account.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20_000 });

    const seen = new Set<string>();
    const skipped: Array<string> = [];

    const visit = async (path: string, name: string): Promise<void> =>
    {
        await page.goto(path);
        await settle(page);

        const hrefs = await page.locator("a[href^='/']").evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
        hrefs.forEach((href) => seen.add(href.split(/[?#]/)[0] ?? href));

        await shoot(page, name);
        await shootPopups(page, path, name);
        await shootFirstRow(page, name);
    };

    for (const route of routes.filter((route) => route.regex === null))
    {
        await visit(route.pattern, nameOf(route.pattern));
    }

    for (const route of routes.filter((route) => route.regex !== null))
    {
        const href = [...seen].sort().find((candidate) => route.regex?.test(candidate) ?? false);

        if (href === undefined)
        {
            skipped.push(route.pattern);
            continue;
        }

        await visit(href, nameOf(route.pattern));
    }

    test.info().annotations.push({ type: "skipped", description: skipped.join(", ") || "none" });
    console.log(`[visual] ${APP}: ${routes.length - skipped.length} screens, ${skipped.length} skipped ${skipped.join(" ")}`);
});
