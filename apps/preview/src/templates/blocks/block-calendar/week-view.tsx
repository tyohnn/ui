import { ChevronLeft, ChevronRight, MapPin, Plus, Search, Settings } from "@tyohnn/icons";

import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { ButtonGroup } from "@tyohnn/components/button-group";
import { ToggleGroup, ToggleGroupItem } from "@tyohnn/components/toggle-group";

import { ALL_DAY, DAYS, EVENTS, formatTime, HOURS, NOW, type CalendarEvent } from "./data";

/**
 * The body of the calendar: a week view. A toolbar (today, previous/next, the range, a Day/Week/Month toggle, new
 * event), day headings with today marked, an all-day row and an hour grid from 08:00 to 18:00 with the week's events
 * placed by time. Fixed data; layout utilities only — the grid lines, event tones (status tokens, soft fills) and the
 * now line are in WEEK_STYLE. Event positions are percentages of the grid, set inline.
 */

const SPAN = HOURS.end - HOURS.start;
const HOUR_LABELS = Array.from({ length: SPAN }, (_, index) => HOURS.start + index);

const percent = (hours: number) => `${((hours - HOURS.start) / SPAN) * 100}%`;

const Toolbar = () => (
    <div className="cal-toolbar flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
        <Button variant="outline" size="sm">Today</Button>
        <ButtonGroup>
            <Button variant="outline" size="icon-sm" aria-label="Previous week"><ChevronLeft /></Button>
            <Button variant="outline" size="icon-sm" aria-label="Next week"><ChevronRight /></Button>
        </ButtonGroup>
        <h1 className="cal-range">Jan 11 – 17, 2026</h1>
        <Badge variant="secondary">Week 3</Badge>
        <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="icon-sm" aria-label="Search events"><Search /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Calendar settings"><Settings /></Button>
            <ToggleGroup variant="outline" size="sm" spacing={0} defaultValue={["week"]} aria-label="View">
                <ToggleGroupItem value="day">Day</ToggleGroupItem>
                <ToggleGroupItem value="week">Week</ToggleGroupItem>
                <ToggleGroupItem value="month">Month</ToggleGroupItem>
            </ToggleGroup>
            <Button size="sm">
                <Plus data-icon="inline-start" />
                New event
            </Button>
        </div>
    </div>
);

const DayHeadings = () => (
    <div className="cal-row cal-head">
        <span className="cal-zone">GMT+1</span>
        {DAYS.map((day) => (
            <div key={day.date} className="cal-day-head flex items-center justify-center gap-2 py-2" data-today={"today" in day ? "" : undefined}>
                <span className="cal-day-name">{day.name}</span>
                <span className="cal-day-date flex items-center justify-center">{day.date}</span>
            </div>
        ))}
    </div>
);

const AllDayRow = () => (
    <div className="cal-row cal-allday">
        <span className="cal-gutter-label">All day</span>
        <div className="cal-allday-track grid gap-1 px-1 py-1.5">
            {ALL_DAY.map((event) => (
                <div
                    key={event.title}
                    className="cal-event cal-event-inline truncate px-2 py-0.5"
                    data-tone={event.tone}
                    style={{ gridColumn: `${event.from + 1} / ${event.to + 2}` }}
                >
                    {event.title}
                </div>
            ))}
        </div>
    </div>
);

const EventBlock = ({ event }: { event: CalendarEvent }) =>
{
    const duration = event.end - event.start;
    const short = duration < 0.75;

    return (
        <div
            className="cal-event cal-event-block absolute flex flex-col overflow-hidden"
            data-tone={event.tone}
            data-short={short ? "" : undefined}
            style={{ top: percent(event.start), height: `calc(${percent(event.end + HOURS.start - event.start)} - 2px)` }}
        >
            <span className="cal-event-title truncate">{event.title}</span>
            {!short && <span className="cal-event-meta truncate">{formatTime(event.start)} – {formatTime(event.end)}</span>}
            {duration >= 1 && event.place && (
                <span className="cal-event-meta flex min-w-0 items-center gap-1">
                    <MapPin />
                    <span className="truncate">{event.place}</span>
                </span>
            )}
        </div>
    );
};

const HourGrid = () => (
    <div className="cal-row cal-grid min-h-0 flex-1">
        <div className="relative">
            {HOUR_LABELS.map((hour) => (
                <span key={hour} className="cal-hour absolute" style={{ top: percent(hour) }}>{formatTime(hour)}</span>
            ))}
        </div>
        {DAYS.map((day, index) => (
            <div key={day.date} className="cal-column relative" data-today={"today" in day ? "" : undefined}>
                {EVENTS.filter((event) => event.day === index).map((event) => (
                    <EventBlock key={`${event.title}-${event.start}`} event={event} />
                ))}
                {"today" in day && <div className="cal-now absolute" style={{ top: percent(NOW) }} aria-label="Now, 11:45" />}
            </div>
        ))}
    </div>
);

// flex-[1_1_0px]: the view takes the inset's remaining height (upstream's header is sticky, the page does not scroll);
// the hour grid keeps a minimum height and scrolls inside when a system's controls are taller.
// [contain:inline-size]: the content never widens SidebarInset (upstream markup, no min-w-0).
export const WeekView = () => (
    <div className="flex min-h-0 flex-[1_1_0px] flex-col [contain:inline-size]">
        <Toolbar />
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <DayHeadings />
            <AllDayRow />
            <HourGrid />
        </div>
    </div>
);

/** The week view's stylesheet: grid lines, day headings, the today mark, event tones and the now line. Tokens only. */
export const WEEK_STYLE = `
[data-template="block-calendar"] .cal-toolbar { border-bottom: 1px solid var(--border); }
[data-template="block-calendar"] .cal-range { font-family: var(--font-heading); font-size: var(--ui-text-lg); line-height: var(--ui-line-height-lg); font-weight: 600; color: var(--foreground); white-space: nowrap; }
[data-template="block-calendar"] .cal-row { display: grid; grid-template-columns: 4rem repeat(7, minmax(0, 1fr)); }
[data-template="block-calendar"] .cal-head, [data-template="block-calendar"] .cal-allday { border-bottom: 1px solid var(--border); }
[data-template="block-calendar"] .cal-zone, [data-template="block-calendar"] .cal-gutter-label, [data-template="block-calendar"] .cal-hour {
    font-size: var(--ui-text-xs); line-height: var(--ui-line-height-xs); color: var(--muted-foreground); font-variant-numeric: tabular-nums;
}
[data-template="block-calendar"] .cal-zone, [data-template="block-calendar"] .cal-gutter-label { align-self: center; padding-inline: 0.25rem 0.5rem; text-align: right; white-space: nowrap; }
[data-template="block-calendar"] .cal-day-head { border-left: 1px solid var(--border); }
[data-template="block-calendar"] .cal-day-name { font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); }
[data-template="block-calendar"] .cal-day-date { min-width: 1.75rem; height: 1.75rem; border-radius: 999px; font-size: var(--ui-text-md); font-weight: 600; color: var(--foreground); }
[data-template="block-calendar"] .cal-day-head[data-today] .cal-day-name { color: var(--primary); }
[data-template="block-calendar"] .cal-day-head[data-today] .cal-day-date { background-color: var(--primary); color: var(--primary-foreground); }
[data-template="block-calendar"] .cal-allday-track { grid-column: 2 / -1; grid-template-columns: repeat(7, minmax(0, 1fr)); }
[data-template="block-calendar"] .cal-grid { min-height: 34rem; }
[data-template="block-calendar"] .cal-grid > * { margin-block: 0.75rem; }
[data-template="block-calendar"] .cal-hour { right: 0.5rem; transform: translateY(-50%); }
[data-template="block-calendar"] .cal-column {
    border-left: 1px solid var(--border);
    background-image: linear-gradient(to bottom, var(--border) 1px, transparent 1px);
    background-size: 100% calc(100% / ${SPAN});
    box-shadow: 0 1px 0 var(--border);
}
[data-template="block-calendar"] .cal-column[data-today] { background-color: color-mix(in oklab, var(--primary) 4%, transparent); }
[data-template="block-calendar"] .cal-event {
    --tone: var(--primary); --tone-soft: color-mix(in oklab, var(--primary) 12%, var(--background));
    border-left: 3px solid var(--tone); border-radius: var(--radius-md); background-color: var(--tone-soft); color: var(--foreground);
    font-size: var(--ui-text-xs); line-height: var(--ui-line-height-xs);
}
[data-template="block-calendar"] .cal-event[data-tone="success"] { --tone: var(--success); --tone-soft: var(--success-soft); }
[data-template="block-calendar"] .cal-event[data-tone="info"] { --tone: var(--info); --tone-soft: var(--info-soft); }
[data-template="block-calendar"] .cal-event[data-tone="warning"] { --tone: var(--warning); --tone-soft: var(--warning-soft); }
[data-template="block-calendar"] .cal-event-inline { font-weight: 500; }
[data-template="block-calendar"] .cal-event-block { left: 3px; right: 4px; gap: 1px; padding: 3px 6px; }
[data-template="block-calendar"] .cal-event-block[data-short] { justify-content: center; padding-block: 0; }
[data-template="block-calendar"] .cal-event-title { font-weight: 600; }
[data-template="block-calendar"] .cal-event-meta { color: var(--muted-foreground); }
[data-template="block-calendar"] .cal-event-meta svg { width: 11px; height: 11px; flex-shrink: 0; }
[data-template="block-calendar"] .cal-now { left: 0; right: 0; height: 2px; background-color: var(--destructive); z-index: 1; }
[data-template="block-calendar"] .cal-now::before { content: ""; position: absolute; left: -4px; top: -3px; width: 8px; height: 8px; border-radius: 999px; background-color: var(--destructive); }
`;
