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
export function themeToCss(resolved: ResolvedTheme): string;
export function encodeTheme(theme: Theme): string;
export function decodeTheme(encoded: string): Theme;
export function parseColour(value: string): [number, number, number] | null;
export function resolveValue(values: Colours, value: string): string;
export function contrast(a: string, b: string): number | null;
export function checkContrast(resolved: ResolvedTheme, minimum?: number): ContrastFailure[];
