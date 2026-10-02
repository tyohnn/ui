import type { ReactNode } from "react";

import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@tyohnn/components/card";
import { cn } from "@tyohnn/lib/utils";

/**
 * A small titled card for a side column: the title with one line of description, an action or a badge in the
 * corner, the content, and buttons in the footer. The content is a column with the card's own gap.
 */
export const InfoCard = ({
    title,
    description,
    action,
    footer,
    children,
    className,
    contentClassName,
}: {
    title: ReactNode;
    description?: ReactNode;
    /** The header's corner: a badge or an icon button */
    action?: ReactNode;
    /** Buttons under the content */
    footer?: ReactNode;
    children?: ReactNode;
    className?: string;
    contentClassName?: string;
}) => (
    <Card size="sm" className={cn("shrink-0", className)}>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description !== undefined && <CardDescription>{description}</CardDescription>}
            {action !== undefined && <CardAction>{action}</CardAction>}
        </CardHeader>
        {children !== undefined && <CardContent className={contentClassName}>{children}</CardContent>}
        {footer !== undefined && <CardFooter className="flex flex-wrap gap-2">{footer}</CardFooter>}
    </Card>
);
