import type { ReactNode } from "react";

import { PendingText, pendingFrame } from "@tyohnn/blocks/pending";
import { cn } from "@tyohnn/lib/utils";

/**
 * The bar at the top of a page inside an app window: the page's title with its status beside it, and the global
 * actions (search, notifications, the account) at the other end, over a divider. When the two do not fit on one
 * line the actions go under the title. `loading` draws a bar for the title and leaves the status badge out; the
 * actions stay.
 */
export const PageBar = ({ leading, title, status, actions, loading, className }: { /** Before the title: the sidebar's trigger where the sidebar can close */ leading?: ReactNode; title?: ReactNode; /** A badge next to the title */ status?: ReactNode; actions?: ReactNode; loading?: boolean; className?: string }) => (
    <header {...pendingFrame(loading)} className={cn("flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border px-4 py-2.5", className)}>
        <div className="flex min-w-0 items-center gap-2.5">
            {leading}
            <h1 className="m-0 font-heading text-[length:var(--heading-font-size-sm)] leading-[var(--heading-line-height-sm)] font-semibold tracking-[var(--heading-letter-spacing)]">{loading ? <PendingText length={10} /> : title}</h1>
            {!loading && status}
        </div>
        {actions !== undefined && <div className="flex items-center gap-2">{actions}</div>}
    </header>
);
