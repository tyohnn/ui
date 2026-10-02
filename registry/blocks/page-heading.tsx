import type { ReactNode } from "react";

import { META, TITLE } from "@tyohnn/blocks/lib/text";
import { cn } from "@tyohnn/lib/utils";

/**
 * The head of a page body: the title with one meta line under it, and the page's actions on the other side.
 * The actions wrap under the title when the row runs out of width.
 */
export const PageHeading = ({ title, meta, actions, className }: { title: ReactNode; meta?: ReactNode; actions?: ReactNode; className?: string }) => (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-4 gap-y-2", className)}>
        <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className={TITLE}>{title}</h1>
            {meta !== undefined && <span className={META}>{meta}</span>}
        </div>
        {actions !== undefined && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
);
