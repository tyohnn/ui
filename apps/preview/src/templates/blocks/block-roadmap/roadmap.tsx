import {
    Calendar,
    ChevronDown,
    Circle,
    CircleCheck,
    CircleDashed,
    Filter,
    Flag,
    Kanban,
    List,
    Loader,
    MessageSquare,
    MoreHorizontal,
    Plus,
    Search,
    Share,
    SquareCheck,
} from "@tyohnn/icons";

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@tyohnn/components/avatar";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@tyohnn/components/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@tyohnn/components/input-group";
import { Progress, ProgressValue } from "@tyohnn/components/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@tyohnn/components/select";
import { ToggleGroup, ToggleGroupItem } from "@tyohnn/components/toggle-group";

import { AREAS, COLUMNS, type Person, QUARTERS, type RoadmapCard, type RoadmapColumn, TEAM } from "./data";

/**
 * The body of the roadmap: a filter row above a four-column kanban board. Fixed data, no time and no randomness.
 * Layout utilities only; the column surfaces, the small meta text and the title band read tokens in ROADMAP_STYLE.
 * The board scrolls sideways inside its pane, so a system with wide cards never widens the page.
 */

const COLUMN_ICON = {
    backlog: CircleDashed,
    planned: Circle,
    progress: Loader,
    shipped: CircleCheck,
} as const;

const AREA_ITEMS = AREAS.map((area) => ({ value: area, label: area }));

const Owners = ({ owners }: { owners: Person[] }) => (
    <AvatarGroup className="-space-x-1">
        {owners.slice(0, 3).map((person) => (
            <Avatar key={person.initials}>
                <AvatarFallback>{person.initials}</AvatarFallback>
            </Avatar>
        ))}
        {owners.length > 3 && <AvatarGroupCount>+{owners.length - 3}</AvatarGroupCount>}
    </AvatarGroup>
);

const Toolbar = () => (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="rm-title">Q1 2026 roadmap</h1>
            <span className="rm-meta">50 items · 4 areas behind schedule · updated Jan 14</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup variant="outline" size="sm" spacing={0} defaultValue={["board"]} aria-label="View">
                <ToggleGroupItem value="board"><Kanban data-icon="inline-start" />Board</ToggleGroupItem>
                <ToggleGroupItem value="list"><List data-icon="inline-start" />List</ToggleGroupItem>
                <ToggleGroupItem value="timeline"><Calendar data-icon="inline-start" />Timeline</ToggleGroupItem>
            </ToggleGroup>
            <Select items={QUARTERS} defaultValue="q1-2026">
                <SelectTrigger size="sm" aria-label="Quarter" className="min-w-28">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Quarter</SelectLabel>
                        {QUARTERS.map((quarter) => <SelectItem key={quarter.value} value={quarter.value}>{quarter.label}</SelectItem>)}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Select items={AREA_ITEMS} defaultValue="All areas">
                <SelectTrigger size="sm" aria-label="Area" className="min-w-32">
                    <Filter />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Area</SelectLabel>
                        {AREAS.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <InputGroup className="w-48">
                <InputGroupAddon><Search /></InputGroupAddon>
                <InputGroupInput aria-label="Search the roadmap" placeholder="Search items" />
            </InputGroup>
            <Owners owners={TEAM} />
            <Button variant="outline" size="sm"><Share data-icon="inline-start" />Share</Button>
            <Button size="sm"><Plus data-icon="inline-start" />New item</Button>
        </div>
    </div>
);

const ItemCard = ({ card, column }: { card: RoadmapCard; column: RoadmapColumn["id"] }) => (
    <Card size="sm" className="shrink-0">
        <CardHeader>
            <CardDescription className="rm-id">{card.id}</CardDescription>
            <CardTitle>{card.title}</CardTitle>
            <CardAction>
                <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${card.id}`}><MoreHorizontal /></Button>
            </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
                {card.priority && (
                    <Badge variant={card.priority === "Urgent" ? "destructive" : "secondary"}>
                        <Flag data-icon="inline-start" />
                        {card.priority}
                    </Badge>
                )}
                {card.areas.map((area) => <Badge key={area} variant="outline">{area}</Badge>)}
            </div>
            {card.progress !== undefined && (
                <Progress value={card.progress} aria-label={`${card.title} progress`}>
                    <span className="rm-meta">{column === "shipped" ? "Released" : "Progress"}</span>
                    <ProgressValue className="rm-meta ml-auto" />
                </Progress>
            )}
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-2">
            <Owners owners={card.owners} />
            <div className="rm-meta flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                {card.checklist && (
                    <span className="flex items-center gap-1"><SquareCheck />{card.checklist[0]}/{card.checklist[1]}</span>
                )}
                {card.comments !== undefined && (
                    <span className="flex items-center gap-1"><MessageSquare />{card.comments}</span>
                )}
                <span className="flex items-center gap-1"><Calendar />{card.due}</span>
            </div>
        </CardFooter>
    </Card>
);

const Column = ({ column }: { column: RoadmapColumn }) =>
{
    const Icon = COLUMN_ICON[column.id];

    return (
        <section className="rm-column flex min-h-0 min-w-64 flex-1 basis-0 flex-col gap-3 p-2" aria-label={column.title}>
            <div className="flex items-center gap-2 px-1 pt-1">
                <Icon className="rm-column-icon" />
                <span className="rm-column-title">{column.title}</span>
                <Badge variant="secondary">{column.count}</Badge>
                <Button variant="ghost" size="icon-xs" className="ml-auto" aria-label={`Add to ${column.title}`}><Plus /></Button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                {column.cards.map((card) => <ItemCard key={card.id} card={card} column={column.id} />)}
                <Button variant="ghost" size="sm" className="justify-start">
                    <ChevronDown data-icon="inline-start" />
                    Show {column.count - column.cards.length} more
                </Button>
            </div>
        </section>
    );
};

// [contain:inline-size]: the board's width never widens SidebarInset (upstream markup, no min-w-0); it scrolls in place.
export const Roadmap = () => (
    <div className="flex h-[calc(100svh-4rem)] min-h-0 flex-col gap-4 p-4 pt-0 [contain:inline-size]">
        <Toolbar />
        <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto">
            {COLUMNS.map((column) => <Column key={column.id} column={column} />)}
        </div>
    </div>
);

/** The template's own stylesheet: system tokens only (column surface, title and meta text bands). */
export const ROADMAP_STYLE = `
[data-template="block-roadmap"] .rm-title { margin: 0; font-family: var(--font-heading); font-size: var(--ui-text-lg); line-height: var(--ui-line-height-lg); font-weight: 600; color: var(--foreground); }
[data-template="block-roadmap"] .rm-meta { font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); font-variant-numeric: tabular-nums; white-space: nowrap; }
[data-template="block-roadmap"] .rm-meta svg { width: 14px; height: 14px; flex-shrink: 0; }
[data-template="block-roadmap"] .rm-id { font-family: var(--font-mono); font-size: var(--ui-text-sm); }
[data-template="block-roadmap"] .rm-column { border-radius: var(--radius-xl); background-color: var(--muted); }
[data-template="block-roadmap"] .rm-column-title { font-size: var(--ui-text-md); line-height: var(--ui-line-height-md); font-weight: 500; color: var(--foreground); }
[data-template="block-roadmap"] .rm-column-icon { width: 16px; height: 16px; color: var(--muted-foreground); }
`;
