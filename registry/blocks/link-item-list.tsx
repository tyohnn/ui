import type { ReactNode } from "react";

import { ArrowRight, ChevronRight } from "@tyohnn/icons";

import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@tyohnn/components/item";
import { cn } from "@tyohnn/lib/utils";

export type LinkItem = {
    id: string;
    href: string;
    icon?: ReactNode;
    title: ReactNode;
    /** A badge after the title ("New", "Updated") */
    badge?: ReactNode;
    /** One line under the title: where it belongs, how long it is, when it changed */
    description?: ReactNode;
};

/**
 * A list of outlined items that each open something: an optional icon, the title with a badge, one line of detail
 * and a chevron or an arrow at the end; the whole item is the link. Use it for articles, documents, earlier
 * releases or search results. For items that carry their own buttons use ActionItemList.
 */
export const LinkItemList = ({ items, trailing = "chevron", className }: { items: readonly LinkItem[]; trailing?: "chevron" | "arrow"; className?: string }) =>
{
    const Trailing = trailing === "arrow" ? ArrowRight : ChevronRight;

    return (
        <ItemGroup className={cn("gap-2", className)}>
            {items.map((item) => (
                <Item key={item.id} size="sm" variant="outline" render={<a href={item.href} />}>
                    {item.icon !== undefined && <ItemMedia variant="icon">{item.icon}</ItemMedia>}
                    <ItemContent>
                        <ItemTitle>
                            {item.title}
                            {item.badge}
                        </ItemTitle>
                        {item.description !== undefined && <ItemDescription>{item.description}</ItemDescription>}
                    </ItemContent>
                    <ItemActions><Trailing className="size-[16px] shrink-0 text-muted-foreground" /></ItemActions>
                </Item>
            ))}
        </ItemGroup>
    );
};
