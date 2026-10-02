import type { ReactNode } from "react";

import { PendingText, pendingFrame } from "@tyohnn/blocks/pending";
import { cn } from "@tyohnn/lib/utils";

/**
 * The bar at the top of a page inside an app window: the page's title with its status beside it, and the global
 * actions (search, notifications, the account) at the other end, over a divider. `loading` draws a bar for the
 * title and leaves the status badge out; the actions stay.
 */
export const PageBar = ({ title, status, actions, loading, className }: { title?: ReactNode; /** A badge next to the title */ status?: ReactNode; actions?: ReactNode; loading?: boolean; className?: string }) => (
    <header {...pendingFrame(loading)} className={cn("flex items-center justify-between gap-4 border-b border-border px-4 py-2.5", className)}>
        <div className="flex items-center gap-2.5">
            <h1 className="m-0 font-heading text-[length:var(--heading-font-size-sm)] leading-[var(--heading-line-height-sm)] font-semibold tracking-[var(--heading-letter-spacing)]">{loading ? <PendingText length={10} /> : title}</h1>
            {!loading && status}
        </div>
        {actions !== undefined && <div className="flex items-center gap-2">{actions}</div>}
    </header>
);
