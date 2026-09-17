import { Archive, Calendar, Clock, Download, FileText, Filter, Flag, Image, MoreHorizontal, Plus, Share, SquareCheck } from "@tyohnn/icons";

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@tyohnn/components/avatar";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@tyohnn/components/card";
import { Checkbox } from "@tyohnn/components/checkbox";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@tyohnn/components/item";
import { Progress } from "@tyohnn/components/progress";
import { Separator } from "@tyohnn/components/separator";
import { ToggleGroup, ToggleGroupItem } from "@tyohnn/components/toggle-group";

import { ACTIVITY, FILES, MEMBERS, type Priority, STATS, TASKS } from "./data";

/**
 * The body of the project tool: one project's overview — its head, progress cards, this week's tasks, the activity
 * timeline and recent files. Fixed data, layout utilities only; the small meta text and the task list's dividers read
 * tokens in OVERVIEW_STYLE.
 */

const PRIORITY_VARIANT: Record<Priority, "destructive" | "default" | "secondary" | "outline"> = {
    Urgent: "destructive",
    High: "default",
    Medium: "secondary",
    Low: "outline",
};

const ProjectHead = () => (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
                <h1 className="prj-title">Atlas app relaunch</h1>
                <Badge variant="secondary">On track</Badge>
            </div>
            <p className="prj-meta">Rebuild of the Atlas field app for iOS and Android · owned by Priya Raman · started Dec 2, 2025</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <AvatarGroup>
                {MEMBERS.map((member) => (
                    <Avatar key={member.initials} aria-label={member.name}>
                        <AvatarFallback>{member.initials[0]}</AvatarFallback>
                    </Avatar>
                ))}
                <AvatarGroupCount>+3</AvatarGroupCount>
            </AvatarGroup>
            <Button variant="outline" size="sm">
                <Share data-icon="inline-start" />
                Share
            </Button>
            <Button size="sm">
                <Plus data-icon="inline-start" />
                New task
            </Button>
        </div>
    </div>
);

const StatCards = () => (
    <div className="grid grid-cols-4 gap-4">
        {STATS.map((stat) => (
            <Card key={stat.id} size="sm">
                <CardHeader>
                    <CardDescription>{stat.label}</CardDescription>
                    <CardTitle className="prj-stat">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    {"progress" in stat ? <Progress value={stat.progress} aria-label={stat.label} /> : null}
                    <span className="prj-meta">{stat.detail}</span>
                </CardContent>
            </Card>
        ))}
    </div>
);

const TaskList = () => (
    <Card className="min-h-0 min-w-0 flex-1 gap-0">
        <CardHeader className="prj-card-head">
            <CardTitle>This week</CardTitle>
            <CardDescription>Jan 12 – Jan 18 · 2 of 8 done</CardDescription>
            <CardAction className="flex items-center gap-1.5">
                <ToggleGroup variant="outline" size="sm" spacing={0} defaultValue={["mine"]} aria-label="Scope">
                    <ToggleGroupItem value="mine">All</ToggleGroupItem>
                    <ToggleGroupItem value="team">Mine</ToggleGroupItem>
                </ToggleGroup>
                <Button variant="ghost" size="icon-sm" aria-label="Filter"><Filter /></Button>
            </CardAction>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto px-0">
            <ul className="prj-tasks flex flex-col">
                {TASKS.map((task) => (
                    <li key={task.id} className="flex items-center gap-3 px-4 py-2.5" data-done={task.done ? "" : undefined}>
                        <Checkbox id={`prj-${task.id}`} defaultChecked={task.done} aria-label={task.title} />
                        <label htmlFor={`prj-${task.id}`} className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="prj-task-title truncate">{task.title}</span>
                            <span className="prj-meta">{task.id} · {task.area}</span>
                        </label>
                        <Badge variant={PRIORITY_VARIANT[task.priority]}>
                            {task.priority === "Urgent" ? <Flag data-icon="inline-start" /> : null}
                            {task.priority}
                        </Badge>
                        <span className="prj-meta prj-due flex items-center gap-1">
                            <Calendar />
                            {task.due}
                        </span>
                        <Avatar size="sm">
                            <AvatarFallback>{task.assignee}</AvatarFallback>
                        </Avatar>
                    </li>
                ))}
            </ul>
        </CardContent>
    </Card>
);

const ActivityCard = () => (
    <Card size="sm" className="min-h-0 flex-1 gap-2">
        <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardAction>
                <Button variant="ghost" size="xs">View all</Button>
            </CardAction>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto">
            <ItemGroup className="gap-0">
                {ACTIVITY.map((entry) => (
                    <Item key={`${entry.who}-${entry.when}`} size="xs" className="px-0">
                        <ItemMedia>
                            <Avatar size="sm">
                                <AvatarFallback>{entry.initials}</AvatarFallback>
                            </Avatar>
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>{entry.who}</ItemTitle>
                            <ItemDescription>{entry.action}</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <span className="prj-meta flex items-center gap-1">
                                <Clock />
                                {entry.when}
                            </span>
                        </ItemActions>
                    </Item>
                ))}
            </ItemGroup>
        </CardContent>
    </Card>
);

const FILE_ICON = { doc: FileText, archive: Archive, image: Image } as const;

const FilesCard = () => (
    <Card size="sm" className="shrink-0 gap-2">
        <CardHeader>
            <CardTitle>Recent files</CardTitle>
            <CardAction>
                <Button variant="ghost" size="icon-xs" aria-label="More"><MoreHorizontal /></Button>
            </CardAction>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 gap-2">
                {FILES.map((file) =>
                {
                    const Icon = FILE_ICON[file.kind];

                    return (
                        <Item key={file.name} variant="outline" size="xs" className="min-w-0">
                            <ItemMedia variant="icon"><Icon /></ItemMedia>
                            <ItemContent className="min-w-0">
                                <ItemTitle className="w-full truncate">{file.name}</ItemTitle>
                                <ItemDescription className="truncate">{file.meta}</ItemDescription>
                            </ItemContent>
                        </Item>
                    );
                })}
            </div>
            <Separator className="my-2" />
            <Button variant="ghost" size="xs">
                <Download data-icon="inline-start" />
                Download all
            </Button>
        </CardContent>
    </Card>
);

// [contain:inline-size]: the body never widens SidebarInset (upstream markup, no min-w-0) past the viewport.
export const Overview = () => (
    <div className="flex h-[calc(100svh-5rem)] min-h-0 flex-col gap-4 p-4 pt-0 [contain:inline-size]">
        <ProjectHead />
        <StatCards />
        <div className="flex min-h-0 flex-1 gap-4">
            <TaskList />
            <div className="flex min-h-0 w-[26rem] shrink-0 flex-col gap-4">
                <ActivityCard />
                <FilesCard />
            </div>
        </div>
        <span className="prj-meta flex items-center gap-1.5">
            <SquareCheck />
            Synced with the Atlas board · 2 min ago
        </span>
    </div>
);

/** The template's own stylesheet: title and stat type, meta text band, task dividers. Tokens only. */
export const OVERVIEW_STYLE = `
[data-template="block-project"] .prj-title { margin: 0; font-size: calc(var(--ui-text-lg) * 1.25); line-height: 1.3; font-weight: 600; }
[data-template="block-project"] .prj-stat { font-size: calc(var(--ui-text-lg) * 1.25); font-variant-numeric: tabular-nums; }
[data-template="block-project"] .prj-meta { font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); }
[data-template="block-project"] .prj-meta svg { width: 14px; height: 14px; flex-shrink: 0; }
[data-template="block-project"] .prj-due { min-width: 4.5rem; white-space: nowrap; }
[data-template="block-project"] .prj-card-head { border-bottom: 1px solid var(--border); padding-bottom: 12px; }
[data-template="block-project"] .prj-tasks { margin: 0; padding: 0; list-style: none; }
[data-template="block-project"] .prj-tasks > li + li { border-top: 1px solid var(--border); }
[data-template="block-project"] .prj-task-title { font-size: var(--ui-text-md); line-height: var(--ui-line-height-md); }
[data-template="block-project"] .prj-tasks > li[data-done] .prj-task-title { color: var(--muted-foreground); text-decoration: line-through; }
`;
