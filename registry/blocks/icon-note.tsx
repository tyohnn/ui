import type { ReactNode } from "react";

import { NOTE } from "@tyohnn/blocks/lib/prose";
import { cn } from "@tyohnn/lib/utils";

/**
 * A short note behind a small icon, in running text that may wrap: when something happened, what a list is synced
 * with. For a one-line figure that lines up with others (a count, an expiry) use IconMeta.
 */
export const IconNote = ({ icon, children, className }: { icon: ReactNode; children: ReactNode; className?: string }) => (
    <span className={cn(NOTE, "flex items-center gap-1 [&_svg]:size-[14px] [&_svg]:shrink-0", className)}>{icon}{children}</span>
);
