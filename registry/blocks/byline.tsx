import type { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@tyohnn/components/avatar";
import { BODY, NOTE } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

/**
 * Who wrote a post, as a band between two hairlines under its title: each author's avatar, name and role, and
 * the post's actions (copy link, subscribe) at the other end.
 */
export const Byline = ({
    authors,
    actions,
    className,
}: {
    authors: readonly { name: string; initials: string; role?: ReactNode }[];
    actions?: ReactNode;
    className?: string;
}) => (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 border-y border-border py-4", className)}>
        <div className="flex flex-wrap items-center gap-4">
            {authors.map((author) => (
                <span key={author.name} className="flex items-center gap-2">
                    <Avatar size="sm"><AvatarFallback>{author.initials}</AvatarFallback></Avatar>
                    <span className="flex flex-col">
                        <span className={cn(BODY, "font-medium")}>{author.name}</span>
                        {author.role !== undefined && <span className={NOTE}>{author.role}</span>}
                    </span>
                </span>
            ))}
        </div>
        {actions !== undefined && <div className="flex items-center gap-2">{actions}</div>}
    </div>
);
