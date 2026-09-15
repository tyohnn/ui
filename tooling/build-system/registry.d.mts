// Types for the parts of registry.mjs the TypeScript apps import (apps/preview/vite.config.ts).

export interface SystemFonts
{
    sans: string;
    heading: string;
    mono: string;
    hangulFallback: string;
}

export interface SystemMeta
{
    name: string;
    description: string;
    fonts: SystemFonts;
    icons?: { library: string };
    [key: string]: unknown;
}

export interface FontEntry
{
    id: string;
    family: string;
    category: "sans" | "serif" | "mono" | "display";
    provider: "google" | "local";
    next: { import: string; variable: string };
    fontsource?: { package: string; variable: boolean; css: string; family: string; staticWeights?: number[] };
    npm?: { package: string; css: string; family: string; variableCss?: string; variableFamily?: string };
    local?: { files: { path: string; weight: number; style: string }[] };
    weights: number[];
    axes: string[];
    subsets: string[];
    hangul: boolean;
    license: { name: string; url: string };
}

export const repoRoot: string;
export const registryRoot: string;
export const uiRoot: string;
export const foundationRoot: string;
export const systemsRoot: string;
export const fontsRoot: string;
export const schemaRoot: string;
export function listSystems(): string[];
export function systemRoot(name: string): string;
export function readSystemMeta(name: string): SystemMeta;
export function readFontCatalog(): Map<string, FontEntry>;
export function fontFamilies(font: FontEntry): string[];
export function fontStacks(fonts: SystemFonts, catalog?: Map<string, FontEntry>): Record<"--font-sans" | "--font-heading" | "--font-mono", string>;
export function fontIds(fonts: SystemFonts): string[];
