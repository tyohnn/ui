import { Calendar, CircleCheck, Clock, Link, MapPin, Plus, Share, Sparkles, Video } from "@tyohnn/icons";

import { Agenda } from "@tyohnn/blocks/agenda";
import { AvatarStack } from "@tyohnn/blocks/avatar-stack";
import { CalloutList } from "@tyohnn/blocks/callout-list";
import { DataTable, type DataTableColumn } from "@tyohnn/blocks/data-table";
import { DocumentTitle } from "@tyohnn/blocks/document-title";
import { IconFact } from "@tyohnn/blocks/icon-fact";
import { BODY, BULLETS, NOTE } from "@tyohnn/blocks/lib/copy";
import { Person } from "@tyohnn/blocks/person";
import { Prose } from "@tyohnn/blocks/prose";
import { SectionTitle } from "@tyohnn/blocks/section-title";
import { TableFrame } from "@tyohnn/blocks/table-frame";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@tyohnn/components/card";
import { Separator } from "@tyohnn/components/separator";
import { cn } from "@tyohnn/lib/utils";

import { ACTION_ITEMS, AGENDA, ATTENDEES, DECISIONS } from "./data";

/**
 * The body of the meeting notes: one meeting's page. Title, the date / place / attendee line, the agenda with owners
 * and timeboxes, discussion notes on the system's typeset, decisions in a callout, an action item table with
 * status badges and the next meeting as a card. Fixed data. The page is composed from blocks (registry/blocks);
 * the columns of the action items, the statuses and the next-meeting card are this meeting's own and stay here.
 */

const STATUS_VARIANT = {
    Done: "secondary",
    "In progress": "default",
    "To do": "outline",
    Blocked: "destructive",
} as const;

type ActionItem = (typeof ACTION_ITEMS)[number];

const ACTION_COLUMNS: DataTableColumn<ActionItem>[] = [
    { id: "task", header: "Task", kind: "wrap", cell: (item) => item.task },
    { id: "owner", header: "Owner", cell: (item) => <Person name={item.owner} initials={item.initials} /> },
    { id: "due", header: "Due", cell: (item) => item.due },
    { id: "status", header: "Status", align: "end", cell: (item) => <Badge variant={STATUS_VARIANT[item.status]}>{item.status}</Badge> },
];

const MetaLine = () => (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <IconFact icon={<Calendar />}>Wed, Jan 14, 2026</IconFact>
        <IconFact icon={<Clock />}>10:00 – 10:45</IconFact>
        <IconFact icon={<MapPin />}>Room Cedar · video</IconFact>
        <AvatarStack
            max={4}
            people={ATTENDEES.slice(0, 4).map((person) => ({ name: person.name, initials: person.initials.charAt(0) }))}
            more={<>+{ATTENDEES.length - 4}</>}
            label={<>{ATTENDEES.length} attendees</>}
        />
    </div>
);

const AgendaSection = () => (
    <section className="flex flex-col gap-3">
        <SectionTitle title="Agenda" meta="45 min" />
        <Agenda
            items={AGENDA.map((item) => ({ title: item.title, owner: item.owner, duration: <>{item.minutes} min</>, done: item.done }))}
            checkboxLabel={(item) => `Covered: ${item.title}`}
        />
    </section>
);

const Discussion = () => (
    <section className="flex flex-col gap-3">
        <SectionTitle title="Notes" />
        <Prose>
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
        </Prose>
    </section>
);

const ActionItems = () => (
    <section className="flex flex-col gap-3">
        <SectionTitle title="Action items" meta="1 of 5 done" />
        <TableFrame>
            <DataTable columns={ACTION_COLUMNS} rows={ACTION_ITEMS} rowId={(item) => item.task} />
        </TableFrame>
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
            <span className={NOTE}>Carried over</span>
            <ul className={cn("flex flex-col gap-1.5", BULLETS, BODY, "text-foreground")}>
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
                <DocumentTitle title="Weekly product sync" />
                <MetaLine />
            </div>
            <Separator />
            <AgendaSection />
            <Discussion />
            <CalloutList icon={<CircleCheck />} title="Decisions" items={DECISIONS} />
            <ActionItems />
            <NextMeeting />
        </article>
    </div>
);
