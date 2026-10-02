import type { ReactNode } from "react";

import { cn } from "@tyohnn/lib/utils";

const KIND = { add: "text-success", del: "text-destructive" } as const;

/** A count of added or removed lines in mono, in the system's success or destructive colour ("+17", "−6"). */
export const DiffStat = ({ kind, children, className }: { kind: keyof typeof KIND; children: ReactNode; className?: string }) => (
    <span className={cn("font-mono text-[length:var(--ui-text-sm)] leading-[var(--ui-line-height-sm)]", KIND[kind], className)}>{children}</span>
);
