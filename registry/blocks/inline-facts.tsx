import { Fragment, type ReactNode } from "react";

import { cn } from "@tyohnn/lib/utils";

/** A few short facts on one line behind an icon, with a hairline between them: a date and what happened then. */
export const InlineFacts = ({ icon, facts, className }: { icon?: ReactNode; facts: readonly ReactNode[]; className?: string }) => (
    <span className={cn("flex items-center gap-1.5 [&_svg]:size-[var(--control-icon-size-sm)] [&_svg]:shrink-0", className)}>
        {icon}
        {facts.map((fact, index) => (
            <Fragment key={index}>
                {index > 0 && <span className="h-[12px] w-px shrink-0 bg-muted-foreground" aria-hidden="true" />}
                <span>{fact}</span>
            </Fragment>
        ))}
    </span>
);
