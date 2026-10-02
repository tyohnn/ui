"use client";

import { Fragment } from "react";

import { MoreHorizontal } from "@tyohnn/icons";

import { Button } from "@tyohnn/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@tyohnn/components/dropdown-menu";

export type RowMenuItem = { label: string; variant?: "default" | "destructive"; onSelect?: () => void };

/**
 * The actions of one row behind a "more" button. `groups` are separated by a divider; put what cannot be undone
 * in the last group as `destructive`. `label` names the button for the row it belongs to ("Actions for #1042").
 */
export const RowMenu = ({ label, groups }: { label: string; groups: readonly (readonly RowMenuItem[])[] }) => (
    <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" aria-label={label} />}>
            <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            {groups.map((items, index) => (
                <Fragment key={items.map((item) => item.label).join("|")}>
                    {index > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuGroup>
                        {items.map((item) => (
                            <DropdownMenuItem key={item.label} variant={item.variant} onClick={item.onSelect}>{item.label}</DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                </Fragment>
            ))}
        </DropdownMenuContent>
    </DropdownMenu>
);
