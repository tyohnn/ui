import type { ComponentProps, ElementType, ReactNode } from "react";

import { DOCUMENT_PADDING, GAP, type Gap, GUTTER, GUTTER_INLINE, type Gutter, MEASURE, type Measure } from "@tyohnn/blocks/lib/frame";
import { cn } from "@tyohnn/lib/utils";

/**
 * The frame of a page: the content under the bar. It holds blocks and decides only where they stand — how far
 * from the edge, how far from each other, and what scrolls. It knows nothing about what is inside.
 *
 * `scroll="page"`: the content scrolls under the bar as one. `scroll="regions"`: the page is pinned to the height it
 * is given and something inside scrolls (a table in its card, a PagePane, a board's columns).
 *
 * Put it directly inside the inset, after the bar. It takes the height that is left (the inset is a column), so it
 * does not have to know how tall the bar is.
 *
 * `flush`: no gutter above, for a page under a bar that draws no rule — the bar's own height is the room.
 *
 * [contain:inline-size]: wide content (a table, a board) never widens the inset; it scrolls in place.
 */
export const Page = ({
    scroll = "page",
    gutter = "sm",
    gap = "sm",
    flush = false,
    className,
    children,
    ...props
}: {
    scroll?: "page" | "regions";
    gutter?: Gutter;
    gap?: Gap;
    flush?: boolean;
    children?: ReactNode;
} & ComponentProps<"div">) => (
    <div
        data-slot="page"
        data-scroll={scroll}
        className={cn("flex min-h-0 flex-[1_1_0px] flex-col [contain:inline-size]", GUTTER[gutter], gutter !== "none" && flush && "pt-0", GAP[gap], scroll === "page" && "overflow-y-auto", className)}
        {...props}
    >
        {children}
    </div>
);

/**
 * A region of a pinned page that scrolls by itself: the main column beside an aside, the reader under a toolbar.
 * It takes the room that is left, on either axis.
 */
export const PagePane = ({
    gutter = "none",
    gap = "none",
    flush = false,
    className,
    children,
    ...props
}: {
    gutter?: Gutter;
    gap?: Gap;
    /** No gutter above: the pane starts right under what is over it */
    flush?: boolean;
    children?: ReactNode;
} & ComponentProps<"div">) => (
    <div
        data-slot="page-pane"
        className={cn("flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto", GUTTER[gutter], gutter !== "none" && flush && "pt-0", GAP[gap], className)}
        {...props}
    >
        {children}
    </div>
);

/**
 * A column of blocks inside something that scrolls (a Page with `scroll="page"`, a PagePane): the gutter, the gap,
 * and optionally a measure — the widest the column gets, centred unless `align="start"`.
 *
 * `document`: the column is a document. The room above and below it is the document's own (a little above, more
 * below, so the last line can scroll clear of the edge) instead of the gutter.
 */
export const PageContent = <Tag extends ElementType = "div">({
    as,
    gutter = "sm",
    gap = "sm",
    measure,
    align = "center",
    document = false,
    className,
    children,
    ...props
}: {
    as?: Tag;
    gutter?: Gutter;
    gap?: Gap;
    measure?: Measure;
    align?: "center" | "start";
    document?: boolean;
    children?: ReactNode;
} & Omit<ComponentProps<Tag>, "as" | "children">) =>
{
    const Element: ElementType = as ?? "div";

    return (
        <Element
            data-slot="page-content"
            className={cn(
                "flex w-full shrink-0 flex-col",
                document ? cn(GUTTER_INLINE[gutter], DOCUMENT_PADDING) : GUTTER[gutter],
                GAP[gap],
                measure !== undefined && MEASURE[measure],
                measure !== undefined && align === "center" && "mx-auto",
                className,
            )}
            {...props}
        >
            {children}
        </Element>
    );
};
