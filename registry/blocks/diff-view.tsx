import type { ReactNode } from "react";

import { cn } from "@tyohnn/lib/utils";

export type DiffViewLine =
    | { kind: "hunk"; text: string }
    | {
        kind: "context" | "add" | "del";
        /** Line number before the change */
        old?: number;
        /** Line number after the change */
        new?: number;
        text: string;
        /** Shown under the line, across the diff: a CommentThread */
        below?: ReactNode;
    };

const ROW = "grid grid-cols-[3rem_3rem_minmax(0,1fr)]";
const GUTTER = "px-[0.5rem] text-right select-none";
const CODE = "overflow-hidden px-[0.75rem] text-ellipsis whitespace-pre";

const LINE = { context: "", add: "bg-success-soft", del: "bg-destructive-soft" } as const;
const MARK = { context: "text-muted-foreground", add: "text-success", del: "text-destructive" } as const;
const SIGN = { context: " ", add: "+", del: "−" } as const;

/**
 * A unified diff: hunk headers and lines with the old and new line numbers in two gutters, added lines on the
 * system's soft success colour and removed ones on its soft destructive colour, in mono type. A line can carry
 * something `below` it (the comments on that line). A long line is cut, not wrapped. `label` names the diff for
 * assistive technology. Put it in a DiffFile under the file's header.
 */
export const DiffView = ({ lines, label, className }: { lines: readonly DiffViewLine[]; label: string; className?: string }) => (
    <div className={cn("bg-background font-mono text-[length:var(--ui-text-sm)] leading-[1.7]", className)} role="table" aria-label={label}>
        {lines.map((line, index) =>
        {
            if (line.kind === "hunk")
            {
                return (
                    <div key={index} className={cn(ROW, "bg-muted text-muted-foreground")} role="row">
                        <span className={cn(GUTTER, "text-muted-foreground")} />
                        <span className={cn(GUTTER, "text-muted-foreground")} />
                        <span className={CODE}>{line.text}</span>
                    </div>
                );
            }

            return (
                <div key={index}>
                    <div className={cn(ROW, LINE[line.kind])} role="row">
                        <span className={cn(GUTTER, MARK[line.kind])}>{line.old ?? ""}</span>
                        <span className={cn(GUTTER, MARK[line.kind])}>{line.new ?? ""}</span>
                        <span className={CODE}><span className={cn("inline-block w-[1.25ch] select-none", MARK[line.kind])}>{SIGN[line.kind]}</span>{line.text}</span>
                    </div>
                    {line.below}
                </div>
            );
        })}
    </div>
);
