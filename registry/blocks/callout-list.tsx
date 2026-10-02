import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@tyohnn/components/alert";
import { BULLETS } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

/** A callout that lists a few points under its title: the decisions of a meeting, what changes, what to check. */
export const CalloutList = ({ icon, title, items, className }: { icon?: ReactNode; title: ReactNode; items: readonly ReactNode[]; className?: string }) => (
    <Alert className={className}>
        {icon}
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
            <ul className={cn("flex flex-col gap-1", BULLETS)}>
                {items.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </AlertDescription>
    </Alert>
);
