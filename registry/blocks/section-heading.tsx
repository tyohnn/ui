import type { ReactNode } from "react";

import { NOTE } from "@tyohnn/blocks/lib/prose";
import { TITLE } from "@tyohnn/blocks/lib/text";
import { cn } from "@tyohnn/lib/utils";

/**
 * A section's title in a page of notes or a document, with a short meta at the end of the line: how long it
 * takes, how much is done. For a title over a sentence of description use SectionIntro.
 */
export const SectionHeading = ({ title, meta, className }: { title: ReactNode; meta?: ReactNode; className?: string }) => (
    <div className={cn("flex items-baseline justify-between gap-3", className)}>
        <h2 className={TITLE}>{title}</h2>
        {meta !== undefined && <span className={NOTE}>{meta}</span>}
    </div>
);
