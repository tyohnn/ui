import type { ReactNode } from "react";

import { FIGURE } from "@tyohnn/blocks/lib/text";
import { cn } from "@tyohnn/lib/utils";

export type SummaryCell = { label: string } & ({ value: ReactNode; icon?: undefined } | { icon: ReactNode; value?: undefined });

/**
 * The band under a table that sums it up, in equal cells with a hairline between them: a figure with what it
 * counts ("20 companies in view"), or an icon with a calculation to add. A label wraps inside its cell, and breaks
 * a word rather than leave it, when the band is narrow.
 */
export const SummaryBar = ({ cells, className }: { cells: readonly SummaryCell[]; className?: string }) => (
    <div
        className={cn("grid border-b border-border text-[length:var(--ui-text-sm)] leading-[var(--ui-line-height-sm)] text-muted-foreground", className)}
        style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
    >
        {cells.map((cell) => (
            <div key={cell.label} className={cn("flex items-center border-s border-border px-3 py-2 first:border-s-0 [&_svg]:size-[var(--control-icon-size-sm)]", cell.value === undefined ? "gap-2.5" : "gap-2")}>
                {cell.value === undefined ? cell.icon : <span className={cn(FIGURE, "text-foreground")}>{cell.value}</span>}
                <span className="min-w-0 [overflow-wrap:anywhere]">{cell.label}</span>
            </div>
        ))}
    </div>
);
