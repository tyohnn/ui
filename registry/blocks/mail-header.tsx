import type { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@tyohnn/components/avatar";
import { NOTE } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

/**
 * The head of an open message: the subject with its labels and an action (star, pin) on the other side, then the
 * sender's avatar, name and address, the recipient lines under them ("To: …", "Cc: …") and the date at the end.
 */
export const MailHeader = ({
    subject,
    aside,
    name,
    address,
    initials,
    lines,
    date,
    className,
}: {
    subject: ReactNode;
    /** Beside the subject: label badges, an icon button */
    aside?: ReactNode;
    name: ReactNode;
    /** After the name, in small text */
    address?: ReactNode;
    initials: string;
    /** Small lines under the name, one per entry */
    lines?: readonly ReactNode[];
    date?: ReactNode;
    className?: string;
}) => (
    <div className={cn("flex flex-col gap-4", className)}>
        <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="min-w-0 font-heading text-[length:calc(var(--ui-text-lg)*1.3)] leading-[1.3] font-semibold text-foreground">{subject}</h1>
            {aside !== undefined && <div className="flex items-center gap-1.5">{aside}</div>}
        </div>
        <div className="flex items-start gap-3">
            <Avatar size="lg">
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[length:var(--ui-text-md)] font-semibold text-foreground">{name}</span>
                    {address !== undefined && <span className={NOTE}>{address}</span>}
                </div>
                {lines?.map((line, index) => <span key={index} className={NOTE}>{line}</span>)}
            </div>
            {date !== undefined && <span className={cn(NOTE, "shrink-0")}>{date}</span>}
        </div>
    </div>
);
