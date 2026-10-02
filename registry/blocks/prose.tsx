import type { ReactNode } from "react";

import { cn } from "@tyohnn/lib/utils";

const SIZE = { md: "text-[length:var(--ui-text-md)]", lg: "text-[length:var(--ui-text-lg)]" } as const;

/**
 * Written text inside a product screen — a mail's body, a chat reply — set with the system's typeset
 * (`typeset typeset-tool`: paragraphs, lists, inline code) but at a UI text step and aligned to the start instead
 * of centred on the page. Give the measure with `className` (`max-w-[72ch]`).
 */
export const Prose = ({ size = "md", children, className }: { size?: keyof typeof SIZE; children: ReactNode; className?: string }) => (
    <div className={cn("typeset typeset-tool mx-0", SIZE[size], className)}>{children}</div>
);
