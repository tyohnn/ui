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
    Share,
    SquareCheck,
} from "@tyohnn/icons";

import { AvatarStack } from "@tyohnn/blocks/avatar-stack";
import { CompactSelect } from "@tyohnn/blocks/compact-select";
import { KanbanBoard } from "@tyohnn/blocks/kanban-board";
import { KanbanCard } from "@tyohnn/blocks/kanban-card";
import { PageHeading } from "@tyohnn/blocks/page-heading";
import { SegmentedControl } from "@tyohnn/blocks/segmented-control";
import { TableSearch } from "@tyohnn/blocks/table-search";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";

import { AREAS, COLUMNS, type Person, QUARTERS, type RoadmapCard, type RoadmapColumn, TEAM } from "./data";

/**
 * The body of the roadmap: a filter row above a four-column kanban board. Fixed data, no time and no randomness.
 * The screen is composed from blocks (registry/blocks): the page heading with the view switch and the filters, and
 * the board with its cards. Which columns there are, what a card's badges and facts say and the actions are the
 * roadmap's own and stay here. The board scrolls sideways inside its pane, so a system with wide cards never
 * widens the page.
 */

const COLUMN_ICON = {
    backlog: CircleDashed,
    planned: Circle,
    progress: Loader,
    shipped: CircleCheck,
} as const;

const VIEWS = [
    { value: "board", label: "Board", icon: <Kanban data-icon="inline-start" /> },
    { value: "list", label: "List", icon: <List data-icon="inline-start" /> },
    { value: "timeline", label: "Timeline", icon: <Calendar data-icon="inline-start" /> },
];

const Owners = ({ owners }: { owners: Person[] }) => <AvatarStack people={owners.map((owner) => ({ initials: owner.initials }))} className="-space-x-1" />;

const Toolbar = () => (
    <PageHeading
        className="items-center"
        title="Q1 2026 roadmap"
        meta="50 items · 4 areas behind schedule · updated Jan 14"
        actions={(
            <>
                <SegmentedControl label="View" options={VIEWS} />
                <CompactSelect label="Quarter" labelInList options={QUARTERS} defaultValue="q1-2026" className="min-w-28" />
                <CompactSelect label="Area" labelInList icon={<Filter />} options={AREAS} className="min-w-32" />
                <TableSearch label="Search the roadmap" placeholder="Search items" className="w-48" />
                <Owners owners={TEAM} />
                <Button variant="outline" size="sm"><Share data-icon="inline-start" />Share</Button>
                <Button size="sm"><Plus data-icon="inline-start" />New item</Button>
            </>
        )}
    />
);

const ItemCard = ({ card, column }: { card: RoadmapCard; column: RoadmapColumn["id"] }) => (
    <KanbanCard
        code={card.id}
        title={card.title}
        action={<Button variant="ghost" size="icon-xs" aria-label={`Actions for ${card.id}`}><MoreHorizontal /></Button>}
        badges={(
            <>
                {card.priority && (
                    <Badge variant={card.priority === "Urgent" ? "destructive" : "secondary"}>
                        <Flag data-icon="inline-start" />
                        {card.priority}
                    </Badge>
                )}
                {card.areas.map((area) => <Badge key={area} variant="outline">{area}</Badge>)}
            </>
        )}
        progress={card.progress === undefined ? undefined : { value: card.progress, label: column === "shipped" ? "Released" : "Progress", name: `${card.title} progress` }}
        people={<Owners owners={card.owners} />}
        facts={[
            ...(card.checklist ? [{ icon: <SquareCheck />, text: <>{card.checklist[0]}/{card.checklist[1]}</> }] : []),
            ...(card.comments === undefined ? [] : [{ icon: <MessageSquare />, text: card.comments }]),
            { icon: <Calendar />, text: card.due },
        ]}
    />
);

// [contain:inline-size]: the board's width never widens SidebarInset (upstream markup, no min-w-0); it scrolls in place.
export const Roadmap = () => (
    <div className="flex h-[calc(100svh-4rem)] min-h-0 flex-col gap-4 p-4 pt-0 [contain:inline-size]">
        <Toolbar />
        <KanbanBoard
            columns={COLUMNS.map((column) =>
            {
                const Icon = COLUMN_ICON[column.id];

                return {
                    id: column.id,
                    title: column.title,
                    icon: <Icon />,
                    count: column.count,
                    addLabel: `Add to ${column.title}`,
                    cards: (
                        <>
                            {column.cards.map((card) => <ItemCard key={card.id} card={card} column={column.id} />)}
                            <Button variant="ghost" size="sm" className="justify-start">
                                <ChevronDown data-icon="inline-start" />
                                Show {column.count - column.cards.length} more
                            </Button>
                        </>
                    ),
                };
            })}
        />
    </div>
);
