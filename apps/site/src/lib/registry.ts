// Build-time data: every design system and font, read from the registry when the site is built.
// Server components only (Node fs). Nothing here is hard-coded per system.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { SITE_SYSTEM, type FontInfo, type Mode, type SystemInfo } from "./site";

// `next build` and `next dev` run with apps/site as the working directory.
const registryRoot = join(process.cwd(), "../../registry");

const readJson = <T>(file: string): T => JSON.parse(readFileSync(file, "utf8")) as T;

interface SystemJson
{
    name: string;
    description: string;
    fonts: { sans: string; heading: string; mono: string; hangulFallback: string };
    icons?: { library: string };
    defaultMode?: Mode;
    tags?: string[];
    source?: { kind: string; preset?: string; shadcnVersion?: string; note?: string };
}

interface FontJson
{
    id: string;
    family: string;
    category: string;
    license: { name: string };
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
        .map((font) => [font.id, { id: font.id, family: font.family, category: font.category, license: font.license.name }]));

const origin = (source: SystemJson["source"]) =>
{
    if (source?.kind === "shadcn-preset")
    {
        return `Ported from the shadcn ${source.preset} preset, verified against a shadcn@${source.shadcnVersion} reference app.`;
    }

    if (source?.kind === "reference-screenshot") return "Fitted to a reference screenshot.";

    return "Built in the tyohnn registry.";
};

let cache: SystemInfo[] | null = null;

/** Every system in registry/systems, sorted by name (foundation is a maintainer copy and is not listed) */
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
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((system) =>
        {
            const library = system.icons?.library ?? "lucide";

            return {
                name: system.name,
                description: system.description,
                mood: system.description.split(":")[0].trim(),
                fonts: {
                    sans: font(system.fonts.sans),
                    heading: system.fonts.heading === "inherit" ? null : font(system.fonts.heading),
                    mono: system.fonts.mono === "system" ? null : font(system.fonts.mono),
                    hangulFallback: font(system.fonts.hangulFallback),
                },
                icons: {
                    id: library,
                    label: ICON_LABELS[library] ?? library,
                    packages: Object.keys(manifest.iconLibraries[library]?.packages ?? {}),
                },
                defaultMode: system.defaultMode ?? "light",
                tags: (system.tags ?? []).filter((tag) => tag !== "shadcn-preset"),
                origin: origin(system.source),
            };
        });

    // The site's own stylesheet and icon alias are wired to one system; fail the build if they drift apart.
    const site = cache.find((system) => system.name === SITE_SYSTEM);

    if (site?.icons.id !== "hugeicons") throw new Error(`site system ${SITE_SYSTEM} must use hugeicons (tsconfig @tyohnn/icons)`);

    return cache;
};

export const getSystem = (name: string) => getSystems().find((system) => system.name === name);

/** Catalog font ids, for the docs' font examples */
export const getFontIds = () => [...fontCatalog().keys()].sort();

export const getIconLibraries = () =>
    Object.entries(readJson<Manifest>(join(registryRoot, "ui/manifest.json")).iconLibraries)
        .map(([id, library]) => ({ id, label: ICON_LABELS[id] ?? id, packages: Object.keys(library.packages) }));
