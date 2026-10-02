import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@tyohnn/components/avatar";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@tyohnn/components/item";
import { IconNote } from "@tyohnn/blocks/icon-note";
import { cn } from "@tyohnn/lib/utils";

export type ActivityEntry = {
    id: string;
    /** Who did it */
    name: ReactNode;
    initials: string;
    image?: string;
    /** What they did, as the rest of the sentence ("moved ATL-151 to In review") */
    action: ReactNode;
    /** When, already formatted ("12 min ago") */
    when: ReactNode;
};

/**
 * What happened lately, newest first: who, what they did and when, one entry per row. `whenIcon` is the small
 * icon before each time. It is the bare list — put it in a card (InfoCard) that scrolls.
 */
export const ActivityFeed = ({ entries, whenIcon, className }: { entries: readonly ActivityEntry[]; whenIcon: ReactNode; className?: string }) => (
    <ItemGroup className={cn("gap-0", className)}>
        {entries.map((entry) => (
            <Item key={entry.id} size="xs" className="px-0">
                <ItemMedia>
                    <Avatar size="sm">
                        {entry.image !== undefined && <AvatarImage src={entry.image} alt="" />}
                        <AvatarFallback>{entry.initials}</AvatarFallback>
                    </Avatar>
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>{entry.name}</ItemTitle>
                    <ItemDescription>{entry.action}</ItemDescription>
                </ItemContent>
                <ItemActions>
                    <IconNote icon={whenIcon}>{entry.when}</IconNote>
                </ItemActions>
            </Item>
        ))}
    </ItemGroup>
);
