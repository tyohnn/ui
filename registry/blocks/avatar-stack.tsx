import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@tyohnn/components/avatar";

export type StackPerson = {
    initials: string;
    /** Names the avatar for assistive technology */
    name?: string;
    image?: string;
};

/**
 * The people on something as overlapping avatars: a project's members, a card's owners. The first `max` are
 * drawn; the rest are counted in a bubble at the end ("+3"). `total` is how many there are in all when the list
 * given is only the head of it.
 */
export const AvatarStack = ({ people, max = 3, total, className }: { people: readonly StackPerson[]; max?: number; total?: number; className?: string }) =>
{
    const shown = people.slice(0, max);
    const more = (total ?? people.length) - shown.length;

    return (
        <AvatarGroup className={className}>
            {shown.map((person, index) => (
                <Avatar key={`${index}-${person.initials}`} aria-label={person.name}>
                    {person.image !== undefined && <AvatarImage src={person.image} alt="" />}
                    <AvatarFallback>{person.initials}</AvatarFallback>
                </Avatar>
            ))}
            {more > 0 && <AvatarGroupCount>+{more}</AvatarGroupCount>}
        </AvatarGroup>
    );
};
