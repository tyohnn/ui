import type { ReactNode } from "react";

import { NOTE } from "@tyohnn/blocks/lib/copy";
import { PendingText, pendingFrame } from "@tyohnn/blocks/lib/pending";
import { TITLE } from "@tyohnn/blocks/lib/text";
import { cn } from "@tyohnn/lib/utils";

/**
 * A section's title in a page of notes or a document, with a short meta at the end of the line: how long it
 * takes, how much is done. For a title over a sentence of description use SectionHeading. `loading` draws bars
 * for the title and the meta.
 */
export const SectionTitle = ({ title, meta, loading, className }: { title?: ReactNode; meta?: ReactNode; loading?: boolean; className?: string }) => (
    <div {...pendingFrame(loading)} className={cn("flex items-baseline justify-between gap-3", className)}>
        <h2 className={TITLE}>{loading ? <PendingText length={14} /> : title}</h2>
        {meta !== undefined && <span className={NOTE}>{loading ? <PendingText length={8} /> : meta}</span>}
    </div>
);
