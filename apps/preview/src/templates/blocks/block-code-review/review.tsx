import {
    ArrowRight,
    Check,
    ChevronDown,
    ChevronRight,
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

import { Avatar, AvatarFallback, AvatarGroup } from "@tyohnn/components/avatar";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Checkbox } from "@tyohnn/components/checkbox";
import { Label } from "@tyohnn/components/label";
import { Separator } from "@tyohnn/components/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tyohnn/components/tabs";
import { Textarea } from "@tyohnn/components/textarea";
import { ToggleGroup, ToggleGroupItem } from "@tyohnn/components/toggle-group";

import { BACKOFF_DIFF, CHECKS, type DiffLine, HANDLER_DIFF, LABELS, PULL_REQUEST, REVIEWERS, THREAD } from "./data";

/**
 * The body of the code review: a pull request's head, its tabs, the changed files as unified diffs with an inline
 * comment thread, and a side column of reviewers, checks and labels. Fixed data, layout utilities only; the diff's
 * line colours (success / destructive soft tokens), mono type and dividers are in REVIEW_STYLE.
 */

const PrHead = () => (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-6 pt-5">
        <div className="flex min-w-0 flex-col gap-2">
            <h1 className="cr-title">
                {PULL_REQUEST.title} <span className="cr-number">#{PULL_REQUEST.number}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2">
                <Badge>
                    <GitPullRequest data-icon="inline-start" />
                    Open
                </Badge>
                <span className="cr-meta">
                    {PULL_REQUEST.author} wants to merge {PULL_REQUEST.commits} commits into
                </span>
                <span className="cr-branch flex items-center gap-1.5 px-1.5">
                    <GitBranch />
                    {PULL_REQUEST.source}
                    <ArrowRight />
                    {PULL_REQUEST.target}
                </span>
                <Button variant="ghost" size="icon-xs" aria-label="Copy branch name"><Copy /></Button>
            </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
        </div>
    </div>
);

const Diff = ({ lines, thread }: { lines: DiffLine[]; thread?: boolean }) => (
    <div className="cr-diff" role="table" aria-label="Diff">
        {lines.map((line, index) =>
        {
            if (line.kind === "hunk")
            {
                return <div key={index} className="cr-line cr-hunk" role="row"><span className="cr-gutter" /><span className="cr-gutter" /><span className="cr-code">{line.text}</span></div>;
            }

            const sign = line.kind === "add" ? "+" : line.kind === "del" ? "−" : " ";

            return (
                <div key={index}>
                    <div className="cr-line" data-kind={line.kind} role="row">
                        <span className="cr-gutter">{line.old ?? ""}</span>
                        <span className="cr-gutter">{line.new ?? ""}</span>
                        <span className="cr-code"><span className="cr-sign">{sign}</span>{line.text}</span>
                    </div>
                    {thread && line.thread ? <Thread /> : null}
                </div>
            );
        })}
    </div>
);

const Thread = () => (
    <div className="cr-thread flex flex-col gap-3 p-4">
        {THREAD.map((comment) => (
            <div key={comment.when} className="flex gap-3">
                <Avatar size="sm">
                    <AvatarFallback>{comment.initials}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="cr-author">{comment.name}</span>
                        <span className="cr-meta">{comment.when}</span>
                        {comment.initials === "KW" ? <Badge variant="outline">Author</Badge> : null}
                    </div>
                    <p className="cr-body">{comment.body}</p>
                </div>
            </div>
        ))}
        <div className="flex flex-col gap-2 pl-10">
            <Textarea aria-label="Reply" className="min-h-16" placeholder="Reply to Rosa…" />
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Button variant="ghost" size="sm">
                    <CircleCheck data-icon="inline-start" />
                    Resolve conversation
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Cancel</Button>
                    <Button size="sm">
                        <Reply data-icon="inline-start" />
                        Reply
                    </Button>
                </div>
            </div>
        </div>
    </div>
);

const FileHeader = ({ path, added, removed, open, viewed, id }: { path: string; added: number; removed: number; open: boolean; viewed?: boolean; id: string }) => (
    <div className="cr-file-head flex flex-wrap items-center gap-2 px-3 py-2">
        <Button variant="ghost" size="icon-xs" aria-label={open ? "Collapse file" : "Expand file"}>
            {open ? <ChevronDown /> : <ChevronRight />}
        </Button>
        <span className="cr-path min-w-0 truncate">{path}</span>
        <span className="cr-stat" data-kind="add">+{added}</span>
        <span className="cr-stat" data-kind="del">−{removed}</span>
        <span className="ml-auto flex items-center gap-2">
            <Checkbox id={id} defaultChecked={viewed} />
            <Label htmlFor={id}>Viewed</Label>
            <Button variant="ghost" size="icon-xs" aria-label="File actions"><MoreHorizontal /></Button>
        </span>
    </div>
);

const FilesChanged = () => (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-y-auto px-6 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="cr-meta flex items-center gap-1.5">
                <GitCommit />
                3 files changed · <span className="cr-stat" data-kind="add">+62</span> <span className="cr-stat" data-kind="del">−11</span> · 1 of 3 viewed
            </span>
            <ToggleGroup variant="outline" size="sm" spacing={0} defaultValue={["unified"]} aria-label="Diff view">
                <ToggleGroupItem value="unified">Unified</ToggleGroupItem>
                <ToggleGroupItem value="split">Split</ToggleGroupItem>
            </ToggleGroup>
        </div>
        <section className="cr-file">
            <FileHeader id="cr-viewed-backoff" path="webhooks/retry/backoff.ts" added={17} removed={6} open />
            <Diff lines={BACKOFF_DIFF} thread />
        </section>
        <section className="cr-file">
            <FileHeader id="cr-viewed-policy" path="webhooks/retry/policy.ts" added={38} removed={0} open={false} viewed />
        </section>
        <section className="cr-file">
            <FileHeader id="cr-viewed-handler" path="webhooks/handler.ts" added={7} removed={2} open />
            <Diff lines={HANDLER_DIFF} />
        </section>
    </div>
);

const CHECK_ICON = { pass: CircleCheck, fail: OctagonX, running: Loader } as const;

const SidePanel = () => (
    <aside className="cr-side flex w-72 shrink-0 flex-col gap-5 overflow-y-auto px-5 pb-6">
        <div className="flex flex-col gap-2">
            <span className="cr-heading">Reviewers</span>
            {REVIEWERS.map((reviewer) => (
                <div key={reviewer.initials} className="flex items-center gap-2">
                    <Avatar size="sm">
                        <AvatarFallback>{reviewer.initials}</AvatarFallback>
                    </Avatar>
                    <span className="cr-body min-w-0 flex-1 truncate">{reviewer.name}</span>
                    <Badge variant={reviewer.state === "Approved" ? "secondary" : reviewer.state === "Pending" ? "outline" : "destructive"}>
                        {reviewer.state === "Changes requested" ? "Changes" : reviewer.state}
                    </Badge>
                </div>
            ))}
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
                <span className="cr-heading">Checks</span>
                <span className="cr-meta">4 of 6 passed</span>
            </div>
            {CHECKS.map((check) =>
            {
                const Icon = CHECK_ICON[check.state];

                return (
                    <div key={check.name} className="cr-check flex items-center gap-2" data-state={check.state}>
                        <Icon />
                        <span className="cr-body min-w-0 flex-1 truncate">{check.name}</span>
                        <span className="cr-meta">{check.time}</span>
                    </div>
                );
            })}
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
            <span className="cr-heading">Labels</span>
            <div className="flex flex-wrap gap-1.5">
                {LABELS.map((label) => <Badge key={label} variant="outline"><Tag data-icon="inline-start" />{label}</Badge>)}
            </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
            <span className="cr-heading">Linked issue</span>
            <span className="cr-body flex items-center gap-1.5">
                <Link />
                LED-1297 Invoices stuck after 503s
            </span>
            <span className="cr-meta flex items-center gap-1.5">
                <FileText />
                Runbook: webhook retries
            </span>
        </div>
    </aside>
);

export const Review = () => (
    <div className="flex h-[calc(100svh-4rem)] min-h-0 flex-col gap-4 [contain:inline-size]">
        <PrHead />
        <Tabs defaultValue="files" className="min-h-0 flex-1 gap-4">
            <div className="cr-tabs px-6">
                <TabsList variant="line" className="gap-4">
                    <TabsTrigger value="conversation" className="flex-none">
                        <MessageSquare data-icon="inline-start" />
                        Conversation
                        <Badge variant="secondary">5</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="files" className="flex-none">
                        <FileText data-icon="inline-start" />
                        Files changed
                        <Badge variant="secondary">3</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="checks" className="flex-none">
                        <CircleCheck data-icon="inline-start" />
                        Checks
                        <Badge variant="secondary">4/6</Badge>
                    </TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="files" className="flex min-h-0 flex-1">
                <FilesChanged />
                <SidePanel />
            </TabsContent>
        </Tabs>
    </div>
);

/** The template's stylesheet: the diff (mono, gutters, soft success / destructive line colours), files, thread and side column. Tokens only. */
export const REVIEW_STYLE = `
[data-template="block-code-review"] .cr-title { margin: 0; font-size: calc(var(--ui-text-lg) * 1.25); line-height: 1.3; font-weight: 600; }
[data-template="block-code-review"] .cr-number { color: var(--muted-foreground); font-weight: 400; }
[data-template="block-code-review"] .cr-meta { font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); white-space: nowrap; }
[data-template="block-code-review"] :is(.cr-meta, .cr-body, .cr-branch, .cr-check) svg { width: 14px; height: 14px; flex-shrink: 0; }
[data-template="block-code-review"] .cr-body { margin: 0; font-size: var(--ui-text-md); line-height: var(--ui-line-height-md); }
[data-template="block-code-review"] .cr-author { font-size: var(--ui-text-md); line-height: var(--ui-line-height-md); font-weight: 600; }
[data-template="block-code-review"] .cr-heading { font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); font-weight: 600; color: var(--muted-foreground); }
[data-template="block-code-review"] .cr-branch {
    border-radius: var(--radius-sm); background-color: var(--muted);
    font-family: var(--font-mono); font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm);
}
[data-template="block-code-review"] .cr-tabs { border-bottom: 1px solid var(--border); }
[data-template="block-code-review"] .cr-side { border-left: 1px solid var(--border); }
[data-template="block-code-review"] .cr-check[data-state="pass"] svg { color: var(--success); }
[data-template="block-code-review"] .cr-check[data-state="fail"] svg { color: var(--destructive); }
[data-template="block-code-review"] .cr-check[data-state="running"] svg { color: var(--muted-foreground); }
[data-template="block-code-review"] .cr-file { flex-shrink: 0; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-lg); }
[data-template="block-code-review"] .cr-file-head { background-color: var(--muted); }
[data-template="block-code-review"] .cr-file-head + * { border-top: 1px solid var(--border); }
[data-template="block-code-review"] .cr-path { font-family: var(--font-mono); font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); font-weight: 600; }
[data-template="block-code-review"] .cr-stat { font-family: var(--font-mono); font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); }
[data-template="block-code-review"] .cr-stat[data-kind="add"] { color: var(--success); }
[data-template="block-code-review"] .cr-stat[data-kind="del"] { color: var(--destructive); }
[data-template="block-code-review"] .cr-diff { font-family: var(--font-mono); font-size: var(--ui-text-sm); line-height: 1.7; background-color: var(--background); }
[data-template="block-code-review"] .cr-line { display: grid; grid-template-columns: 3rem 3rem minmax(0, 1fr); }
[data-template="block-code-review"] .cr-gutter { padding-inline: 0.5rem; text-align: right; color: var(--muted-foreground); user-select: none; }
[data-template="block-code-review"] .cr-code { padding-inline: 0.75rem; white-space: pre; overflow: hidden; text-overflow: ellipsis; }
[data-template="block-code-review"] .cr-sign { display: inline-block; width: 1.25ch; color: var(--muted-foreground); user-select: none; }
[data-template="block-code-review"] .cr-hunk { background-color: var(--muted); color: var(--muted-foreground); }
[data-template="block-code-review"] .cr-line[data-kind="add"] { background-color: var(--success-soft); }
[data-template="block-code-review"] .cr-line[data-kind="add"] :is(.cr-gutter, .cr-sign) { color: var(--success); }
[data-template="block-code-review"] .cr-line[data-kind="del"] { background-color: var(--destructive-soft); }
[data-template="block-code-review"] .cr-line[data-kind="del"] :is(.cr-gutter, .cr-sign) { color: var(--destructive); }
[data-template="block-code-review"] .cr-thread { border-block: 1px solid var(--border); background-color: var(--card); font-family: var(--font-sans); }
`;
