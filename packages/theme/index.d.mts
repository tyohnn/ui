// Types for the TypeScript consumers of index.mjs (packages/cli, apps/site).

export type PaletteGroup = "base" | "chart" | "sidebar" | "status" | "tag" | "avatar" | "state";

/** A colour value per palette name; a complete theme carries all of them. */
export type Colours = Record<string, string>;

export interface ThemeExtends
{
    base?: string;
    accent?: string;
    chart?: string;
}

export interface Theme
{
    name: string;
    title?: string;
    source?: { kind: "shadcn" | "system" | "custom"; note?: string };
    extends?: ThemeExtends;
    light: Colours;
    dark: Colours;
    /** Optional material tints (clay · glow) a system may compose into shadows and surfaces. */
    material?: Record<string, { light: string; dark: string }>;
}

export interface ResolvedTheme
{
    name: string;
    title: string;
    source?: Theme["source"];
    light: Colours;
    dark: Colours;
    material?: Theme["material"];
}

export interface ContrastFailure
{
    mode: "light" | "dark";
    foreground: string;
    background: string;
    ratio: number;
}

export const PALETTE_GROUPS: Record<PaletteGroup, string[]>;
export const PALETTE: string[];
export const CONTRAST_PAIRS: [string, string][];

export function groupOf(name: string): PaletteGroup | null;
export function resolveTheme(theme: Theme, load: (id: string) => Theme | undefined): ResolvedTheme;
export function checkTheme(resolved: ResolvedTheme): string[];
export function themeToCss(resolved: ResolvedTheme, options?: { partial?: boolean }): string;
export function encodeTheme(theme: Theme): string;
export function decodeTheme(encoded: string): Theme;

/** registry/presets.json: the append-only lists a preset code counts in */
export interface PresetLists
{
    systems: string[];
    palettes: string[];
    accents: string[];
}

export interface Preset
{
    system: string;
    /** A whole palette: a system's own theme or a base */
    palette: string;
    accent: string | null;
    chart: string | null;
    /** Colours changed by hand, after the dot in the code */
    edits?: { light: Colours; dark: Colours };
}

export function encodePreset(lists: PresetLists, preset: Preset): string | null;
export function decodePreset(lists: PresetLists, code: string): Preset | null;
export function presetTheme(preset: Preset): Theme;
export function parseColour(value: string): [number, number, number] | null;
export function resolveValue(values: Colours, value: string): string;
export function toHex(value: string): string | null;
export function toOklch(value: string): [number, number, number, number] | null;
export function contrast(a: string, b: string): number | null;
export function checkContrast(resolved: ResolvedTheme, minimum?: number): ContrastFailure[];
