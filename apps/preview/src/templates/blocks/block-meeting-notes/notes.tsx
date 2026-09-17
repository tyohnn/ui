import { Calendar, CircleCheck, Clock, Link, MapPin, Plus, Share, Sparkles, Video } from "@tyohnn/icons";

import { Alert, AlertDescription, AlertTitle } from "@tyohnn/components/alert";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@tyohnn/components/avatar";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@tyohnn/components/card";
import { Checkbox } from "@tyohnn/components/checkbox";
import { Separator } from "@tyohnn/components/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tyohnn/components/table";

import { ACTION_ITEMS, AGENDA, ATTENDEES, DECISIONS } from "./data";

/**
 * The body of the meeting notes: one meeting's page. Title, the date / place / attendee line, the agenda with owners
 * and timeboxes, discussion notes on the system's typeset, decisions in a success callout, an action item table with
 * status badges and the next meeting as a card. Fixed data; layout utilities only, the meta band, agenda rows and
 * table frame read tokens in NOTES_STYLE.
 */

const STATUS_VARIANT = {
    Done: "secondary",
    "In progress": "default",
    "To do": "outline",
    Blocked: "destructive",
} as const;

const SectionTitle = ({ children, meta }: { children: React.ReactNode; meta?: string }) => (
    <div className="flex items-baseline justify-between gap-3">
        <h2 className="mn-section">{children}</h2>
        {meta && <span className="mn-meta">{meta}</span>}
    </div>
);

const MetaLine = () => (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="mn-meta flex items-center gap-1.5"><Calendar />Wed, Jan 14, 2026</span>
        <span className="mn-meta flex items-center gap-1.5"><Clock />10:00 – 10:45</span>
        <span className="mn-meta flex items-center gap-1.5"><MapPin />Room Cedar · video</span>
        <div className="flex items-center gap-2">
            <AvatarGroup>
                {ATTENDEES.slice(0, 4).map((person) => (
                    <Avatar key={person.initials} aria-label={person.name}>
                        <AvatarFallback>{person.initials.charAt(0)}</AvatarFallback>
                    </Avatar>
                ))}
                <AvatarGroupCount>+{ATTENDEES.length - 4}</AvatarGroupCount>
            </AvatarGroup>
            <span className="mn-meta">{ATTENDEES.length} attendees</span>
        </div>
    </div>
);

const Agenda = () => (
    <section className="flex flex-col gap-3">
        <SectionTitle meta="45 min">Agenda</SectionTitle>
        <ol className="mn-agenda flex flex-col">
            {AGENDA.map((item, index) => (
                <li key={item.title} className="mn-agenda-row flex items-center gap-3 px-3 py-2.5">
                    <Checkbox defaultChecked={item.done} aria-label={`Covered: ${item.title}`} />
                    <span className="mn-index">{index + 1}</span>
                    <span className="mn-agenda-title min-w-0 flex-1" data-done={item.done ? "" : undefined}>{item.title}</span>
                    <span className="mn-meta hidden shrink-0 sm:inline">{item.owner}</span>
                    <Badge variant="outline">{item.minutes} min</Badge>
                </li>
            ))}
        </ol>
    </section>
);

const Discussion = () => (
    <section className="flex flex-col gap-3">
        <SectionTitle>Notes</SectionTitle>
        <div className="typeset typeset-tool mn-prose">
            <p>
                <strong>Metrics.</strong> Activation held at 41% for the third week. Week-4 retention for the December cohort rose to
                33% (from 29%), mostly from teams that invited a second member in their first two days.
            </p>
            <p>
                <strong>Mobile 3.2.</strong> Beta crash-free sessions are at 99.3%, one crash in the photo picker on older Android
                devices still open. Offline drafts are stable; sync conflicts appear in 0.2% of edits.
            </p>
            <p>
                <strong>Pricing.</strong> The annual-plan default ran for 14 days on 38k visitors. Paid conversion went up 8.4% with
                no change in refund requests.
            </p>
        </div>
    </section>
);

const Decisions = () => (
    <Alert>
        <CircleCheck />
        <AlertTitle>Decisions</AlertTitle>
        <AlertDescription>
            <ul className="mn-decisions flex flex-col gap-1">
                {DECISIONS.map((decision) => <li key={decision}>{decision}</li>)}
            </ul>
        </AlertDescription>
    </Alert>
);

const ActionItems = () => (
    <section className="flex flex-col gap-3">
        <SectionTitle meta="1 of 5 done">Action items</SectionTitle>
        <div className="mn-table">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ACTION_ITEMS.map((item) => (
                        <TableRow key={item.task}>
                            <TableCell className="whitespace-normal">{item.task}</TableCell>
                            <TableCell>
                                <span className="flex items-center gap-2">
                                    <Avatar size="sm">
                                        <AvatarFallback>{item.initials}</AvatarFallback>
                                    </Avatar>
                                    {item.owner}
                                </span>
                            </TableCell>
                            <TableCell>{item.due}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant={STATUS_VARIANT[item.status]}>{item.status}</Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        <div>
            <Button variant="ghost" size="sm">
                <Plus data-icon="inline-start" />
                Add action item
            </Button>
        </div>
    </section>
);

const NextMeeting = () => (
    <Card>
        <CardHeader>
            <CardTitle>Next meeting</CardTitle>
            <CardDescription>Weekly product sync · Wed, Jan 21, 10:00 – 10:45</CardDescription>
            <CardAction>
                <Badge variant="secondary">Recurring</Badge>
            </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
            <span className="mn-meta">Carried over</span>
            <ul className="mn-carry flex flex-col gap-1.5">
                <li>Q1 hiring: design and support roles — Maya Brennan</li>
                <li>Photo picker crash on Android 11 — Sofia Lindgren</li>
            </ul>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
                <Plus data-icon="inline-start" />
                Add to agenda
            </Button>
            <Button variant="ghost" size="sm">
                <Video data-icon="inline-start" />
                Open invite
            </Button>
        </CardFooter>
    </Card>
);

// flex-[1_1_0px]: the notes take the inset's remaining height and scroll inside; [contain:inline-size] keeps them from
// widening SidebarInset (upstream markup, no min-w-0) between the two sidebars.
export const Notes = () => (
    <div className="min-h-0 flex-[1_1_0px] overflow-y-auto [contain:inline-size]">
        <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pt-6 pb-12">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Product</Badge>
                    <Badge variant="outline">
                        <Sparkles data-icon="inline-start" />
                        Summary ready
                    </Badge>
                    <div className="ml-auto flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" aria-label="Copy link"><Link /></Button>
                        <Button variant="outline" size="sm">
                            <Share data-icon="inline-start" />
                            Share
                        </Button>
                    </div>
                </div>
                <h1 className="mn-title">Weekly product sync</h1>
                <MetaLine />
            </div>
            <Separator />
            <Agenda />
            <Discussion />
            <Decisions />
            <ActionItems />
            <NextMeeting />
        </article>
    </div>
);

/** The notes' stylesheet: title, section headings, the meta band, agenda rows, decisions list and table frame. Tokens only. */
export const NOTES_STYLE = `
[data-template="block-meeting-notes"] .mn-title { font-family: var(--font-heading); font-size: calc(var(--ui-text-lg) * 2); line-height: 1.2; font-weight: 700; color: var(--foreground); }
[data-template="block-meeting-notes"] .mn-section { font-family: var(--font-heading); font-size: var(--ui-text-lg); line-height: var(--ui-line-height-lg); font-weight: 600; color: var(--foreground); }
[data-template="block-meeting-notes"] .mn-meta { font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); }
[data-template="block-meeting-notes"] .mn-meta svg { width: 14px; height: 14px; flex-shrink: 0; }
[data-template="block-meeting-notes"] .mn-agenda { border: 1px solid var(--border); border-radius: var(--radius-lg); }
[data-template="block-meeting-notes"] .mn-agenda-row + .mn-agenda-row { border-top: 1px solid var(--border); }
[data-template="block-meeting-notes"] .mn-index { min-width: 1.25rem; font-size: var(--ui-text-sm); color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
[data-template="block-meeting-notes"] .mn-agenda-title { font-size: var(--ui-text-md); line-height: var(--ui-line-height-md); color: var(--foreground); }
[data-template="block-meeting-notes"] .mn-agenda-title[data-done] { color: var(--muted-foreground); }
[data-template="block-meeting-notes"] .mn-prose { max-width: none; margin-inline: 0; }
[data-template="block-meeting-notes"] .mn-decisions { list-style: disc; padding-left: 1.1rem; }
[data-template="block-meeting-notes"] .mn-carry { list-style: disc; padding-left: 1.1rem; font-size: var(--ui-text-md); line-height: var(--ui-line-height-md); color: var(--foreground); }
[data-template="block-meeting-notes"] .mn-table { border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
`;
