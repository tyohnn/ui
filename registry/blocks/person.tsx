import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@tyohnn/components/avatar";
import { META } from "@tyohnn/blocks/lib/text";
import { cn } from "@tyohnn/lib/utils";

/** A person in a row or a cell: a small avatar, the name and one line of detail (email, role) under it. */
export const Person = ({ name, detail, initials, image, className }: { name: ReactNode; detail?: ReactNode; initials: string; image?: string; className?: string }) => (
    <div className={cn("flex items-center gap-2", className)}>
        <Avatar size="sm">
            {image !== undefined && <AvatarImage src={image} alt="" />}
            <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
            <span>{name}</span>
            {detail !== undefined && <span className={META}>{detail}</span>}
        </div>
    </div>
);
