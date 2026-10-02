import type { ReactNode } from "react";

import { DISPLAY_SIZE, NOTE } from "@tyohnn/blocks/lib/prose";
import { cn } from "@tyohnn/lib/utils";

/**
 * The head of a page about one thing — a project, an account, a release: its name in the large size with its
 * status beside it, a description that may run over lines, and the people and actions on the other side. For the
 * head of a list page (a title and one meta line) use PageHeading.
 */
export const DetailHeading = ({
    title,
    status,
    description,
    actions,
    className,
}: {
    title: ReactNode;
    /** A badge next to the title */
    status?: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    className?: string;
}) => (
    <div className={cn("flex flex-wrap items-start justify-between gap-x-6 gap-y-3", className)}>
        <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
                <h1 className={cn("m-0", DISPLAY_SIZE, "leading-[1.3] font-semibold")}>{title}</h1>
                {status}
            </div>
            {description !== undefined && <p className={NOTE}>{description}</p>}
        </div>
        {actions !== undefined && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
);
