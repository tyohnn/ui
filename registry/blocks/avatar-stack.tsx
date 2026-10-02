import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@tyohnn/components/avatar";
import { NOTE } from "@tyohnn/blocks/lib/prose";
import { cn } from "@tyohnn/lib/utils";

/**
 * Who is in something, as overlapping avatars: the first few people, a count for the rest ("+3") and a line
 * beside the stack ("5 attendees"). For one person with a name use Person.
 */
export const AvatarStack = ({
    people,
    more,
    label,
    className,
}: {
    /** The people who are drawn; each avatar is named after its person */
    people: readonly { name: string; initials: string }[];
    /** The count that closes the stack */
    more?: ReactNode;
    label?: ReactNode;
    className?: string;
}) => (
    <div className={cn("flex items-center gap-2", className)}>
        <AvatarGroup>
            {people.map((person) => (
                <Avatar key={person.name} aria-label={person.name}>
                    <AvatarFallback>{person.initials}</AvatarFallback>
                </Avatar>
            ))}
            {more !== undefined && <AvatarGroupCount>{more}</AvatarGroupCount>}
        </AvatarGroup>
        {label !== undefined && <span className={NOTE}>{label}</span>}
    </div>
);
