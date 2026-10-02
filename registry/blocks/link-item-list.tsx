import type { ReactNode } from "react";

import { ArrowRight } from "@tyohnn/icons";

import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@tyohnn/components/item";
import { cn } from "@tyohnn/lib/utils";

export type LinkItem = {
    id: string;
    href: string;
    title: ReactNode;
    description?: ReactNode;
};

/**
 * A short list of outlined items that each lead somewhere: a title, one line of detail and an arrow at the end.
 * Earlier releases, related pages. For items with their own buttons use ActionItemList.
 */
export const LinkItemList = ({ items, className }: { items: readonly LinkItem[]; className?: string }) => (
    <ItemGroup className={cn("gap-2", className)}>
        {items.map((item) => (
            <Item key={item.id} variant="outline" size="sm" render={<a href={item.href} />}>
                <ItemContent>
                    <ItemTitle>{item.title}</ItemTitle>
                    {item.description !== undefined && <ItemDescription>{item.description}</ItemDescription>}
                </ItemContent>
                <ItemActions><ArrowRight className="size-[16px] shrink-0 text-muted-foreground" /></ItemActions>
            </Item>
        ))}
    </ItemGroup>
);
