// Shared by server and client components: no Node imports here.

// Relative on purpose: a plain TS module outside the app, compiled by Next like its own sources (no alias to keep in sync).
import { TEMPLATE_CATALOG, TEMPLATE_GROUPS, type TemplateEntry, type TemplateId } from "../../../preview/src/templates/catalog";

export type Mode = "light" | "dark";

export interface FontInfo
{
    id: string;
    family: string;
    category: string;
    license: string;
}

export interface SystemInfo
{
    name: string;
    description: string;
    /** The description up to its first colon: the mood in a few words */
    mood: string;
    fonts: { sans: FontInfo; heading: FontInfo | null; mono: FontInfo | null; hangulFallback: FontInfo };
    icons: { id: string; label: string; packages: string[] };
    defaultMode: Mode;
    tags: string[];
    /** One sentence on where the values come from */
    origin: string;
}

/**
 * The preview templates the site shows, in picker order: apps/preview/src/templates/catalog.ts, the list the
 * preview registers from. Blocks whose template is not built yet (`built: false`) are hidden, not shown as
 * "soon": their placeholder page says nothing about a system.
 */
export const TEMPLATES: readonly TemplateEntry[] = TEMPLATE_CATALOG.filter((template) => template.built);

export { TEMPLATE_GROUPS };
export type { TemplateEntry, TemplateId };

export const isTemplate = (value: string | null | undefined): value is TemplateId =>
    TEMPLATES.some((template) => template.id === value);

/** The catalog entry of a shown template (its viewport sizes the frames) */
export const templateOf = (id: TemplateId): TemplateEntry => TEMPLATES.find((template) => template.id === id) ?? TEMPLATES[0];

export const DEFAULT_TEMPLATE: TemplateId = "crm-dashboard";

/** A per-system preview build (scripts/build-previews.mjs) served from the same origin */
export const previewUrl = (system: string, template: TemplateId, mode: Mode) =>
    `/preview/${system}/index.html?template=${template}&mode=${mode}`;

/** The system the site itself is built with (src/app/globals.css, tsconfig `@tyohnn/icons`) */
export const SITE_SYSTEM = "mira";
