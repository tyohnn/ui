// Shared by server and client components: no Node imports here.

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

/** The preview templates (apps/preview/src/templates) the site shows, in tab order */
export const TEMPLATES = [
    { id: "crm-dashboard", label: "CRM dashboard" },
    { id: "component-sheet", label: "Component sheet" },
    { id: "coverage", label: "Coverage" },
    { id: "icons", label: "Icons" },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]["id"];

export const isTemplate = (value: string | null | undefined): value is TemplateId =>
    TEMPLATES.some((template) => template.id === value);

/** A per-system preview build (scripts/build-previews.mjs) served from the same origin */
export const previewUrl = (system: string, template: TemplateId, mode: Mode) =>
    `/preview/${system}/index.html?template=${template}&mode=${mode}`;

/** The system the site itself is built with (src/app/globals.css, tsconfig `@tyohnn/icons`) */
export const SITE_SYSTEM = "mira";
