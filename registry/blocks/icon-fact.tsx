import type { ReactNode } from "react";

import { NOTE } from "@tyohnn/blocks/lib/prose";
import { cn } from "@tyohnn/lib/utils";

/**
 * A short fact behind a small icon in a line of meta under a title: the date, the time, the place, how long it
 * takes to read. It wraps like text; in a table cell or a card, where the line must not break, use IconMeta.
 */
export const IconFact = ({ icon, children, className }: { icon: ReactNode; children: ReactNode; className?: string }) => (
    <span className={cn(NOTE, "flex items-center gap-1.5 [&_svg]:size-[14px] [&_svg]:shrink-0", className)}>{icon}{children}</span>
);
