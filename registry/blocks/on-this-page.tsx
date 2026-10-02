import type { ReactNode } from "react";

import { Separator } from "@tyohnn/components/separator";
import { cn } from "@tyohnn/lib/utils";
import { strings } from "@tyohnn/strings";

export type PageAnchor = {
    /** The id of the heading the link jumps to */
    id: string;
    label: string;
    /** The section being read */
    active?: boolean;
    /** A sub-section, set in under the one before it */
    nested?: boolean;
};

const LINK = {
    active: "font-medium text-foreground no-underline",
    idle: "text-muted-foreground no-underline",
} as const;

/**
 * The table of contents beside a long page: the headings as links, the one being read marked, sub-sections set
 * in, and a note under a divider. It sticks to the top of the scrolling pane while the page moves.
 */
export const OnThisPage = ({
    label = strings.blocks.onThisPage.title,
    title = strings.blocks.onThisPage.title,
    items,
    note,
    className,
}: {
    /** The title over the links; the locale's "On this page" when left out */
    title?: ReactNode;
    /** The navigation's accessible name; the locale's own words when left out */
    label?: string;
    items: readonly PageAnchor[];
    note?: ReactNode;
    className?: string;
}) => (
    <nav aria-label={label} className={cn("sticky top-8 flex flex-col gap-3 self-start text-[length:var(--ui-text-sm)] leading-[var(--ui-line-height-sm)]", className)}>
        <span className="font-semibold text-foreground">{title}</span>
        <ul className="flex flex-col gap-2">
            {items.map((item) => (
                <li key={item.id} className={item.nested ? "pl-3" : undefined}>
                    <a href={`#${item.id}`} aria-current={item.active ? "location" : undefined} className={item.active ? LINK.active : LINK.idle}>{item.label}</a>
                </li>
            ))}
        </ul>
        {note !== undefined && (
            <>
                <Separator />
                <span className="text-muted-foreground">{note}</span>
            </>
        )}
    </nav>
);
