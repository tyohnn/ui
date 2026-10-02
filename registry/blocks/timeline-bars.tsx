import type { ReactNode } from "react";

import { Progress } from "@tyohnn/components/progress";
import { BODY, NOTE } from "@tyohnn/blocks/lib/prose";
import { cn } from "@tyohnn/lib/utils";

export type TimelineRow = {
    id: string;
    name: ReactNode;
    /** One line under the name: the owner, the state */
    meta?: ReactNode;
    /** Where the bar starts and how long it is, in percent of the scale */
    start: number;
    span: number;
    /** 0–100, drawn inside the bar */
    progress: number;
    /** The progress bar's accessible name */
    progressLabel: string;
};

/**
 * A plan on a time scale: the scale's steps (months, weeks) across the top, and a row per project with its name
 * and a bar placed along the scale that carries its progress.
 */
export const TimelineBars = ({ scale, rows, className }: { scale: readonly string[]; rows: readonly TimelineRow[]; className?: string }) => (
    <div className={cn("flex flex-col gap-3", className)}>
        <div
            className="ms-[calc(11rem+0.75rem)] grid text-[length:var(--ui-text-xs)] leading-[var(--ui-line-height-xs)] text-muted-foreground"
            style={{ gridTemplateColumns: `repeat(${scale.length}, minmax(0, 1fr))` }}
        >
            {scale.map((step) => <span key={step} className="border-s border-border ps-2">{step}</span>)}
        </div>
        {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)] items-center gap-3">
                <div className="flex min-w-0 flex-col">
                    <span className={cn(BODY, "truncate font-medium")}>{row.name}</span>
                    {row.meta !== undefined && <span className={NOTE}>{row.meta}</span>}
                </div>
                <div className="rounded-[var(--radius-md)] bg-muted py-1.5">
                    <div className="flex h-6 items-center rounded-[var(--radius-md)] border border-border bg-background px-2" style={{ marginInlineStart: `${row.start}%`, width: `${row.span}%` }}>
                        <Progress value={row.progress} aria-label={row.progressLabel} className="w-full" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);
