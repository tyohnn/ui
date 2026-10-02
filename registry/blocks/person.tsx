import type { ReactNode } from "react";

import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@tyohnn/components/avatar";
import { META } from "@tyohnn/blocks/lib/text";
import { cn } from "@tyohnn/lib/utils";

/**
 * A person in a row or a cell: an avatar, the name and one line of detail (email, role) under it. `size="md"` is
 * the default avatar for a roster, `sm` the small one for a dense table. `online` puts the presence badge on the
 * avatar, `badges` follow the name ("You", "Suspended"), and `tone` picks the system's avatar tone for the initials.
 */
export const Person = ({
    name,
    detail,
    initials,
    image,
    size = "sm",
    online,
    badges,
    tone,
    className,
}: {
    name: ReactNode;
    detail?: ReactNode;
    initials: string;
    image?: string;
    size?: "sm" | "md";
    online?: boolean;
    badges?: ReactNode;
    tone?: string;
    className?: string;
}) => (
    <div className={cn("flex items-center", size === "sm" ? "gap-2" : "gap-3", className)}>
        <Avatar size={size === "sm" ? "sm" : undefined}>
            {image !== undefined && <AvatarImage src={image} alt="" />}
            <AvatarFallback data-tone={tone}>{initials}</AvatarFallback>
            {online && <AvatarBadge />}
        </Avatar>
        <div className="flex min-w-0 flex-col">
            {badges === undefined ? <span>{name}</span> : <span className="flex items-center gap-2">{name}{badges}</span>}
            {detail !== undefined && <span className={META}>{detail}</span>}
        </div>
    </div>
);
