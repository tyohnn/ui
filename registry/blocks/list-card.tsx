import type { ReactNode } from "react";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@tyohnn/components/card";
import { cn } from "@tyohnn/lib/utils";

/**
 * A card that fills the height it is given and holds a list: the title, one line of description and the list's
 * controls in a header over a divider, and the list running edge to edge and scrolling inside. Put a TaskList or
 * any list of full-width rows in it; for a table use DataTableCard.
 */
export const ListCard = ({
    title,
    description,
    controls,
    children,
    className,
}: {
    title: ReactNode;
    description?: ReactNode;
    /** The header's corner: a view switch, a filter button */
    controls?: ReactNode;
    children?: ReactNode;
    className?: string;
}) => (
    <Card className={cn("min-h-0 min-w-0 flex-1 gap-0", className)}>
        <CardHeader className="border-b border-border">
            <CardTitle>{title}</CardTitle>
            {description !== undefined && <CardDescription>{description}</CardDescription>}
            {controls !== undefined && <CardAction className="flex items-center gap-1.5">{controls}</CardAction>}
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto px-0">{children}</CardContent>
    </Card>
);
