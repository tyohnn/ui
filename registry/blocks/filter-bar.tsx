import type { ReactNode } from "react";

import { cn } from "@tyohnn/lib/utils";

/** The band over a table or a board: the filters that narrow it on one side, the actions that add to it or export it on the other. */
export const FilterBar = ({ filters, actions, className }: { filters?: ReactNode; actions?: ReactNode; className?: string }) => (
    <div className={cn("flex items-center justify-between gap-4 px-4 py-4", className)}>
        <div className="flex items-center gap-2">{filters}</div>
        {actions !== undefined && <div className="flex items-center gap-1.5">{actions}</div>}
    </div>
);
