import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@tyohnn/components/empty";

import type { TemplateEntry } from "../catalog";
import { NO_MOTION } from "../coverage/frame";

/**
 * A block template that is not built yet (catalog `built: false`): a page that fills the viewport and says
 * so. It still carries its `data-template` root, so tooling/snapshot/check-templates.mjs can open it.
 */
export const BlockPlaceholder = ({ entry }: { entry: TemplateEntry }) => (
    <div data-template={entry.id} data-placeholder="" className="flex min-h-svh items-center justify-center p-6">
        <style>{NO_MOTION}</style>
        <Empty>
            <EmptyHeader>
                <EmptyTitle>{entry.label}</EmptyTitle>
                <EmptyDescription>Not built yet. This template ports shadcn {entry.block} and fills its body with a product screen.</EmptyDescription>
            </EmptyHeader>
        </Empty>
    </div>
);
