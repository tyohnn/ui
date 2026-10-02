"use client";

import type { ReactNode } from "react";

import { ChevronLeft, ChevronRight } from "@tyohnn/icons";

import { Button } from "@tyohnn/components/button";
import { ButtonGroup } from "@tyohnn/components/button-group";
import { SegmentedControl } from "@tyohnn/blocks/segmented-control";
import { GUTTER_INLINE, type Gutter } from "@tyohnn/blocks/lib/frame";
import { TITLE } from "@tyohnn/blocks/lib/text";
import { cn } from "@tyohnn/lib/utils";
import { strings } from "@tyohnn/strings";

/**
 * The bar over a calendar view: a button back to today, previous and next, the range on show as the title with a
 * badge beside it, and at the other end the tools, the toggle between views (day, week, month) and the main
 * action. Every word is the caller's: the button labels, the range and the names of the views.
 */
export const CalendarToolbar = ({
    todayLabel = strings.blocks.calendar.today,
    previousLabel = strings.blocks.calendar.previous,
    nextLabel = strings.blocks.calendar.next,
    range,
    badge,
    tools,
    views,
    defaultView,
    viewsLabel = strings.blocks.calendar.views,
    action,
    onToday,
    onPrevious,
    onNext,
    onViewChange,
    gutter = "sm",
    className,
}: {
    /** The button back to today; the locale's own word when left out */
    todayLabel?: string;
    /** Names for the two arrow buttons ("Previous week", "Next week") */
    previousLabel?: string;
    nextLabel?: string;
    /** The dates on show, already formatted ("Jan 11 – 17, 2026") */
    range: ReactNode;
    /** A badge after the range: the week number */
    badge?: ReactNode;
    /** Icon buttons before the view toggle: search, settings */
    tools?: ReactNode;
    views?: readonly { value: string; label: string }[];
    defaultView?: string;
    /** Names the view toggle for assistive technology */
    viewsLabel?: string;
    /** The main action at the end: a new event */
    action?: ReactNode;
    onToday?: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    onViewChange?: (view: string) => void;
    /** How far its ends stand from the page's edge: the page's small gutter by default */
    gutter?: Gutter;
    className?: string;
}) => (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border py-3", GUTTER_INLINE[gutter], className)}>
        <Button variant="outline" size="sm" onClick={onToday}>{todayLabel}</Button>
        <ButtonGroup>
            <Button variant="outline" size="icon-sm" aria-label={previousLabel} onClick={onPrevious}><ChevronLeft /></Button>
            <Button variant="outline" size="icon-sm" aria-label={nextLabel} onClick={onNext}><ChevronRight /></Button>
        </ButtonGroup>
        <h1 className={cn(TITLE, "whitespace-nowrap")}>{range}</h1>
        {badge}
        <div className="ml-auto flex flex-wrap items-center gap-2">
            {tools}
            {views !== undefined && (
                <SegmentedControl label={viewsLabel} options={views} defaultValue={defaultView} onValueChange={onViewChange} />
            )}
            {action}
        </div>
    </div>
);
