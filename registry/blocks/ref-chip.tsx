import type { ReactNode } from "react";

import { cn } from "@tyohnn/lib/utils";

/** A reference in mono type on a muted chip: a branch and where it merges, a tag, a commit. Icons inside are drawn small. */
export const RefChip = ({ children, className }: { children: ReactNode; className?: string }) => (
    <span
        className={cn(
            "flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-muted px-1.5 font-mono text-[length:var(--ui-text-sm)] leading-[var(--ui-line-height-sm)] [&_svg]:size-[14px] [&_svg]:shrink-0",
            className,
        )}
    >
        {children}
    </span>
);
