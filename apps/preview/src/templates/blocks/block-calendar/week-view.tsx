import { Plus, Search, Settings } from "@tyohnn/icons";

import { CalendarToolbar } from "@tyohnn/blocks/calendar-toolbar";
import { Page } from "@tyohnn/blocks/page";
import { WeekView as WeekGrid } from "@tyohnn/blocks/week-view";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";

import { ALL_DAY, DAYS, EVENTS, formatTime, HOURS, NOW } from "./data";

/**
 * The body of the calendar: a week view. A toolbar (today, previous/next, the range, a Day/Week/Month toggle, new
 * event) over the week: day headings with today marked, an all-day row and an hour grid from 08:00 to 18:00 with
 * the week's events placed by time. Fixed data. The screen is composed from blocks (registry/blocks): the toolbar
 * and the week grid; which week, which events and the words are the calendar's own and stay here.
 */

const VIEWS = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
] as const;

// flex-[1_1_0px]: the view takes the inset's remaining height (upstream's header is sticky, the page does not scroll);
// the hour grid keeps a minimum height and scrolls inside when a system's controls are taller.
// [contain:inline-size]: the content never widens SidebarInset (upstream markup, no min-w-0).
export const WeekView = () => (
    <Page scroll="regions" gutter="none" gap="none">
        <CalendarToolbar
            previousLabel="Previous week"
            nextLabel="Next week"
            range="Jan 11 – 17, 2026"
            badge={<Badge variant="secondary">Week 3</Badge>}
            tools={(
                <>
                    <Button variant="ghost" size="icon-sm" aria-label="Search events"><Search /></Button>
                    <Button variant="ghost" size="icon-sm" aria-label="Calendar settings"><Settings /></Button>
                </>
            )}
            views={VIEWS}
            defaultView="week"
            action={(
                <Button size="sm">
                    <Plus data-icon="inline-start" />
                    New event
                </Button>
            )}
        />
        <WeekGrid
            days={DAYS}
            hours={HOURS}
            events={EVENTS}
            allDay={ALL_DAY}
            zoneLabel="GMT+1"
            now={{ at: NOW, label: "Now, 11:45" }}
            formatTime={formatTime}
        />
    </Page>
);
