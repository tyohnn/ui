import type { ReactNode } from "react";

import { Badge } from "@tyohnn/components/badge";
import { cn } from "@tyohnn/lib/utils";

/**
 * The head of one endpoint in an API reference: the method as a badge with the path in the mono stack and an
 * action beside it (copy), the endpoint's name as the page title, then what it does and what can be done with
 * it (prose, buttons) as children.
 */
export const EndpointHeader = ({
    method,
    path,
    pathAction,
    title,
    children,
    className,
}: {
    method: ReactNode;
    path: ReactNode;
    /** After the path: a copy button */
    pathAction?: ReactNode;
    title: ReactNode;
    children?: ReactNode;
    className?: string;
}) => (
    <div className={cn("flex flex-col gap-4", className)}>
        <div className="flex flex-wrap items-center gap-2">
            <Badge>{method}</Badge>
            <code className="min-w-0 font-mono text-[length:var(--ui-text-md)] [overflow-wrap:anywhere]">{path}</code>
            {pathAction}
        </div>
        <h1 className="m-0 font-heading text-[length:calc(var(--ui-text-lg)*1.75)] leading-[1.2] font-semibold">{title}</h1>
        {children}
    </div>
);
