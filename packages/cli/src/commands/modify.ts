// Commands that change an existing setup: add · use · icons · fonts · theme. Each edits tyohnn.json and syncs.

import { CliError, log } from "../lib/log.js";
import { inspectApp } from "../project/app.js";
import { describeFonts, resolveFonts, validateFonts } from "../project/fonts.js";
import { requireRecord, type TyohnnRecord, usedIcons } from "../project/record.js";
import { sync } from "../project/sync.js";
import { describeTheme, normalizeTheme, resolveThemeInput } from "../project/theme.js";
import type { Registry } from "../source/registry.js";
import { appPathFrom, type GlobalOptions, interactive, newChanges, openProjectSource, parseMode, printSummary, recordRoot, resolveAppPath, select, workingDir } from "./context.js";
import { initFontOverrides } from "./init.js";

const load = async (options: GlobalOptions) =>
{
    const root = recordRoot(options) ?? workingDir(options);
    const record = requireRecord(root);
    const { registry, info } = await openProjectSource(options, record);

    record.source = info;

    return { root, record, registry };
};

const run = async (root: string, record: TyohnnRecord, registry: Registry, options: GlobalOptions, title: string) =>
{
    const changes = newChanges();

    await sync({ root, registry, record, changes, options: { force: Boolean(options.force), install: options.install !== false } });
    printSummary(title, changes, root);
};

/** tyohnn add <system> --app <path> — a system for another app of the monorepo */
export const add = async (systemName: string | undefined, options: GlobalOptions): Promise<void> =>
{
    if (!systemName) throw new CliError("which system?", "Usage: tyohnn add <system> --app <path>.");

    const { root, record, registry } = await load(options);

    if (record.project !== "monorepo") throw new CliError("add is for monorepos (one app per system)", `This is a single app: switch its system with \`tyohnn use ${systemName}\`.`);
    if (!options.app) throw new CliError("which app?", `Usage: tyohnn add ${systemName} --app <path>.`);

    const appPath = appPathFrom(options, root, options.app);

    if (record.apps[appPath]) throw new CliError(`${appPath} already uses ${record.apps[appPath].system}`, `Switch it with \`tyohnn use ${systemName} --app ${appPath}\`.`);

    const system = registry.system(systemName);
    const app = inspectApp(root, appPath);
    const used = usedIcons(record);
    let icons = options.icons ?? system.icons.library;

    if (!options.icons && used.length && !used.includes(icons))
    {
        if (interactive(options))
        {
            icons = await select(`${systemName} uses ${icons}, other apps use ${used.join(", ")}. Icon library for ${appPath}:`, [
                ...used.map((library) => ({ value: library, label: library, hint: "shared with the other apps (simpler)" })),
                { value: icons, label: icons, hint: `${systemName}'s default (a second library in packages/ui)` },
            ]);
        }
        else log.warn(`${appPath} gets ${icons} (${systemName}'s default) while other apps use ${used.join(", ")}; pass --icons ${used[0]} to share one library`);
    }

    registry.iconLibrary(icons);

    const fonts = resolveFonts(system.fonts, initFontOverrides(options));

    validateFonts(fonts, registry);

    record.apps[appPath] = { framework: app.framework, system: systemName, icons, fonts, mode: parseMode(options.mode) ?? system.mode, css: "", ...(options.example ? { example: options.example } : {}) };
    log.step(`${systemName} → ${appPath} · icons ${icons} · ${describeFonts(fonts)} · ${record.apps[appPath].mode} mode`);
    await run(root, record, registry, options, `Added ${systemName} for ${appPath}`);
};

/** tyohnn use <system> [--app <path>] — switch an app's system (entry CSS, fonts, mode); TSX stays */
export const use = async (systemName: string | undefined, options: GlobalOptions): Promise<void> =>
{
    if (!systemName) throw new CliError("which system?", "Usage: tyohnn use <system> [--app <path>].");

    const { root, record, registry } = await load(options);
    const appPath = resolveAppPath(options, root, record);
    const app = record.apps[appPath];
    const system = registry.system(systemName);
    const previous = app.system;

    app.system = systemName;
    app.fonts = resolveFonts(system.fonts, { sans: options.font ?? options.sans, heading: options["font-heading"] ?? options.heading, mono: options["font-mono"] ?? options.mono });
    app.mode = parseMode(options.mode) ?? system.mode;
    if (options.icons) app.icons = options.icons;
    registry.iconLibrary(app.icons);
    validateFonts(app.fonts, registry);

    log.step(`${appPath === "." ? "this app" : appPath}: ${previous} → ${systemName} · ${describeFonts(app.fonts)} · ${app.mode} mode · icons ${app.icons}`);
    await run(root, record, registry, options, previous === systemName ? `${systemName} re-applied` : `Switched ${appPath === "." ? "the app" : appPath} from ${previous} to ${systemName}`);
};

/** tyohnn icons <library> [--app <path>] */
export const icons = async (library: string | undefined, options: GlobalOptions): Promise<void> =>
{
    if (!library) throw new CliError("which icon library?", "Usage: tyohnn icons <library> [--app <path>]. Run `tyohnn list` for the libraries.");

    const { root, record, registry } = await load(options);
    const appPath = resolveAppPath(options, root, record);

    registry.iconLibrary(library);

    const previous = record.apps[appPath].icons;

    record.apps[appPath].icons = library;
    await run(root, record, registry, options, previous === library ? `${library} re-applied` : `Icons of ${appPath === "." ? "the app" : appPath}: ${previous} → ${library}`);
};

/** tyohnn theme <id | ./file.json | tyohnn-theme:<code>> [--app <path>] [--reset] */
export const theme = async (argument: string | undefined, options: GlobalOptions): Promise<void> =>
{
    if (!argument && !options.reset) throw new CliError("no theme given", "Usage: tyohnn theme <name | ./theme.json | tyohnn-theme:<code>> [--reset]. Run `tyohnn list` for the themes.");

    const { root, record, registry } = await load(options);
    const appPath = resolveAppPath(options, root, record);
    const app = record.apps[appPath];

    app.theme = options.reset || !argument ? undefined : normalizeTheme(resolveThemeInput(argument, root, registry, app), registry, app.system);

    await run(root, record, registry, options, `Colours of ${appPath === "." ? "the app" : appPath}: ${describeTheme(app.theme, registry, app.system)}`);
};

/** tyohnn fonts [--sans <id>] [--heading <id|inherit>] [--mono <id|system>] [--reset] [--app <path>] */
export const fonts = async (options: GlobalOptions): Promise<void> =>
{
    if (!options.sans && !options.heading && !options.mono && !options.reset) throw new CliError("no font given", "Usage: tyohnn fonts [--sans <id>] [--heading <id|inherit>] [--mono <id|system>] [--reset]. Run `tyohnn list` for the fonts.");

    const { root, record, registry } = await load(options);
    const appPath = resolveAppPath(options, root, record);
    const app = record.apps[appPath];
    const base = options.reset ? registry.system(app.system).fonts : app.fonts;

    app.fonts = resolveFonts(base, { sans: options.sans, heading: options.heading, mono: options.mono });
    validateFonts(app.fonts, registry);
    await run(root, record, registry, options, `Fonts of ${appPath === "." ? "the app" : appPath}: ${describeFonts(app.fonts)}`);
};
