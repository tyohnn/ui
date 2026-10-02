import type { ReactNode } from "react";

import { cn } from "@tyohnn/lib/utils";

/** A name over a caption, each on one line: a product and its section, a count and what it counts. */
export const TwoLineLabel = ({ title, subtitle, className }: { title: ReactNode; subtitle: ReactNode; className?: string }) => (
    <div className={cn("flex min-w-0 flex-col whitespace-nowrap", className)}>
        <span className="text-[length:var(--ui-text-md)] leading-[var(--ui-line-height-md)] text-foreground" style={{ fontWeight: "var(--ui-font-weight)" }}>{title}</span>
        <span className="text-[length:var(--ui-text-xs)] leading-[var(--ui-line-height-xs)] text-muted-foreground">{subtitle}</span>
    </div>
);
