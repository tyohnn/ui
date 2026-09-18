// The colour set an app wears.
//
// A theme is 72 colour values, light and dark; a system is the feel — density, shape, material, motion.
// The two are separate axes, so an app can keep its system and change its colours. Every system ships
// with its own theme (`theme` in system.json), and that is what an app wears until it is given another.
//
// Four ways to name one:
//   nocturne                 a complete theme in the registry (registry/themes)
//   stone                    a base — the neutral ramp, complete on its own
//   blue                     an accent: primary, secondary, the chart ramp and the sidebar accent. An accent is
//                            not a palette, so it is composed over whatever the app wears now
//   ./brand.json             a theme file in the project
//   tyohnn-theme:<encoded>   a share link from the site's editor, written into the project as a file

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";

import { checkTheme, decodeTheme, resolveTheme, themeToCss, type Theme } from "@tyohnn/theme";

import { writeFile } from "../lib/fs.js";
import { CliError } from "../lib/log.js";
import type { Registry } from "../source/registry.js";

/** What tyohnn.json remembers: a theme of the registry, a composition of two, or a file in the project. */
export type ThemeChoice = { id: string } | { file: string } | { base: string; accent: string };

export const ENCODED_PREFIX = "tyohnn-theme:";

const DIRS = [".", "bases", "accents"];

const themePath = (registry: Registry, id: string): string | null =>
{
    for (const dir of DIRS)
    {
        const path = `registry/themes/${dir === "." ? "" : `${dir}/`}${id}.json`;

        if (registry.has(path)) return path;
    }

    return null;
};

/** Theme ids the registry ships, grouped the way they are picked. */
export const listThemes = (registry: Registry): Record<string, string[]> =>
    Object.fromEntries(DIRS.map((dir) =>
    {
        const path = registry.path(`registry/themes/${dir === "." ? "" : dir}`);
        const names = existsSync(path)
            ? readdirSync(path).filter((file) => file.endsWith(".json")).map((file) => file.slice(0, -".json".length)).sort()
            : [];

        return [dir === "." ? "themes" : dir, names];
    }));

const fromRegistry = (registry: Registry, id: string): Theme =>
{
    const path = themePath(registry, id);

    if (!path)
    {
        const all = listThemes(registry);

        throw new CliError(`unknown theme "${id}"`, `Known themes: ${all.themes?.join(", ")}. Bases: ${all.bases?.join(", ")}. Accents: ${all.accents?.join(", ")}.`);
    }

    return registry.json<Theme>(path);
};

/** A theme with its `extends` composed in, and every one of the 72 colours present. */
export const resolve72 = (theme: Theme, registry: Registry) =>
{
    const resolved = resolveTheme(theme, (id) => fromRegistry(registry, id));
    const problems = checkTheme(resolved);

    if (problems.length > 0)
    {
        throw new CliError(`theme "${theme.name}" is incomplete`, `${problems.slice(0, 3).join("; ")}${problems.length > 3 ? ` (and ${problems.length - 3} more)` : ""}`);
    }

    return resolved;
};

/** Whether a registry theme is a whole palette on its own, or only the part an accent moves. */
const isComplete = (theme: Theme, registry: Registry): boolean =>
    checkTheme(resolveTheme(theme, (id) => fromRegistry(registry, id))).length === 0;

/** The complete theme an app wears now, which an accent is composed over. */
const baseOf = (current: { theme?: ThemeChoice; system: string }, registry: Registry): string =>
{
    if (!current.theme) return systemTheme(registry, current.system);
    if ("id" in current.theme) return current.theme.id;
    if ("base" in current.theme) return current.theme.base;

    throw new CliError("an accent cannot be composed over a theme file", `Give a whole theme, or edit ${current.theme.file}.`);
};

/**
 * Read what `--theme` was given and say what the record should remember. A share link is written into
 * the project first, because the record points at files, never at a blob of colours.
 */
export const resolveThemeInput = (input: string, root: string, registry: Registry, current: { theme?: ThemeChoice; system: string }): ThemeChoice =>
{
    if (input.startsWith(ENCODED_PREFIX))
    {
        let theme: Theme;

        try
        {
            theme = decodeTheme(input);
        }
        catch
        {
            throw new CliError("that theme link is not readable", "Copy it again from the theme editor; it looks like `tyohnn-theme:<code>`.");
        }

        resolve72(theme, registry);

        const file = `tyohnn-theme.${/^[a-z0-9-]+$/.test(theme.name ?? "") ? theme.name : "custom"}.json`;

        writeFile(join(root, file), `${JSON.stringify(theme, null, 4)}\n`);

        return { file };
    }

    if (input.startsWith(".") || input.startsWith("/") || input.endsWith(".json"))
    {
        const absolute = isAbsolute(input) ? input : resolve(root, input);

        if (!existsSync(absolute)) throw new CliError(`no theme file at ${input}`);

        const file = relative(root, absolute);

        if (file.startsWith("..")) throw new CliError(`${input} is outside the project`, "Copy the theme file into the project first, so tyohnn.json can point at it.");

        resolve72(JSON.parse(readFileSync(absolute, "utf8")) as Theme, registry);

        return { file };
    }

    const named = fromRegistry(registry, input);

    // An accent moves primary, secondary, the chart ramp and the sidebar accent — the rest stays whatever
    // the app wears now, which is what "make it blue" means.
    if (!isComplete(named, registry)) return { base: baseOf(current, registry), accent: input };

    return { id: input };
};

/** The theme behind a choice. */
export const loadTheme = (choice: ThemeChoice, root: string, registry: Registry): Theme =>
{
    if ("id" in choice) return fromRegistry(registry, choice.id);
    if ("base" in choice) return { name: `${choice.base}+${choice.accent}`, extends: { base: choice.base, accent: choice.accent }, light: {}, dark: {} };

    const absolute = join(root, choice.file);

    if (!existsSync(absolute)) throw new CliError(`no theme file at ${choice.file}`, "It is named in tyohnn.json; restore it or run `tyohnn theme <name>`.");

    return JSON.parse(readFileSync(absolute, "utf8")) as Theme;
};

/** The generated layer-1 colour file for an app that wears something other than its system's own theme. */
export const themeCss = (choice: ThemeChoice, root: string, registry: Registry): string =>
    themeToCss(resolve72(loadTheme(choice, root, registry), registry));

/** The theme a system ships with. */
export const systemTheme = (registry: Registry, system: string): string => registry.system(system).theme ?? system;

/**
 * A choice that is the system's own theme is remembered as no choice at all: the system folder already
 * carries that theme.css, so there is nothing to generate and nothing for doctor to compare.
 */
export const normalizeTheme = (choice: ThemeChoice | undefined, registry: Registry, system: string): ThemeChoice | undefined =>
    isOwnTheme(choice, registry, system) ? undefined : choice;

/** Whether an app's choice is just its system's own theme, in which case the system folder already has it. */
export const isOwnTheme = (choice: ThemeChoice | undefined, registry: Registry, system: string): boolean =>
    !choice || ("id" in choice && choice.id === systemTheme(registry, system));

export const describeTheme = (choice: ThemeChoice | undefined, registry: Registry, system: string): string =>
{
    if (!choice) return `${systemTheme(registry, system)} (the system's own)`;
    if ("id" in choice) return choice.id;
    if ("base" in choice) return `${choice.base} + ${choice.accent}`;

    return choice.file;
};
