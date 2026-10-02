import type { ReactNode } from "react";

import { cn } from "@tyohnn/lib/utils";

/**
 * The head of one record's page — a pull request, an issue, a ticket: its title with the record's number after
 * it, a line of status under the title (a state badge, who and what, a reference), and the people and actions on
 * the other side. For a page that lists things use PageHeading.
 */
export const RecordHeading = ({
    title,
    number,
    status,
    actions,
    className,
}: {
    title: ReactNode;
    /** After the title, muted ("#482") */
    number?: ReactNode;
    /** The line under the title */
    status?: ReactNode;
    actions?: ReactNode;
    className?: string;
}) => (
    <div className={cn("flex flex-wrap items-start justify-between gap-x-6 gap-y-3", className)}>
        <div className="flex min-w-0 flex-col gap-2">
            <h1 className="m-0 text-[length:calc(var(--ui-text-lg)*1.25)] leading-[1.3] font-semibold">
                {title} {number !== undefined && <span className="font-normal text-muted-foreground">{number}</span>}
            </h1>
            {status !== undefined && <div className="flex flex-wrap items-center gap-2">{status}</div>}
        </div>
        {actions !== undefined && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
);
