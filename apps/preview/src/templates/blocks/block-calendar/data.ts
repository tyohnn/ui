/**
 * The calendar's fixed data: the week of 2026-01-14 (Sunday Jan 11 – Saturday Jan 17, the week the sidebar's date
 * picker starts on) for Iris Calloway at Brightline (fictional). Times are hours from midnight; the grid shows
 * 08:00–18:00. `tone` is the calendar's colour, drawn from status tokens in the template CSS.
 */

export type Tone = "primary" | "success" | "info" | "warning";

export const HOURS = { start: 8, end: 18 };

/** "Now" on the fixed day, drawn as a line in today's column */
export const NOW = 11.75;

export const DAYS = [
    { name: "Sun", date: 11 },
    { name: "Mon", date: 12 },
    { name: "Tue", date: 13 },
    { name: "Wed", date: 14, today: true },
    { name: "Thu", date: 15 },
    { name: "Fri", date: 16 },
    { name: "Sat", date: 17 },
] as const;

export interface CalendarEvent
{
    day: number;
    start: number;
    end: number;
    title: string;
    place?: string;
    tone: Tone;
}

export const ALL_DAY: { from: number; to: number; title: string; tone: Tone }[] = [
    { from: 1, to: 5, title: "Q1 planning week", tone: "info" },
    { from: 5, to: 6, title: "Lisbon trip", tone: "warning" },
];

export const EVENTS: CalendarEvent[] = [
    { day: 0, start: 9, end: 10.5, title: "Long run", place: "Riverside path", tone: "success" },
    { day: 1, start: 9, end: 10, title: "Weekly planning", place: "Room Atlas", tone: "primary" },
    { day: 1, start: 11, end: 12, title: "Design review: onboarding", place: "Video call", tone: "primary" },
    { day: 1, start: 12.5, end: 13.5, title: "Lunch with Sam", place: "Harbor Deli", tone: "success" },
    { day: 1, start: 14, end: 16, title: "Focus time", tone: "primary" },
    { day: 2, start: 9.5, end: 9.75, title: "Standup", tone: "primary" },
    { day: 2, start: 10, end: 10.5, title: "1:1 with Priya", tone: "primary" },
    { day: 2, start: 13, end: 14, title: "Customer call: Tidewell", place: "Video call", tone: "primary" },
    { day: 2, start: 15, end: 16, title: "Release 4.2 go/no-go", place: "War room", tone: "warning" },
    { day: 3, start: 9.5, end: 9.75, title: "Standup", tone: "primary" },
    { day: 3, start: 10, end: 11.5, title: "Roadmap review", place: "Room Atlas", tone: "primary" },
    { day: 3, start: 13, end: 14, title: "Offsite planning", place: "Studio 2", tone: "info" },
    { day: 3, start: 15, end: 16, title: "Interview: Senior designer", place: "Room Juniper", tone: "primary" },
    { day: 3, start: 17, end: 17.75, title: "Dentist", place: "Elm Street Clinic", tone: "success" },
    { day: 4, start: 9.5, end: 9.75, title: "Standup", tone: "primary" },
    { day: 4, start: 11, end: 13, title: "Release 4.2 rollout", place: "War room", tone: "warning" },
    { day: 4, start: 16, end: 17, title: "Sprint demo", place: "Main hall", tone: "primary" },
    { day: 5, start: 9.5, end: 9.75, title: "Standup", tone: "primary" },
    { day: 5, start: 14, end: 15, title: "Retro", place: "Room Atlas", tone: "primary" },
    { day: 5, start: 16.5, end: 18, title: "Flight to Lisbon", place: "Terminal 2", tone: "warning" },
    { day: 6, start: 10, end: 11, title: "Farmers market", tone: "success" },
];

const pad = (value: number) => String(value).padStart(2, "0");

export const formatTime = (hours: number) => `${pad(Math.floor(hours))}:${pad(Math.round((hours % 1) * 60))}`;
