import {
    ArrowRight,
    Check,
    CircleCheck,
    Copy,
    FileText,
    GitBranch,
    GitCommit,
    GitPullRequest,
    Link,
    Loader,
    MessageSquare,
    MoreHorizontal,
    OctagonX,
    Reply,
    Tag,
} from "@tyohnn/icons";

import { CommentThread } from "@tyohnn/blocks/comment-thread";
import { DetailSections } from "@tyohnn/blocks/detail-sections";
import { DiffFile } from "@tyohnn/blocks/diff-file";
import { DiffStat } from "@tyohnn/blocks/diff-stat";
import { DiffView } from "@tyohnn/blocks/diff-view";
import { PARAGRAPH, ICON_LINE, NOTE } from "@tyohnn/blocks/lib/copy";
import { ASIDE_WIDTH, GUTTER_INLINE } from "@tyohnn/blocks/lib/frame";
import { Page, PagePane } from "@tyohnn/blocks/page";
import { PageSplit } from "@tyohnn/blocks/page-split";
import { PageTabs } from "@tyohnn/blocks/page-tabs";
import { RecordHeading } from "@tyohnn/blocks/record-heading";
import { RefChip } from "@tyohnn/blocks/ref-chip";
import { StatusLine } from "@tyohnn/blocks/status-line";
import { SegmentedControl } from "@tyohnn/blocks/segmented-control";
import { Avatar, AvatarFallback, AvatarGroup } from "@tyohnn/components/avatar";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Tabs, TabsContent } from "@tyohnn/components/tabs";
import { cn } from "@tyohnn/lib/utils";

import { BACKOFF_DIFF, CHECKS, type DiffLine, HANDLER_DIFF, LABELS, PULL_REQUEST, REVIEWERS, THREAD } from "./data";

/**
 * The body of the code review: a pull request's head, its tabs, the changed files as unified diffs with an inline
 * comment thread, and a side column of reviewers, checks and labels. Fixed data. The screen is composed from blocks
 * (registry/blocks): the record heading, the page tabs, the files with their diffs, the comment thread and the
 * side sections. What a pull request is — its states, checks and actions, and every word — stays here.
 */

const PrHead = () => (
    <RecordHeading
        className={cn(GUTTER_INLINE.md, "pt-5")}
        title={PULL_REQUEST.title}
        number={<>#{PULL_REQUEST.number}</>}
        status={(
            <>
                <Badge>
                    <GitPullRequest data-icon="inline-start" />
                    Open
                </Badge>
                <span className={cn(NOTE, "whitespace-nowrap")}>
                    {PULL_REQUEST.author} wants to merge {PULL_REQUEST.commits} commits into
                </span>
                <RefChip>
                    <GitBranch />
                    {PULL_REQUEST.source}
                    <ArrowRight />
                    {PULL_REQUEST.target}
                </RefChip>
                <Button variant="ghost" size="icon-xs" aria-label="Copy branch name"><Copy /></Button>
            </>
        )}
        actions={(
            <>
                <AvatarGroup aria-label="Reviewers">
                    {REVIEWERS.map((reviewer) => (
                        <Avatar key={reviewer.initials} aria-label={reviewer.name}>
                            <AvatarFallback>{reviewer.initials[0]}</AvatarFallback>
                        </Avatar>
                    ))}
                </AvatarGroup>
                <Button variant="outline" size="sm">
                    <OctagonX data-icon="inline-start" />
                    Request changes
                </Button>
                <Button size="sm">
                    <Check data-icon="inline-start" />
                    Approve
                </Button>
            </>
        )}
    />
);

const Thread = () => (
    <CommentThread
        comments={THREAD.map((comment) => ({
            id: comment.when,
            name: comment.name,
            initials: comment.initials,
            when: comment.when,
            badge: comment.initials === "KW" ? <Badge variant="outline">Author</Badge> : undefined,
            body: comment.body,
        }))}
        replyLabel="Reply"
        replyPlaceholder="Reply to Rosa…"
        threadAction={(
            <Button variant="ghost" size="sm">
                <CircleCheck data-icon="inline-start" />
                Resolve conversation
            </Button>
        )}
        replyActions={(
            <>
                <Button variant="outline" size="sm">Cancel</Button>
                <Button size="sm">
                    <Reply data-icon="inline-start" />
                    Reply
                </Button>
            </>
        )}
    />
);

// The comment thread opens under the line the data marks.
const withThread = (lines: DiffLine[]) => lines.map((line) => (line.kind !== "hunk" && line.thread ? { ...line, below: <Thread /> } : line));

const ChangedFile = ({ id, path, added, removed, viewed, lines }: { id: string; path: string; added: number; removed: number; viewed?: boolean; lines?: DiffLine[] }) => (
    <DiffFile
        id={id}
        path={path}
        added={added}
        removed={removed}
        open={lines !== undefined}
        toggleLabel={lines !== undefined ? "Collapse file" : "Expand file"}
        viewed={viewed}
        viewedLabel="Viewed"
        menu={<Button variant="ghost" size="icon-xs" aria-label="File actions"><MoreHorizontal /></Button>}
    >
        {lines !== undefined && <DiffView lines={lines} label="Diff" />}
    </DiffFile>
);

const FilesChanged = () => (
    <PagePane gutter="md" gap="xs" flush>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className={cn(NOTE, ICON_LINE, "whitespace-nowrap")}>
                <GitCommit />
                3 files changed · <DiffStat kind="add">+62</DiffStat> <DiffStat kind="del">−11</DiffStat> · 1 of 3 viewed
            </span>
            <SegmentedControl label="Diff view" options={[{ value: "unified", label: "Unified" }, { value: "split", label: "Split" }]} defaultValue="unified" />
        </div>
        <ChangedFile id="cr-viewed-backoff" path="webhooks/retry/backoff.ts" added={17} removed={6} lines={withThread(BACKOFF_DIFF)} />
        <ChangedFile id="cr-viewed-policy" path="webhooks/retry/policy.ts" added={38} removed={0} viewed />
        <ChangedFile id="cr-viewed-handler" path="webhooks/handler.ts" added={7} removed={2} lines={HANDLER_DIFF} />
    </PagePane>
);

const CHECK_ICON = { pass: CircleCheck, fail: OctagonX, running: Loader } as const;
const CHECK_TONE = { pass: "success", fail: "destructive", running: "muted" } as const;

const SidePanel = () => (
    <DetailSections
        className={cn(ASIDE_WIDTH.sm, "px-5 pb-6")}
        sections={[
            {
                id: "reviewers",
                title: "Reviewers",
                content: REVIEWERS.map((reviewer) => (
                    <StatusLine
                        key={reviewer.initials}
                        leading={(
                            <Avatar size="sm">
                                <AvatarFallback>{reviewer.initials}</AvatarFallback>
                            </Avatar>
                        )}
                        label={reviewer.name}
                        trailing={(
                            <Badge variant={reviewer.state === "Approved" ? "secondary" : reviewer.state === "Pending" ? "outline" : "destructive"}>
                                {reviewer.state === "Changes requested" ? "Changes" : reviewer.state}
                            </Badge>
                        )}
                    />
                )),
            },
            {
                id: "checks",
                title: "Checks",
                note: "4 of 6 passed",
                content: CHECKS.map((check) =>
                {
                    const Icon = CHECK_ICON[check.state];

                    return <StatusLine key={check.name} leading={<Icon />} tone={CHECK_TONE[check.state]} label={check.name} note={check.time} />;
                }),
            },
            {
                id: "labels",
                title: "Labels",
                content: (
                    <div className="flex flex-wrap gap-1.5">
                        {LABELS.map((label) => <Badge key={label} variant="outline"><Tag data-icon="inline-start" />{label}</Badge>)}
                    </div>
                ),
            },
            {
                id: "linked",
                title: "Linked issue",
                content: (
                    <>
                        <span className={cn(PARAGRAPH, ICON_LINE)}>
                            <Link />
                            LED-1297 Invoices stuck after 503s
                        </span>
                        <span className={cn(NOTE, ICON_LINE, "whitespace-nowrap")}>
                            <FileText />
                            Runbook: webhook retries
                        </span>
                    </>
                ),
            },
        ]}
    />
);

export const Review = () => (
    <Page scroll="regions" gutter="none">
        <PrHead />
        <Tabs defaultValue="files" className="min-h-0 flex-1 gap-4">
            <PageTabs
                className={GUTTER_INLINE.md}
                tabs={[
                    { value: "conversation", label: "Conversation", icon: <MessageSquare data-icon="inline-start" />, count: "5" },
                    { value: "files", label: "Files changed", icon: <FileText data-icon="inline-start" />, count: "3" },
                    { value: "checks", label: "Checks", icon: <CircleCheck data-icon="inline-start" />, count: "4/6" },
                ]}
            />
            <TabsContent value="files" className="flex min-h-0 flex-1">
                <PageSplit gap="none">
                    <FilesChanged />
                    <SidePanel />
                </PageSplit>
            </TabsContent>
        </Tabs>
    </Page>
);
