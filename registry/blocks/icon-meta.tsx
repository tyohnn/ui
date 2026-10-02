import type { ReactNode } from "react";

import { META } from "@tyohnn/blocks/lib/text";
import { cn } from "@tyohnn/lib/utils";

/** One line of meta text behind a small icon: when something expires, where it is, how long it takes. */
export const IconMeta = ({ icon, children, className }: { icon: ReactNode; children: ReactNode; className?: string }) => (
    <span className={cn(META, "flex items-center gap-1 [&_svg]:size-[14px] [&_svg]:shrink-0", className)}>{icon}{children}</span>
);
