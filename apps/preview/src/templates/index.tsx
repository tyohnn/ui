import type { ComponentType } from "react";

import { BlockAiPlayground } from "./blocks/block-ai-playground";
import { BlockEditor } from "./blocks/block-editor";
import { BlockInbox } from "./blocks/block-inbox";
import { BlockPlaceholder } from "./blocks/placeholder";
import { TEMPLATE_CATALOG, type TemplateId } from "./catalog";
import { ComponentSheet } from "./component-sheet";
import { Coverage } from "./coverage";
import { CrmDashboard } from "./crm-dashboard";
import { IconSheet } from "./icons";

/** `?section=<name>` renders one coverage section with its popups open (see coverage/index.tsx). */
const CoverageTemplate = () => <Coverage section={new URLSearchParams(location.search).get("section")} />;

/**
 * The built templates by catalog id. A catalog entry without one (a block marked `built: false`) renders
 * the placeholder page; an id here that the catalog does not list is a type error.
 */
const BUILT: Partial<Record<TemplateId, ComponentType>> = {
    "block-ai-playground": BlockAiPlayground,
    "block-editor": BlockEditor,
    "block-inbox": BlockInbox,
    "component-sheet": ComponentSheet,
    coverage: CoverageTemplate,
    "crm-dashboard": CrmDashboard,
    icons: IconSheet,
};

export const templates: Record<string, ComponentType> = Object.fromEntries(
    TEMPLATE_CATALOG.map((entry) =>
    {
        const Built = BUILT[entry.id];

        return [entry.id, Built ?? (() => <BlockPlaceholder entry={entry} />)];
    }),
);
