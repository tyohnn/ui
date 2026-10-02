"use client";

import { type ReactNode, useState } from "react";

import { Checkbox } from "@tyohnn/components/checkbox";
import { Label } from "@tyohnn/components/label";
import { cn } from "@tyohnn/lib/utils";

export type ChecklistItem = {
    /** Also the checkbox's element id */
    id: string;
    label: ReactNode;
    /** Checked at first; the list keeps the state from then on */
    done?: boolean;
};

/** A list of things to tick off: a checkbox with its label, which is struck through and muted once it is done. */
export const Checklist = ({
    items,
    onChange,
    className,
}: {
    items: readonly ChecklistItem[];
    /** The ids that are done, after every change */
    onChange?: (done: string[]) => void;
    className?: string;
}) =>
{
    const [done, setDone] = useState<readonly string[]>(() => items.filter((item) => item.done).map((item) => item.id));
    const update = (next: string[]) =>
    {
        setDone(next);
        onChange?.(next);
    };

    return (
        <div className={cn("flex flex-col gap-2.5", className)}>
            {items.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                    <Checkbox
                        id={item.id}
                        checked={done.includes(item.id)}
                        onCheckedChange={(checked) => update(checked ? [...done, item.id] : done.filter((id) => id !== item.id))}
                        className="mt-0.5"
                    />
                    <Label htmlFor={item.id} className={done.includes(item.id) ? "text-muted-foreground line-through" : undefined}>{item.label}</Label>
                </div>
            ))}
        </div>
    );
};
