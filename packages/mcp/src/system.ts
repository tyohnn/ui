import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import { encodePreset, PALETTE, PALETTE_GROUPS, presetTheme, resolveTheme, resolveValue, type PresetLists, type Theme } from "../../theme/index.mjs";

import type { SystemSummary } from "./catalog";

/**
 * The system being shaped in the System view: a design system, the colours over it (the same picks the site's
 * Create page makes, so they pack into the same preset code) and token values changed by hand. The view and the
 * agent edit this one state through the tools; the view draws it, the agent reads it back with get_system.
 */

export type Mode = "light" | "dark";

export interface SystemState
{
    system: string;
    mode: Mode;
    /** A whole palette: a system's own theme or a shadcn base. Starts as the system's own */
    palette: string;
    accent: string | null;
    chart: string | null;
    /** Colours changed by hand, per mode, over palette · accent · chart */
    colours: Record<Mode, Record<string, string>>;
    /** Every other token changed by hand: density, depth, texture, typography, layout */
    tokens: Record<string, string>;
}

/** A control in the view's sidebar for one token; `range` slides a number, `options` picks a value */
export interface TokenControl
{
    token: string;
    label: string;
    range?: { min: number; max: number; step: number; unit: "px" | "rem" | "em"; fallback?: number };
    options?: { label: string; value: string; hint?: string }[];
}

export interface Axis
{
    id: string;
    title: string;
    hint: string;
    controls: TokenControl[];
}

/**
 * The tokens each axis shows first: the few that move it most. Any other token a system declares can still be
 * set (set_tokens checks the name against the system's CSS); these are the ones with a control.
 */
export const AXES: Axis[] = [
    { id: "density", title: "Density", hint: "heights · padding · rhythm", controls: [
        { token: "--control-height-md", label: "Control height", range: { min: 24, max: 48, step: 1, unit: "px" } },
        { token: "--control-padding-x-md", label: "Control padding", range: { min: 4, max: 20, step: 1, unit: "px" } },
        { token: "--surface-padding-md", label: "Surface padding", range: { min: 8, max: 40, step: 1, unit: "px" } },
        { token: "--table-row-height", label: "Table row height", range: { min: 24, max: 64, step: 1, unit: "px" } },
        { token: "--sidebar-item-height", label: "Sidebar item height", range: { min: 24, max: 44, step: 1, unit: "px" } },
    ] },
    { id: "depth", title: "Depth", hint: "how far surfaces lift", controls: [
        { token: "--card-shadow", label: "Card shadow", options: [
            { label: "Flat", value: "none", hint: "no shadow" },
            { label: "Hairline", value: "0 0 0 1px rgb(0 0 0 / .06)", hint: "1px ring" },
            { label: "Soft", value: "0 1px 2px rgb(0 0 0 / .06), 0 4px 12px rgb(0 0 0 / .06)", hint: "4 · 12px" },
            { label: "Lifted", value: "0 2px 4px rgb(0 0 0 / .08), 0 12px 32px rgb(0 0 0 / .14)", hint: "12 · 32px" },
        ] },
        { token: "--shadow-control", label: "Control shadow", options: [
            { label: "Flat", value: "none", hint: "no shadow" },
            { label: "Soft", value: "0 1px 2px rgb(0 0 0 / .08)", hint: "1 · 2px" },
            { label: "Raised", value: "0 1px 0 rgb(255 255 255 / .6) inset, 0 2px 6px rgb(0 0 0 / .14)", hint: "inset + 6px" },
        ] },
        { token: "--focus-ring-width", label: "Focus ring", range: { min: 0, max: 6, step: 1, unit: "px" } },
    ] },
    { id: "texture", title: "Texture", hint: "corners · edges · materials", controls: [
        { token: "--control-radius", label: "Control radius", range: { min: 0, max: 20, step: 1, unit: "px" } },
        { token: "--surface-radius", label: "Surface radius", range: { min: 0, max: 28, step: 1, unit: "px" } },
        { token: "--surface-border-width", label: "Border width", range: { min: 0, max: 3, step: 0.5, unit: "px" } },
        { token: "--overlay-backdrop-blur", label: "Backdrop blur", range: { min: 0, max: 24, step: 1, unit: "px" } },
    ] },
    { id: "type", title: "Typography", hint: "stacks · weight · tracking", controls: [
        { token: "--font-sans", label: "Sans", options: [
            { label: "Inter", value: "Inter, ui-sans-serif, system-ui, sans-serif" },
            { label: "System UI", value: "system-ui, sans-serif" },
            { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
            { label: "Mono", value: "ui-monospace, Menlo, monospace" },
        ] },
        { token: "--control-font-weight", label: "Control weight", options: [
            { label: "400", value: "400" },
            { label: "500", value: "500" },
            { label: "600", value: "600" },
        ] },
        { token: "--control-font-size-md", label: "Control text", range: { min: 11, max: 17, step: 0.5, unit: "px" } },
        { token: "--title-letter-spacing", label: "Title tracking", range: { min: -0.06, max: 0.04, step: 0.005, unit: "em" } },
    ] },
    { id: "layout", title: "Layout", hint: "page skeleton", controls: [
        { token: "--page-gutter-md", label: "Page margin", range: { min: 0, max: 4, step: 0.25, unit: "rem", fallback: 1.5 } },
        { token: "--page-gap-md", label: "Space between blocks", range: { min: 0.25, max: 4, step: 0.25, unit: "rem", fallback: 1.5 } },
        { token: "--sidebar-width", label: "Sidebar width", range: { min: 12, max: 22, step: 0.5, unit: "rem", fallback: 16 } },
        { token: "--page-aside-md", label: "Side panel width", range: { min: 14, max: 32, step: 1, unit: "rem", fallback: 20 } },
        { token: "--page-measure-md", label: "Reading width", range: { min: 36, max: 80, step: 1, unit: "rem", fallback: 52 } },
    ] },
];

const CONTROLS = new Map(AXES.flatMap((axis) => axis.controls.map((control) => [control.token, control] as const)));

/** The screens the view draws the system on: apps/preview templates, at the width each is laid out for */
export const SCREENS = [
    { id: "crm-dashboard", label: "CRM", width: 1435, height: 760 },
    { id: "block-analytics", label: "Analytics", width: 1440, height: 900 },
    { id: "block-orders", label: "Orders", width: 1440, height: 900 },
    { id: "block-team", label: "Team", width: 1440, height: 900 },
    { id: "block-roadmap", label: "Roadmap", width: 1440, height: 900 },
];

export interface ThemeLibrary
{
    lists: PresetLists;
    palettes: { id: string; kind: "system" | "base" }[];
    accents: string[];
    load: (id: string) => Theme | undefined;
    /** The custom properties each system declares (tokens · globals · typeset), so set_tokens can refuse a typo */
    declared: (system: string) => Set<string>;
}

export const readThemes = (root: string): ThemeLibrary =>
{
    const themes = join(root, "registry/themes");
    const lists = JSON.parse(readFileSync(join(root, "registry/presets.json"), "utf8")) as PresetLists;
    const cache = new Map<string, Theme | undefined>();
    const declared = new Map<string, Set<string>>();

    const load = (id: string) =>
    {
        if (!cache.has(id))
        {
            const file = [".", "bases", "accents"].map((dir) => join(themes, dir, `${id}.json`)).find((path) => existsSync(path));

            cache.set(id, file ? JSON.parse(readFileSync(file, "utf8")) as Theme : undefined);
        }

        return cache.get(id);
    };

    const bases = new Set(readdirSync(join(themes, "bases")).map((file) => file.replace(/\.json$/, "")));

    return {
        lists,
        palettes: lists.palettes.filter((id) => load(id)).map((id) => ({ id, kind: bases.has(id) ? "base" : "system" })),
        accents: lists.accents.filter((id) => load(id)),
        load,
        declared: (system) =>
        {
            if (!declared.has(system))
            {
                const styles = join(root, "registry/systems", system, "styles");
                const names = new Set<string>();

                for (const file of ["tokens.css", "globals.css", "typeset.css"])
                {
                    const path = join(styles, file);

                    if (existsSync(path)) for (const match of readFileSync(path, "utf8").matchAll(/(--[a-z0-9-]+)\s*:/gi)) names.add(match[1]);
                }

                declared.set(system, names);
            }

            return declared.get(system) as Set<string>;
        },
    };
};

export const startState = (system: SystemSummary, library: ThemeLibrary): SystemState => ({
    system: system.name,
    mode: system.defaultMode,
    // A system's own theme is named after it; a system without one starts on the first palette
    palette: library.load(system.name) ? system.name : library.lists.palettes[0],
    accent: null,
    chart: null,
    colours: { light: {}, dark: {} },
    tokens: {},
});

const presetOf = (state: SystemState) => ({ system: state.system, palette: state.palette, accent: state.accent, chart: state.chart, edits: state.colours });

/** Every colour name's value in both modes: palette, then accent, then chart ramp, then the hand edits */
export const coloursOf = (state: SystemState, library: ThemeLibrary) => resolveTheme(presetTheme(presetOf(state)), library.load);

/** The preset code for the colours (the site's `--preset`), or null when a pick is outside the preset lists */
export const presetCode = (state: SystemState, library: ThemeLibrary) => encodePreset(library.lists, presetOf(state));

export const colourChanges = (state: SystemState, own: string) =>
    (state.palette !== own ? 1 : 0) + (state.accent ? 1 : 0) + (state.chart ? 1 : 0)
    + Object.keys(state.colours.light).length + Object.keys(state.colours.dark).length;

export interface ColourInput
{
    palette?: string;
    accent?: string | null;
    chart?: string | null;
    light?: Record<string, string | null>;
    dark?: Record<string, string | null>;
}

const FORBIDDEN = /[;{}<>]/;

/** A value a custom property may hold: one declaration's worth, nothing that could close it or open another */
const isValue = (value: string) => value.trim().length > 0 && value.length <= 400 && !FORBIDDEN.test(value);

export type Outcome = { state: SystemState } | { error: string };

export const setColours = (state: SystemState, input: ColourInput, library: ThemeLibrary): Outcome =>
{
    const palettes = new Set(library.palettes.map((entry) => entry.id));
    const accents = new Set(library.accents);
    const next: SystemState = { ...state, colours: { light: { ...state.colours.light }, dark: { ...state.colours.dark } } };

    if (input.palette !== undefined)
    {
        if (!palettes.has(input.palette)) return { error: `No palette “${input.palette}”. Palettes: ${[...palettes].join(", ")}.` };
        next.palette = input.palette;
    }

    for (const key of ["accent", "chart"] as const)
    {
        const value = input[key];

        if (value === undefined) continue;
        if (value !== null && !accents.has(value)) return { error: `No ${key} “${value}”. Choose one of: ${[...accents].join(", ")}, or null for none.` };
        next[key] = value;
    }

    for (const mode of ["light", "dark"] as const)
    {
        for (const [name, value] of Object.entries(input[mode] ?? {}))
        {
            const bare = name.replace(/^--/, "");

            if (!PALETTE.includes(bare)) return { error: `“${name}” is not one of the 72 colour names (e.g. primary, chart-1, sidebar-border).` };
            if (value === null) delete next.colours[mode][bare];
            else if (!isValue(value)) return { error: `“${value}” is not a colour value for ${bare}.` };
            else next.colours[mode][bare] = value.trim();
        }
    }

    return { state: next };
};

const NUMBER = /^(-?\d*\.?\d+)(px|rem|em)?$/;

export const setTokens = (state: SystemState, input: Record<string, string | null>, library: ThemeLibrary): Outcome =>
{
    const declared = library.declared(state.system);
    const next: SystemState = { ...state, tokens: { ...state.tokens } };

    for (const [raw, value] of Object.entries(input))
    {
        const name = raw.startsWith("--") ? raw : `--${raw}`;
        const control = CONTROLS.get(name);

        if (PALETTE.includes(name.slice(2))) return { error: `${name} is a colour: change it with set_colours.` };
        if (!control && !declared.has(name)) return { error: `${state.system} has no token ${name}.` };

        if (value === null)
        {
            delete next.tokens[name];
            continue;
        }

        if (!isValue(value)) return { error: `“${value}” is not a value for ${name}.` };

        if (control?.range)
        {
            const match = NUMBER.exec(value.trim());
            const { min, max, unit } = control.range;

            if (!match || (match[2] ?? unit) !== unit) return { error: `${name} takes a length in ${unit}, e.g. ${min}${unit}.` };

            const number = Number(match[1]);

            if (number < min || number > max) return { error: `${name} goes from ${min}${unit} to ${max}${unit}; ${value} is outside.` };
            next.tokens[name] = `${number}${unit}`;
            continue;
        }

        next.tokens[name] = value.trim();
    }

    return { state: next };
};

/** What the view sets on the preview: every colour when any moved (in the mode shown), then the hand-set tokens */
export const previewVars = (state: SystemState, library: ThemeLibrary): Record<string, string> =>
{
    const vars: Record<string, string> = {};

    if (colourChanges(state, state.system) > 0)
    {
        for (const [name, value] of Object.entries(coloursOf(state, library)[state.mode])) vars[`--${name}`] = value;
    }

    return { ...vars, ...state.tokens };
};

/** What changed, in words the agent can repeat to the person */
export const describe = (state: SystemState, library: ThemeLibrary) =>
{
    const lines = [`${state.system}, ${state.mode}.`];
    const code = presetCode(state, library);

    lines.push(`Colours: ${state.palette} palette${state.palette === state.system ? " (the system's own)" : ""}${state.accent ? `, ${state.accent} accent` : ""}${state.chart ? `, ${state.chart} charts` : ""}.`);

    for (const mode of ["light", "dark"] as const)
    {
        const edits = Object.entries(state.colours[mode]);

        if (edits.length > 0) lines.push(`Colours set by hand (${mode}): ${edits.map(([name, value]) => `${name} ${value}`).join(", ")}.`);
    }

    const tokens = Object.entries(state.tokens);

    lines.push(tokens.length > 0 ? `Tokens changed: ${tokens.map(([name, value]) => `${name} ${value}`).join(", ")}.` : "No other token changed.");
    if (code) lines.push(`Colour preset: --preset ${code}`);

    return lines.join("\n");
};

/** The colours a swatch shows for a palette (background · primary · muted · foreground) or an accent's ramp */
export const swatches = (library: ThemeLibrary, mode: Mode) =>
{
    const resolve = (values: Record<string, string>, names: string[]) => names.map((name) => resolveValue(values, values[name] ?? ""));

    return {
        palettes: library.palettes.map(({ id, kind }) =>
        {
            const values = resolveTheme(library.load(id) as Theme, library.load)[mode];

            return { id, kind, dots: resolve(values, ["background", "primary", "muted", "foreground"]) };
        }),
        accents: library.accents.map((id) =>
        {
            const values = (library.load(id) as Theme)[mode];

            return { id, chip: values.primary ?? "", ramp: PALETTE_GROUPS.chart.map((name) => values[name] ?? "") };
        }),
    };
};

export const COLOUR_GROUPS = PALETTE_GROUPS;

export interface TailwindFamily
{
    name: string;
    /** 50 … 950, as Tailwind writes them (oklch) */
    shades: [string, string][];
}

/**
 * Tailwind's palette for the view's colour picker, read from the tailwindcss the systems are built with (as the
 * site's Create page reads it), so a pick is exactly what `bg-red-500` paints. Chromatic families first, greys after.
 * Empty when the package is not installed: the picker then offers the value by hand only.
 */
export const readTailwind = (root: string): TailwindFamily[] =>
{
    try
    {
        const require = createRequire(join(root, "tooling/build-system/package.json"));
        const css = readFileSync(join(dirname(require.resolve("tailwindcss/package.json")), "theme.css"), "utf8");
        const families = new Map<string, TailwindFamily>();

        for (const [, name, shade, value] of css.matchAll(/--color-([a-z]+)-(\d+):\s*([^;]+);/g))
        {
            if (!families.has(name)) families.set(name, { name, shades: [] });
            families.get(name)?.shades.push([shade, value.trim()]);
        }

        const greys = ["slate", "gray", "zinc", "neutral", "stone", "mauve", "olive", "mist", "taupe"];
        const all = [...families.values()];

        return [...all.filter((family) => !greys.includes(family.name)), ...all.filter((family) => greys.includes(family.name))];
    }
    catch
    {
        return [];
    }
};
