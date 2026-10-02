import type { ReactNode } from "react";

import { NOTE } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

/**
 * How an article opens: the chapter it belongs to over the title, a lead paragraph, and a line of meta (version
 * badges, reading time, who updated it). It is the first thing inside Prose, which sets the title and the lead.
 */
export const ArticleHeading = ({ eyebrow, title, lead, meta }: { eyebrow?: ReactNode; title: ReactNode; lead?: ReactNode; meta?: ReactNode }) => (
    <>
        {eyebrow !== undefined && <p className={cn("m-0", NOTE)}>{eyebrow}</p>}
        <h1 className={eyebrow === undefined ? undefined : "mt-1"}>{title}</h1>
        {lead !== undefined && <p className="text-muted-foreground">{lead}</p>}
        {meta !== undefined && <div className={cn("not-typeset mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 [&_svg]:size-[14px]", NOTE)}>{meta}</div>}
    </>
);
