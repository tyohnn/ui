import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@tyohnn/components/avatar";
import { NOTE } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

export type StackPerson = {
    initials: string;
    /** Names the avatar for assistive technology */
    name?: string;
    image?: string;
};

/**
 * The people on something as overlapping avatars: a project's members, a card's owners, a meeting's attendees.
 * The first `max` are drawn and the rest are counted in a bubble at the end ("+3"); `total` is how many there are
 * in all when the list given is only the head of it, and `more` writes the bubble yourself. `label` puts a line
 * beside the stack ("5 attendees"). For one person with a name use Person.
 */
export const AvatarStack = ({
    people,
    max = 3,
    total,
    more,
    label,
    className,
}: {
    people: readonly StackPerson[];
    max?: number;
    total?: number;
    more?: ReactNode;
    label?: ReactNode;
    className?: string;
}) =>
{
    const shown = people.slice(0, max);
    const rest = (total ?? people.length) - shown.length;
    const group = (
        <AvatarGroup className={label === undefined ? className : undefined}>
            {shown.map((person, index) => (
                <Avatar key={`${index}-${person.initials}`} aria-label={person.name}>
                    {person.image !== undefined && <AvatarImage src={person.image} alt="" />}
                    <AvatarFallback>{person.initials}</AvatarFallback>
                </Avatar>
            ))}
            {more !== undefined ? <AvatarGroupCount>{more}</AvatarGroupCount> : rest > 0 && <AvatarGroupCount>+{rest}</AvatarGroupCount>}
        </AvatarGroup>
    );

    return label === undefined ? group : (
        <div className={cn("flex items-center gap-2", className)}>
            {group}
            <span className={NOTE}>{label}</span>
        </div>
    );
};
