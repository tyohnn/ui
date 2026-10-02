"use client";

import type { ReactNode } from "react";

import { ChevronDown, ChevronRight } from "@tyohnn/icons";

import { Button } from "@tyohnn/components/button";
import { Checkbox } from "@tyohnn/components/checkbox";
import { Label } from "@tyohnn/components/label";
import { DiffStat } from "@tyohnn/blocks/diff-stat";
import { cn } from "@tyohnn/lib/utils";
import { strings } from "@tyohnn/strings";

/**
 * One changed file of a review: a header with the button that folds it, the path, the lines added and removed,
 * a "viewed" checkbox and a menu, over the file's diff (a DiffView as the child; none while it is folded).
 * `toggleLabel` names the fold button for its current state, `viewedLabel` is the checkbox's visible label.
 */
export const DiffFile = ({
    id,
    path,
    added,
    removed,
    open,
    onToggle,
    toggleLabel,
    viewed,
    onViewedChange,
    viewedLabel = strings.blocks.diff.viewed,
    menu,
    children,
    className,
}: {
    /** The id of the "viewed" checkbox */
    id: string;
    path: ReactNode;
    added: number;
    removed: number;
    open: boolean;
    onToggle?: () => void;
    /** Names the fold button; "Collapse file" or "Expand file" in the locale's words when left out */
    toggleLabel?: string;
    viewed?: boolean;
    onViewedChange?: (viewed: boolean) => void;
    viewedLabel?: ReactNode;
    /** The end of the header: a "more" button or a RowMenu */
    menu?: ReactNode;
    children?: ReactNode;
    className?: string;
}) => (
    <section className={cn("shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-border [&>*+*]:border-t [&>*+*]:border-border", className)}>
        <div className="flex flex-wrap items-center gap-2 bg-muted px-3 py-2">
            <Button variant="ghost" size="icon-xs" aria-label={toggleLabel ?? (open ? strings.blocks.diff.collapse : strings.blocks.diff.expand)} onClick={onToggle}>
                {open ? <ChevronDown /> : <ChevronRight />}
            </Button>
            <span className="min-w-0 truncate font-mono text-[length:var(--ui-text-sm)] leading-[var(--ui-line-height-sm)] font-semibold">{path}</span>
            <DiffStat kind="add">+{added}</DiffStat>
            <DiffStat kind="del">−{removed}</DiffStat>
            <span className="ml-auto flex items-center gap-2">
                <Checkbox id={id} defaultChecked={viewed} onCheckedChange={onViewedChange && ((checked) => onViewedChange(checked === true))} />
                <Label htmlFor={id}>{viewedLabel}</Label>
                {menu}
            </span>
        </div>
        {children}
    </section>
);
