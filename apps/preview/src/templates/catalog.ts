/**
 * Every preview template, in picker order: the one list the preview (templates/index.tsx) and the site
 * (apps/site/src/lib/site.ts) read. No React and no Vite imports, so a Next build can import it as it is.
 *
 * - `showcase` — the hand-made sheets and screens. Their viewport is the frame the site shows them in.
 * - `blocks` — shadcn's sidebar blocks (`sidebar-01` … `sidebar-16`, shadcn 4.21.0) with the sidebar ported
 *   as it is and the body filled as a product screen (templates/blocks/<id>). A block template is a page that
 *   fills its viewport, so the viewport is the size it is designed, compared and screenshotted at.
 *   `built: false` renders a placeholder page until the block's template exists.
 */

export type TemplateGroup = "showcase" | "blocks";

export interface TemplateEntry
{
    id: string;
    label: string;
    group: TemplateGroup;
    /** The shadcn block the sidebar is ported from */
    block?: `sidebar-${string}`;
    viewport: { width: number; height: number };
    /** A block whose template is not built yet renders a placeholder (and the site hides it) */
    built?: boolean;
}

export const TEMPLATE_GROUPS: { id: TemplateGroup; label: string }[] = [
    { id: "showcase", label: "Showcase" },
    { id: "blocks", label: "Blocks" },
];

const FRAME = { width: 1200, height: 760 };
const BLOCK_VIEWPORT = { width: 1440, height: 900 };

const block = <Id extends string>(id: Id, name: string, number: string, built = false) => ({
    id,
    label: `${name} · sidebar-${number}`,
    group: "blocks" as const,
    block: `sidebar-${number}` as const,
    viewport: BLOCK_VIEWPORT,
    built,
});

export const TEMPLATE_CATALOG = [
    { id: "crm-dashboard", label: "CRM dashboard", group: "showcase", viewport: { width: 1435, height: FRAME.height }, built: true },
    { id: "component-sheet", label: "Component sheet", group: "showcase", viewport: FRAME, built: true },
    { id: "coverage", label: "Coverage", group: "showcase", viewport: FRAME, built: true },
    { id: "icons", label: "Icons", group: "showcase", viewport: FRAME, built: true },
    block("block-docs", "Docs", "01"),
    block("block-api-reference", "API reference", "02"),
    block("block-help-center", "Help center", "03"),
    block("block-roadmap", "Roadmap", "04"),
    block("block-orders", "Orders", "05"),
    block("block-analytics", "Analytics", "06"),
    block("block-ai-playground", "AI playground", "07"),
    block("block-project", "Project", "08"),
    block("block-inbox", "Inbox", "09"),
    block("block-editor", "Editor", "10"),
    block("block-code-review", "Code review", "11"),
    block("block-calendar", "Calendar", "12"),
    block("block-settings-dialog", "Settings dialog", "13"),
    block("block-changelog", "Changelog", "14"),
    block("block-meeting-notes", "Meeting notes", "15"),
    block("block-team", "Team", "16"),
] as const satisfies readonly TemplateEntry[];

export type TemplateId = (typeof TEMPLATE_CATALOG)[number]["id"];

export const templateEntry = (id: string): TemplateEntry | undefined => TEMPLATE_CATALOG.find((entry) => entry.id === id);
