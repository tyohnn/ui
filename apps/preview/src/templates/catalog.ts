/**
 * Every preview template: the one list the preview (templates/index.tsx), the site (apps/site/src/lib/site.ts)
 * and tooling/snapshot read. No React and no Vite imports, so a Next build can import it as it is.
 *
 * - `screen` — a product screen, shown by the site's galleries in category order (SCREEN_CATEGORIES). Most are
 *   shadcn's sidebar blocks (`sidebar-01` … `sidebar-16`, shadcn 4.21.0) with the sidebar ported as it is and
 *   the body filled as a product screen (templates/blocks/<id>); the CRM is tyohnn's own. A screen is a page
 *   that fills its viewport, so the viewport is the size it is designed, compared and screenshotted at.
 * - `sheet` — a component sheet for checking a system (component sheet, coverage, icons). The site shows none
 *   of them as a screen; its Components page embeds coverage section by section.
 *
 * `built: false` renders a placeholder page until the block's template exists (and the site hides it).
 */

export type TemplateKind = "screen" | "sheet";

export type ScreenCategory = "dashboards" | "workspace" | "planning" | "content";

export interface TemplateEntry
{
    id: string;
    /** The short name a picker shows */
    label: string;
    kind: TemplateKind;
    /** Screens only */
    category?: ScreenCategory;
    /** The shadcn block the sidebar is ported from */
    block?: `sidebar-${string}`;
    viewport: { width: number; height: number };
    /** A block whose template is not built yet renders a placeholder (and the site hides it) */
    built?: boolean;
}

/** Screen categories in the order the site lists them */
export const SCREEN_CATEGORIES: { id: ScreenCategory; label: string }[] = [
    { id: "dashboards", label: "Dashboards" },
    { id: "workspace", label: "Workspace" },
    { id: "planning", label: "Mail & planning" },
    { id: "content", label: "Docs & content" },
];

const FRAME = { width: 1200, height: 760 };
const BLOCK_VIEWPORT = { width: 1440, height: 900 };

const block = <Id extends string>(id: Id, label: string, number: string, category: ScreenCategory, built = false) => ({
    id,
    label,
    kind: "screen" as const,
    category,
    block: `sidebar-${number}` as const,
    viewport: BLOCK_VIEWPORT,
    built,
});

export const TEMPLATE_CATALOG = [
    { id: "crm-dashboard", label: "CRM", kind: "screen", category: "dashboards", viewport: { width: 1435, height: FRAME.height }, built: true },
    block("block-orders", "Orders", "05", "dashboards", true),
    block("block-analytics", "Analytics", "06", "dashboards", true),
    block("block-roadmap", "Roadmap", "04", "dashboards", true),
    block("block-team", "Team", "16", "dashboards", true),
    block("block-project", "Project", "08", "workspace", true),
    block("block-code-review", "Code review", "11", "workspace", true),
    block("block-ai-playground", "AI playground", "07", "workspace", true),
    block("block-settings-dialog", "Settings dialog", "13", "workspace", true),
    block("block-inbox", "Inbox", "09", "planning", true),
    block("block-editor", "Editor", "10", "planning", true),
    block("block-calendar", "Calendar", "12", "planning", true),
    block("block-meeting-notes", "Meeting notes", "15", "planning", true),
    block("block-docs", "Docs", "01", "content", true),
    block("block-api-reference", "API reference", "02", "content", true),
    block("block-help-center", "Help center", "03", "content", true),
    block("block-changelog", "Changelog", "14", "content", true),
    { id: "component-sheet", label: "Component sheet", kind: "sheet", viewport: FRAME, built: true },
    { id: "coverage", label: "Coverage", kind: "sheet", viewport: FRAME, built: true },
    { id: "icons", label: "Icons", kind: "sheet", viewport: FRAME, built: true },
] as const satisfies readonly TemplateEntry[];

export type TemplateId = (typeof TEMPLATE_CATALOG)[number]["id"];

export const templateEntry = (id: string): TemplateEntry | undefined => TEMPLATE_CATALOG.find((entry) => entry.id === id);
