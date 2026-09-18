// Build-time theme data: every colour set the registry ships, read when the site is built.
// Server components only (Node fs).

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PALETTE, resolveTheme, type Theme } from "@tyohnn/theme";

import type { Mode } from "./site";

const themesRoot = join(process.cwd(), "../../registry/themes");

const read = (file: string): Theme => JSON.parse(readFileSync(file, "utf8")) as Theme;

const ids = (dir: string): string[] =>
{
    const path = join(themesRoot, dir);

    return existsSync(path)
        ? readdirSync(path).filter((file) => file.endsWith(".json")).map((file) => file.slice(0, -".json".length)).sort()
        : [];
};

const find = (id: string): Theme | undefined =>
{
    for (const dir of [".", "bases", "accents"])
    {
        const path = join(themesRoot, dir, `${id}.json`);

        if (existsSync(path)) return read(path);
    }

    return undefined;
};

export type ThemeKind = "theme" | "base" | "accent";

export interface ThemeInfo
{
    id: string;
    title: string;
    kind: ThemeKind;
    /** A base or a named theme carries the whole palette; an accent only what it moves. */
    light: Record<string, string>;
    dark: Record<string, string>;
    /** Four colours for the swatch: background, primary, accent-ish, foreground, in the mode shown */
    swatch: Record<Mode, string[]>;
}

const resolved = (theme: Theme) => resolveTheme(theme, find);

const swatchOf = (values: Record<string, string>, fallback: Record<string, string>): string[] =>
    ["background", "primary", "muted", "foreground"].map((name) => values[name] ?? fallback[name] ?? "transparent");

/** Every theme, base and accent the registry ships, ready for the client. */
export const readThemes = (): ThemeInfo[] =>
{
    const neutral = resolved(find("neutral")!);
    const entries: { id: string; kind: ThemeKind }[] = [
        ...ids(".").map((id) => ({ id, kind: "theme" as const })),
        ...ids("bases").map((id) => ({ id, kind: "base" as const })),
        ...ids("accents").map((id) => ({ id, kind: "accent" as const })),
    ];

    return entries.map(({ id, kind }) =>
    {
        const theme = find(id)!;
        const full = kind === "accent" ? { light: theme.light, dark: theme.dark } : resolved(theme);

        return {
            id,
            title: theme.title ?? id,
            kind,
            light: Object.fromEntries(PALETTE.filter((name) => full.light[name]).map((name) => [name, full.light[name]])),
            dark: Object.fromEntries(PALETTE.filter((name) => full.dark[name]).map((name) => [name, full.dark[name]])),
            swatch: {
                light: swatchOf(full.light, neutral.light),
                dark: swatchOf(full.dark, neutral.dark),
            },
        };
    });
};

/** The theme a system ships with (system.json `theme`, else its own name). */
export const systemThemes = (): Record<string, string> =>
{
    const systemsRoot = join(process.cwd(), "../../registry/systems");

    return Object.fromEntries(readdirSync(systemsRoot)
        .filter((name) => existsSync(join(systemsRoot, name, "system.json")))
        .map((name) =>
        {
            const meta = JSON.parse(readFileSync(join(systemsRoot, name, "system.json"), "utf8")) as { theme?: string };

            return [name, meta.theme ?? name];
        }));
};
