import type { ReactNode } from "react";

import { cn } from "@tyohnn/lib/utils";

/**
 * Long-form text on the system's typeset: headings, paragraphs, lists, quotes and inline code take the system's
 * reading rhythm. `preset="tool"` is text inside a product screen (docs, a release post, notes), `document` a
 * page that is read on its own. It is as wide as the place it is put in — give it a measure with `className`.
 * A component set in the text carries `IN_PROSE` (lib/prose.ts) so the typeset rules leave it alone.
 */
export const Prose = ({
    as: Tag = "div",
    preset = "tool",
    children,
    className,
}: {
    as?: "div" | "article" | "section";
    preset?: "tool" | "document";
    children: ReactNode;
    className?: string;
}) => (
    <Tag className={cn("typeset", preset === "tool" && "typeset-tool", "mx-0 max-w-none [&>:first-child]:mt-0", className)}>{children}</Tag>
);
