import type { ReactNode } from "react";

import { PARAGRAPH, NOTE } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

const TONE = { success: "[&>svg]:text-success", destructive: "[&>svg]:text-destructive", muted: "[&>svg]:text-muted-foreground" } as const;

/**
 * One row of a short list in a side column: something in front (a small avatar, or a state icon in the `tone`'s
 * colour), a name that is cut when it is long, and at the end its state as a badge (`trailing`) or as small text
 * (`note`). A reviewer and their verdict, a check and how long it took.
 */
export const StatusLine = ({
    leading,
    tone,
    label,
    note,
    trailing,
    className,
}: {
    leading?: ReactNode;
    /** The colour of a leading icon */
    tone?: keyof typeof TONE;
    label: ReactNode;
    note?: ReactNode;
    trailing?: ReactNode;
    className?: string;
}) => (
    <div className={cn("flex items-center gap-2 [&>svg]:size-[14px] [&>svg]:shrink-0", tone !== undefined && TONE[tone], className)}>
        {leading}
        <span className={cn(PARAGRAPH, "min-w-0 flex-1 truncate")}>{label}</span>
        {note !== undefined && <span className={cn(NOTE, "whitespace-nowrap")}>{note}</span>}
        {trailing}
    </div>
);
