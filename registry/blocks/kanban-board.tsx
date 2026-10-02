import type { ReactNode } from "react";

import { Plus } from "@tyohnn/icons";

import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { BODY } from "@tyohnn/blocks/lib/prose";
import { cn } from "@tyohnn/lib/utils";

export type KanbanColumn = {
    id: string;
    title: string;
    /** The icon of the column's state, before the title */
    icon?: ReactNode;
    /** How many items the column holds */
    count?: ReactNode;
    /** Names the column's add button ("Add to Backlog"); without it there is no button */
    addLabel?: string;
    onAdd?: () => void;
    /** The column's cards (KanbanCard), and whatever ends the list: a "show more" button */
    cards: ReactNode;
};

/**
 * A board of columns side by side, one per state, each a muted surface with its name and count on top and its
 * cards scrolling inside. The columns share the width equally and the board scrolls sideways when they run out
 * of it, so it never widens the page. Give it a height (it fills a flex column).
 */
export const KanbanBoard = ({ columns, className }: { columns: readonly KanbanColumn[]; className?: string }) => (
    <div className={cn("flex min-h-0 flex-1 gap-3 overflow-x-auto", className)}>
        {columns.map((column) => (
            <section key={column.id} className="flex min-h-0 min-w-64 flex-1 basis-0 flex-col gap-3 rounded-[var(--radius-xl)] bg-muted p-2" aria-label={column.title}>
                <div className="flex items-center gap-2 px-1 pt-1 [&>svg]:size-[16px] [&>svg]:text-muted-foreground">
                    {column.icon}
                    <span className={cn(BODY, "font-medium text-foreground")}>{column.title}</span>
                    {column.count !== undefined && <Badge variant="secondary">{column.count}</Badge>}
                    {column.addLabel !== undefined && <Button variant="ghost" size="icon-xs" className="ml-auto" aria-label={column.addLabel} onClick={column.onAdd}><Plus /></Button>}
                </div>
                <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">{column.cards}</div>
            </section>
        ))}
    </div>
);
