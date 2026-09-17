// Shared by server and client components: no Node imports here.

// Relative on purpose: plain TS modules outside the app, compiled by Next like its own sources (no alias to keep in sync).
import { COVERAGE_GROUPS, COVERAGE_POPUP_SECTIONS } from "../../../preview/src/templates/coverage/groups";
import { SCREEN_CATEGORIES, TEMPLATE_CATALOG, type ScreenCategory, type TemplateEntry, type TemplateId } from "../../../preview/src/templates/catalog";

export type Mode = "light" | "dark";

export interface FontInfo
{
    id: string;
    family: string;
    /** The family name the site's self-hosted copy registers (fontsource "… Variable" names) */
    cssFamily: string;
    category: string;
    license: string;
}

export interface SystemInfo
{
    name: string;
    description: string;
    /** Three short facts joined by " · " */
    tagline: string;
    /** ISO 8601: when the system joined the registry */
    added: string;
    fonts: { sans: FontInfo; heading: FontInfo | null; mono: FontInfo | null; hangulFallback: FontInfo };
    /** The CSS font-family a system's name is set in: its heading font, else its sans */
    nameFont: string;
    icons: { id: string; label: string; packages: string[] };
    defaultMode: Mode;
    /** Five layer-1 colours of the default mode: background, muted, border, primary, foreground */
    palette: string[];
}

/** What a client component needs of a system */
export type SystemSummary = Pick<SystemInfo, "name" | "tagline" | "nameFont" | "defaultMode" | "palette">;

export const summarize = ({ name, tagline, nameFont, defaultMode, palette }: SystemInfo): SystemSummary => ({ name, tagline, nameFont, defaultMode, palette });

/** The product screens the site shows, in category order (apps/preview/src/templates/catalog.ts) */
export const SCREENS: readonly TemplateEntry[] = TEMPLATE_CATALOG.filter((entry) => entry.kind === "screen" && entry.built);

export const CATEGORIES: { id: ScreenCategory; label: string; screens: TemplateEntry[] }[] = SCREEN_CATEGORIES
    .map((category) => ({ ...category, screens: SCREENS.filter((screen) => screen.category === category.id) }))
    .filter((category) => category.screens.length > 0);

export type { TemplateEntry, TemplateId };

export const isScreen = (value: string | null | undefined): value is TemplateId => SCREENS.some((screen) => screen.id === value);

export const screenOf = (id: string): TemplateEntry => SCREENS.find((screen) => screen.id === id) ?? SCREENS[0];

export const DEFAULT_SCREEN: TemplateId = "crm-dashboard";

/** Where a screen comes from, as the system page's meta line says it */
export const screenSource = (entry: TemplateEntry) => entry.block ?? "tyohnn";

/** A per-system preview build (scripts/build-previews.mjs) served from the same origin */
export const previewUrl = (system: string, template: string, mode: Mode, section?: string) =>
    `/preview/${system}/index.html?template=${template}&mode=${mode}${section ? `&section=${section}` : ""}`;

export const COVERAGE = COVERAGE_GROUPS.map((group) => ({ id: group.id, label: group.label, sections: [...group.sections] }));

export const COVERAGE_POPUPS = new Set(COVERAGE_POPUP_SECTIONS);

export const REPOSITORY = "https://github.com/john-yeon/tyohnn";
