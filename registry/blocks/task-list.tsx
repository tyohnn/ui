"use client";

import { type ReactNode, useId, useState } from "react";

import { Checkbox } from "@tyohnn/components/checkbox";
import { BODY, NOTE } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

export type Task = {
    id: string;
    /** One line; a long one is cut with an ellipsis. It also names the checkbox. */
    title: string;
    /** A line under the title: a key, an area */
    meta?: ReactNode;
    done?: boolean;
    /** What follows at the end of the row: a priority badge, a due date, the assignee */
    end?: ReactNode;
};

/**
 * A list of things to do, one per row with a hairline between: a checkbox, the title over a meta line, and
 * whatever the product shows at the end of the row. A done task's title is struck through. The list keeps which
 * tasks are ticked from `done` on and reports each change; put it in a ListCard or straight on the page.
 */
export const TaskList = ({ tasks, onDoneChange, className }: { tasks: readonly Task[]; onDoneChange?: (id: string, done: boolean) => void; className?: string }) =>
{
    const prefix = useId();
    const [done, setDone] = useState<readonly string[]>(() => tasks.filter((task) => task.done).map((task) => task.id));

    return (
        <ul className={cn("m-0 flex list-none flex-col p-0 [&>li+li]:border-t [&>li+li]:border-border", className)}>
            {tasks.map((task) =>
            {
                const isDone = done.includes(task.id);

                return (
                    <li key={task.id} className="flex items-center gap-3 px-4 py-2.5">
                        <Checkbox
                            id={`${prefix}-${task.id}`}
                            checked={isDone}
                            onCheckedChange={(checked) =>
                            {
                                setDone(checked ? [...done, task.id] : done.filter((id) => id !== task.id));
                                onDoneChange?.(task.id, checked);
                            }}
                            aria-label={task.title}
                        />
                        <label htmlFor={`${prefix}-${task.id}`} className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className={cn(BODY, "truncate", isDone && "text-muted-foreground line-through")}>{task.title}</span>
                            {task.meta !== undefined && <span className={NOTE}>{task.meta}</span>}
                        </label>
                        {task.end}
                    </li>
                );
            })}
        </ul>
    );
};
