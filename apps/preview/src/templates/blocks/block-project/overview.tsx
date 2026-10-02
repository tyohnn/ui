import { Archive, Calendar, Clock, Download, FileText, Filter, Flag, Image, MoreHorizontal, Plus, Share, SquareCheck } from "@tyohnn/icons";

import { ActivityFeed } from "@tyohnn/blocks/activity-feed";
import { AvatarStack } from "@tyohnn/blocks/avatar-stack";
import { DetailHeading } from "@tyohnn/blocks/detail-heading";
import { FileTiles } from "@tyohnn/blocks/file-tiles";
import { IconNote } from "@tyohnn/blocks/icon-note";
import { InfoCard } from "@tyohnn/blocks/info-card";
import { ListCard } from "@tyohnn/blocks/list-card";
import { SegmentedControl } from "@tyohnn/blocks/segmented-control";
import { StatCards } from "@tyohnn/blocks/stat-cards";
import { TaskList } from "@tyohnn/blocks/task-list";
import { Avatar, AvatarFallback } from "@tyohnn/components/avatar";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Separator } from "@tyohnn/components/separator";

import { ACTIVITY, FILES, MEMBER_COUNT, MEMBERS, type Priority, SCOPES, STATS, TASKS } from "./data";

/**
 * The body of the project tool: one project's overview — its head, progress cards, this week's tasks, the activity
 * timeline and recent files. Fixed data. The screen is composed from blocks (registry/blocks): the detail heading
 * with the member stack, the stat cards, the task list in its card, the activity feed and the file tiles in info
 * cards. What a task shows at the end of its row (priority, due date, assignee) is the product's own and stays here.
 */

const PRIORITY_VARIANT: Record<Priority, "destructive" | "default" | "secondary" | "outline"> = {
    Urgent: "destructive",
    High: "default",
    Medium: "secondary",
    Low: "outline",
};

const FILE_ICON = { doc: FileText, archive: Archive, image: Image } as const;

const ProjectHead = () => (
    <DetailHeading
        title="Atlas app relaunch"
        status={<Badge variant="secondary">On track</Badge>}
        description="Rebuild of the Atlas field app for iOS and Android · owned by Priya Raman · started Dec 2, 2025"
        actions={(
            <>
                <AvatarStack people={MEMBERS.map((member) => ({ initials: member.initials[0], name: member.name }))} max={MEMBERS.length} total={MEMBER_COUNT} />
                <Button variant="outline" size="sm">
                    <Share data-icon="inline-start" />
                    Share
                </Button>
                <Button size="sm">
                    <Plus data-icon="inline-start" />
                    New task
                </Button>
            </>
        )}
    />
);

const TaskCard = () => (
    <ListCard
        title="This week"
        description="Jan 12 – Jan 18 · 2 of 8 done"
        controls={(
            <>
                <SegmentedControl label="Scope" options={SCOPES} />
                <Button variant="ghost" size="icon-sm" aria-label="Filter"><Filter /></Button>
            </>
        )}
    >
        <TaskList
            tasks={TASKS.map((task) => ({
                id: task.id,
                title: task.title,
                meta: <>{task.id} · {task.area}</>,
                done: task.done,
                end: (
                    <>
                        <Badge variant={PRIORITY_VARIANT[task.priority]}>
                            {task.priority === "Urgent" ? <Flag data-icon="inline-start" /> : null}
                            {task.priority}
                        </Badge>
                        <IconNote icon={<Calendar />} className="min-w-[4.5rem] whitespace-nowrap">{task.due}</IconNote>
                        <Avatar size="sm">
                            <AvatarFallback>{task.assignee}</AvatarFallback>
                        </Avatar>
                    </>
                ),
            }))}
        />
    </ListCard>
);

const ActivityCard = () => (
    <InfoCard
        title="Activity"
        action={<Button variant="ghost" size="xs">View all</Button>}
        className="min-h-0 flex-1 gap-2"
        contentClassName="min-h-0 flex-1 overflow-y-auto"
    >
        <ActivityFeed
            entries={ACTIVITY.map((entry) => ({ id: `${entry.who}-${entry.when}`, name: entry.who, initials: entry.initials, action: entry.action, when: entry.when }))}
            whenIcon={<Clock />}
        />
    </InfoCard>
);

const FilesCard = () => (
    <InfoCard title="Recent files" action={<Button variant="ghost" size="icon-xs" aria-label="More"><MoreHorizontal /></Button>} className="gap-2">
        <FileTiles
            files={FILES.map((file) =>
            {
                const Icon = FILE_ICON[file.kind];

                return { id: file.name, icon: <Icon />, name: file.name, meta: file.meta };
            })}
        />
        <Separator className="my-2" />
        <Button variant="ghost" size="xs">
            <Download data-icon="inline-start" />
            Download all
        </Button>
    </InfoCard>
);

// [contain:inline-size]: the body never widens SidebarInset (upstream markup, no min-w-0) past the viewport.
export const Overview = () => (
    <div className="flex h-[calc(100svh-5rem)] min-h-0 flex-col gap-4 p-4 pt-0 [contain:inline-size]">
        <ProjectHead />
        <StatCards stats={STATS} />
        <div className="flex min-h-0 flex-1 gap-4">
            <TaskCard />
            <div className="flex min-h-0 w-[26rem] shrink-0 flex-col gap-4">
                <ActivityCard />
                <FilesCard />
            </div>
        </div>
        <IconNote icon={<SquareCheck />} className="gap-1.5">Synced with the Atlas board · 2 min ago</IconNote>
    </div>
);
