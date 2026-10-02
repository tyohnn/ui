import type { ReactNode } from "react";

import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@tyohnn/components/item";
import { cn } from "@tyohnn/lib/utils";

export type ActionItem = {
    id: string;
    icon: ReactNode;
    /** One line; a long one is cut with an ellipsis */
    title: string;
    description?: ReactNode;
    /** A line under the description: a badge, a meta line */
    extra?: ReactNode;
    /** Icon buttons stacked at the end of the item */
    actions?: ReactNode;
};

/** A short list of outlined items, each with an icon, a title, a description and its own actions: pending invitations, connected devices, open requests. */
export const ActionItemList = ({ items, className }: { items: readonly ActionItem[]; className?: string }) => (
    <ItemGroup className={cn("gap-2", className)}>
        {items.map((item) => (
            <Item key={item.id} size="sm" variant="outline">
                <ItemMedia variant="icon">{item.icon}</ItemMedia>
                <ItemContent className="min-w-0">
                    <ItemTitle className="w-full min-w-0"><span className="block truncate">{item.title}</span></ItemTitle>
                    {item.description !== undefined && <ItemDescription>{item.description}</ItemDescription>}
                    {item.extra !== undefined && <div className="flex flex-wrap items-center gap-x-2 gap-y-1">{item.extra}</div>}
                </ItemContent>
                {item.actions !== undefined && <ItemActions className="flex-col">{item.actions}</ItemActions>}
            </Item>
        ))}
    </ItemGroup>
);
