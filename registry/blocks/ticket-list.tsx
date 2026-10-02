import type { ReactNode } from "react";

import { Separator } from "@tyohnn/components/separator";
import { NOTE, ROW_LABEL } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

export type Ticket = {
    id: string;
    title: ReactNode;
    /** The number it goes by ("#48213") */
    reference?: ReactNode;
    /** A badge with its state */
    status?: ReactNode;
    /** The last fact on the line, behind `detailIcon`: when it last changed */
    detail?: ReactNode;
    detailIcon?: ReactNode;
};

/**
 * A short list of open things with a hairline between them: each a title over one line with its number, a status
 * badge and when it last changed. Use it for support requests, orders or incidents in a side card.
 */
export const TicketList = ({ tickets, className }: { tickets: readonly Ticket[]; className?: string }) => (
    <div className={cn("flex flex-col gap-3", className)}>
        {tickets.map((ticket, index) => (
            <div key={ticket.id} className="flex flex-col gap-3">
                {index > 0 ? <Separator /> : null}
                <div className="flex flex-col gap-1">
                    <span className={ROW_LABEL}>{ticket.title}</span>
                    <span className={cn(NOTE, "flex flex-wrap items-center gap-x-2 gap-y-1 [&_svg]:size-[14px] [&_svg]:shrink-0")}>
                        {ticket.reference}
                        {ticket.status}
                        {ticket.detail !== undefined && <span className="flex items-center gap-1">{ticket.detailIcon}{ticket.detail}</span>}
                    </span>
                </div>
            </div>
        ))}
    </div>
);
