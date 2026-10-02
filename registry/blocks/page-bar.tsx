import type { ReactNode } from "react";

import { cn } from "@tyohnn/lib/utils";

/**
 * The bar at the top of a page inside an app window: the page's title with its status beside it, and the global
 * actions (search, notifications, the account) at the other end, over a divider.
 */
export const PageBar = ({ title, status, actions, className }: { title: ReactNode; /** A badge next to the title */ status?: ReactNode; actions?: ReactNode; className?: string }) => (
    <header className={cn("flex items-center justify-between gap-4 border-b border-border px-4 py-2.5", className)}>
        <div className="flex items-center gap-2.5">
            <h1 className="m-0 font-heading text-[length:var(--heading-font-size-sm)] leading-[var(--heading-line-height-sm)] font-semibold tracking-[var(--heading-letter-spacing)]">{title}</h1>
            {status}
        </div>
        {actions !== undefined && <div className="flex items-center gap-2">{actions}</div>}
    </header>
);
