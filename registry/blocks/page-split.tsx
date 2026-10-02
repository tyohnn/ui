import type { ComponentProps, ReactNode } from "react";

import { ASIDE_WIDTH, ASIDE_WIDTH_STACKED, type AsideWidth, GAP, type Gap } from "@tyohnn/blocks/lib/frame";
import { cn } from "@tyohnn/lib/utils";

/**
 * Two panes side by side: a main column that takes the room and a narrower one beside it. The first child is the
 * main pane and brings `min-w-0 flex-1` itself (a card that fills, a PagePane, a PageMain); the other is a
 * PageAside, or a block that is the pane with a width from ASIDE_WIDTH (lib/frame).
 *
 * `stack`: below `xl` the panes stand one under the other and the aside takes the full width (the row wraps, so
 * each pane keeps the height it had beside the other).
 */
export const PageSplit = ({
    gap = "sm",
    stack = false,
    className,
    children,
    ...props
}: {
    gap?: Gap;
    stack?: boolean;
    children?: ReactNode;
} & ComponentProps<"div">) => (
    <div data-slot="page-split" className={cn("flex min-h-0 min-w-0 flex-1", stack && "flex-wrap xl:flex-nowrap", GAP[gap], className)} {...props}>
        {children}
    </div>
);

/** The main pane of a split when what stands in it does not size itself: a plain column that takes the room. */
export const PageMain = ({ gap = "none", className, children, ...props }: { gap?: Gap; children?: ReactNode } & ComponentProps<"div">) => (
    <div data-slot="page-main" className={cn("flex min-h-0 min-w-0 flex-1 flex-col", GAP[gap], className)} {...props}>
        {children}
    </div>
);

/**
 * The narrower pane of a split: a column of blocks at one of the aside widths.
 *
 * `stack`: matches a PageSplit that stacks — full width below `xl`.
 * `scroll`: the pane scrolls by itself (in a pinned page whose aside can outgrow its height).
 */
export const PageAside = ({
    width = "md",
    gap = "sm",
    stack = false,
    scroll = false,
    className,
    children,
    ...props
}: {
    width?: AsideWidth;
    gap?: Gap;
    stack?: boolean;
    scroll?: boolean;
    children?: ReactNode;
} & ComponentProps<"div">) => (
    <div
        data-slot="page-aside"
        className={cn("flex min-h-0 min-w-0 flex-col", stack ? cn(ASIDE_WIDTH_STACKED[width], "xl:shrink-0") : cn(ASIDE_WIDTH[width], "shrink-0"), GAP[gap], scroll && "overflow-y-auto", className)}
        {...props}
    >
        {children}
    </div>
);
