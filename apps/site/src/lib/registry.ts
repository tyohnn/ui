// Build-time data: every design system and font, read from the registry when the site is built.
// Server components only (Node fs). Nothing here is hard-coded per system.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { FontInfo, Mode, SystemInfo } from "./site";
import { SITE_FONTS } from "./site-fonts";

// `next build` and `next dev` run with apps/site as the working directory.
const registryRoot = join(process.cwd(), "../../registry");

const readJson = <T>(file: string): T => JSON.parse(readFileSync(file, "utf8")) as T;

interface SystemJson
{
    name: string;
    description: string;
    tagline: string;
    added: string;
    fonts: { sans: string; heading: string; mono: string; hangulFallback: string };
    icons?: { library: string };
    defaultMode?: Mode;
}

interface FontJson
{
    id: string;
    family: string;
    category: string;
    license: { name: string };
    fontsource?: { family: string };
    npm?: { variableFamily?: string; family: string };
}

interface Manifest
{
    iconLibraries: Record<string, { packages: Record<string, string> }>;
}

/** Display names of the icon libraries registry/ui/manifest.json lists */
const ICON_LABELS: Record<string, string> = {
    lucide: "Lucide",
    tabler: "Tabler Icons",
    hugeicons: "Hugeicons",
    phosphor: "Phosphor",
    remixicon: "Remix Icon",
    radix: "Radix Icons",
};

const fontCatalog = (): Map<string, FontInfo> =>
    new Map(readdirSync(join(registryRoot, "fonts"))
        .filter((file) => file.endsWith(".json"))
        .map((file) => readJson<FontJson>(join(registryRoot, "fonts", file)))
        .map((font) => [font.id, {
            id: font.id,
            family: font.family,
            cssFamily: font.fontsource?.family ?? font.npm?.variableFamily ?? font.family,
            category: font.category,
            license: font.license.name,
        }]));

/** The value of one layer-1 token in the `:root` block (light) or the `.dark` block of a system's globals.css */
const token = (css: string, mode: Mode, name: string) =>
{
    const dark = css.search(/^\s*\.dark\s*\{/m);
    const block = mode === "dark" && dark >= 0 ? css.slice(dark) : css.slice(0, dark >= 0 ? dark : undefined);
    const match = block.match(new RegExp(`--${name}:\\s*([^;]+);`));

    return match ? match[1].trim() : "transparent";
};

let cache: SystemInfo[] | null = null;

/** Every system in registry/systems, newest first (foundation is a maintainer copy and is not listed) */
export const getSystems = (): SystemInfo[] =>
{
    if (cache) return cache;

    const fonts = fontCatalog();
    const manifest = readJson<Manifest>(join(registryRoot, "ui/manifest.json"));
    const font = (id: string) =>
    {
        const found = fonts.get(id);

        if (!found) throw new Error(`font "${id}" is not in registry/fonts`);

        return found;
    };
    const systemsRoot = join(registryRoot, "systems");

    cache = readdirSync(systemsRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && existsSync(join(systemsRoot, entry.name, "system.json")))
        .map((entry) => readJson<SystemJson>(join(systemsRoot, entry.name, "system.json")))
        // By instant, not by string: `added` is ISO 8601, and a UTC "Z" stamp sorts wrongly against a +09:00 one.
        .sort((a, b) => Date.parse(b.added) - Date.parse(a.added) || a.name.localeCompare(b.name))
        .map((system) =>
        {
            const library = system.icons?.library ?? "lucide";
            const defaultMode = system.defaultMode ?? "light";
            const heading = system.fonts.heading === "inherit" ? null : font(system.fonts.heading);
            const sans = font(system.fonts.sans);
            const nameFont = heading ?? sans;
            // ⚠ 1층은 두 파일이다. 팔레트 리터럴은 theme.css 에 있고 globals.css 에는 파생식만 남는다
            //    (2026-09-18 테마 분리). globals.css 만 읽던 탓에 시스템 카드의 스와치가 전 시스템에서
            //    비어 있었다. 테마에서 먼저 찾고, 없으면 globals 로 떨어진다.
            const themeCss = readFileSync(join(systemsRoot, system.name, "styles/theme.css"), "utf8");
            const globalsCss = readFileSync(join(systemsRoot, system.name, "styles/globals.css"), "utf8");
            const swatch = (name: string) =>
            {
                const value = token(themeCss, defaultMode, name);

                return value === "transparent" ? token(globalsCss, defaultMode, name) : value;
            };

            // A system name is set in its own font, which the site must self-host (src/lib/site-fonts.ts).
            if (!SITE_FONTS.includes(nameFont.id)) throw new Error(`${system.name}: the site does not load font "${nameFont.id}"; add it to src/lib/site-fonts.ts and src/app/layout.tsx`);

            return {
                name: system.name,
                description: system.description,
                tagline: system.tagline,
                added: system.added,
                fonts: {
                    sans,
                    heading,
                    mono: system.fonts.mono === "system" ? null : font(system.fonts.mono),
                    hangulFallback: font(system.fonts.hangulFallback),
                },
                nameFont: `"${nameFont.cssFamily}", ${nameFont.category === "serif" ? "Georgia, serif" : nameFont.category === "mono" ? "ui-monospace, monospace" : "sans-serif"}`,
                icons: {
                    id: library,
                    label: ICON_LABELS[library] ?? library,
                    packages: Object.keys(manifest.iconLibraries[library]?.packages ?? {}),
                },
                defaultMode,
                palette: ["background", "muted", "border", "primary", "foreground"].map(swatch),
            };
        });

    return cache;
};

export const getSystem = (name: string) => getSystems().find((system) => system.name === name);

export const getIconLibraries = () =>
    Object.entries(readJson<Manifest>(join(registryRoot, "ui/manifest.json")).iconLibraries)
        .map(([id, library]) => ({ id, label: ICON_LABELS[id] ?? id, packages: Object.keys(library.packages) }));

/** The font catalog, for the docs */
export const getFonts = () => [...fontCatalog().values()].sort((a, b) => a.id.localeCompare(b.id));

/** How many components registry/ui ships */
export const getComponentCount = () => readdirSync(join(registryRoot, "ui/components")).filter((file) => file.endsWith(".tsx")).length;

/** Every custom property a stylesheet declares in its `:root` and `@theme static` blocks — and, for dark, its
    `.dark` blocks after them — in source order (`@layer` and `@theme inline` are left out). A declaration that
    reads itself is dropped: outside Tailwind it would be a cycle. */
const rootDeclarations = (css: string, mode: Mode): [string, string][] =>
{
    const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
    const found: [string, string][] = [];
    const opener = mode === "dark" ? /(?:^|\n)\s*(:root|@theme static|\.dark)\s*\{/g : /(?:^|\n)\s*(:root|@theme static)\s*\{/g;
    let match: RegExpExecArray | null;

    while ((match = opener.exec(source)))
    {
        let depth = 1;
        let end = opener.lastIndex;

        while (end < source.length && depth > 0)
        {
            if (source[end] === "{") depth++;
            else if (source[end] === "}") depth--;
            end++;
        }

        for (const [, name, value] of source.slice(opener.lastIndex, end - 1).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g))
        {
            if (!value.includes(`var(${name})`) && !value.includes(`var(${name},`)) found.push([name, value.trim()]);
        }
    }

    return found;
};

/** A token map as one CSS declaration list */
export const declareTokens = (values: Map<string, string>) => [...values].map(([key, value]) => `${key}: ${value};`).join(" ");

/** A system's own palette (theme.css) in one mode */
export const getSystemPalette = (name: string, mode: Mode) =>
    declareTokens(new Map(rootDeclarations(readFileSync(join(registryRoot, "systems", name, "styles/theme.css"), "utf8"), mode)));

/** A system's layer-1 formulas and materials (globals.css) and its layer-2 tokens (tokens.css) in one mode */
export const getSystemTokens = (name: string, mode: Mode) =>
{
    const styles = join(registryRoot, "systems", name, "styles");
    const values = new Map<string, string>();

    for (const file of ["globals.css", "tokens.css"])
    {
        for (const [key, value] of rootDeclarations(readFileSync(join(styles, file), "utf8"), mode)) values.set(key, value);
    }

    return values;
};

