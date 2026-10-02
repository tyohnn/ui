import type { ReactNode } from "react";

import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@tyohnn/components/card";
import { NOTE } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

/**
 * A titled card for a section of a page's main column: the title with one line of description, an action in the
 * corner, the content, and a footer with a note — behind an icon, or with an action at the other end. For a small
 * card in a side column use InfoCard.
 */
export const SectionCard = ({
    title,
    description,
    action,
    footerIcon,
    footerNote,
    footerAction,
    children,
    className,
    contentClassName,
}: {
    title: ReactNode;
    description?: ReactNode;
    /** The header's corner: a button or a badge */
    action?: ReactNode;
    /** An icon before the footer's note */
    footerIcon?: ReactNode;
    /** The footer's line: a summary of the content, or where else to turn */
    footerNote?: ReactNode;
    /** The footer's other end: a button */
    footerAction?: ReactNode;
    children?: ReactNode;
    className?: string;
    contentClassName?: string;
}) => (
    <Card className={className}>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description !== undefined && <CardDescription>{description}</CardDescription>}
            {action !== undefined && <CardAction>{action}</CardAction>}
        </CardHeader>
        {children !== undefined && <CardContent className={contentClassName}>{children}</CardContent>}
        {(footerNote !== undefined || footerAction !== undefined) && (
            <CardFooter className={cn("gap-2 [&>svg]:size-[var(--control-icon-size-lg)] [&>svg]:shrink-0 [&>svg]:text-muted-foreground", footerAction !== undefined && "mt-auto justify-between")}>
                {footerIcon}
                {footerNote !== undefined && <span className={NOTE}>{footerNote}</span>}
                {footerAction}
            </CardFooter>
        )}
    </Card>
);
