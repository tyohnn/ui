import { Check, Clock, Copy, Info, Pencil, Terminal, ThumbsDown, ThumbsUp, TriangleAlert } from "@tyohnn/icons";

import { ArticleHeading } from "@tyohnn/blocks/article-heading";
import { CodeBlock } from "@tyohnn/blocks/code-block";
import { CodeTabs } from "@tyohnn/blocks/code-tabs";
import { DataTable, type DataTableColumn } from "@tyohnn/blocks/data-table";
import { IconNote } from "@tyohnn/blocks/icon-note";
import { IN_PROSE, INLINE_CODE, MUTED_BODY } from "@tyohnn/blocks/lib/copy";
import { ASIDE_NARROW_HIDDEN, ASIDE_WIDTH, MEASURE } from "@tyohnn/blocks/lib/frame";
import { OnThisPage } from "@tyohnn/blocks/on-this-page";
import { Page, PageContent } from "@tyohnn/blocks/page";
import { PageSplit } from "@tyohnn/blocks/page-split";
import { PagerCards } from "@tyohnn/blocks/pager-cards";
import { Prose } from "@tyohnn/blocks/prose";
import { StepList } from "@tyohnn/blocks/step-list";
import { TableFrame } from "@tyohnn/blocks/table-frame";
import { Alert, AlertDescription, AlertTitle } from "@tyohnn/components/alert";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Separator } from "@tyohnn/components/separator";
import { cn } from "@tyohnn/lib/utils";

import { CONFIG_EXAMPLE, DOCTOR_EXAMPLE, ENV_EXAMPLE, INSTALL_COMMANDS, OPTIONS, STEPS, TOC } from "./data";

/**
 * The body of the docs template: Fernway's "Installation" page with an "On this page" rail. Fixed data, no time and
 * no randomness. The page is composed from blocks (registry/blocks): the article is Prose on the system's typeset
 * axis, and the blocks set in it carry IN_PROSE. The prose itself, the option columns and the copy buttons are the
 * product's own and stay here.
 */

// The copy icon is drawn at the title icon's size, as the code bar of this page always drew it.
const CopyButton = ({ copied = false }: { copied?: boolean }) => (
    <Button variant="ghost" size="xs">
        {copied ? <Check data-icon="inline-start" className="size-[14px]" /> : <Copy data-icon="inline-start" className="size-[14px]" />}
        {copied ? "Copied" : "Copy"}
    </Button>
);

const Code = ({ title, code, className }: { title: string; code: string; className?: string }) => (
    <CodeBlock title={title} icon={<Terminal />} code={code} action={<CopyButton />} className={className} />
);

type Option = (typeof OPTIONS)[number];

const OPTION_COLUMNS: DataTableColumn<Option>[] = [
    {
        id: "option",
        header: "Option",
        cell: (option) => (
            <span className="flex flex-wrap items-center gap-1.5">
                <code className={cn(INLINE_CODE, "whitespace-nowrap")}>{option.name}</code>
                {option.required ? <Badge variant="outline">Required</Badge> : null}
            </span>
        ),
    },
    { id: "type", header: "Type", kind: "wrap", cell: (option) => <code className={INLINE_CODE}>{option.type}</code> },
    { id: "default", header: "Default", cell: (option) => <code className={cn(INLINE_CODE, "whitespace-nowrap")}>{option.fallback}</code> },
    { id: "description", header: "Description", kind: "wrap", cell: (option) => option.description },
];

const Article = () => (
    <Prose as="article" className={cn(MEASURE.md, "min-w-0 flex-1")}>
        <ArticleHeading
            eyebrow="Getting started"
            title="Installation"
            lead={(
                <>
                    Add the Fernway SDK to an existing service, connect it to your project and run your first durable workflow locally. The whole
                    setup takes about five minutes.
                </>
            )}
            meta={(
                <>
                    <Badge variant="secondary">v2.4.0</Badge>
                    <Badge variant="outline">Stable</Badge>
                    <IconNote className="gap-1.5" icon={<Clock />}>6 min read</IconNote>
                    <span>Updated Jan 12, 2026 by Ines Varga</span>
                </>
            )}
        />

        <Alert className={IN_PROSE}>
            <Info />
            <AlertTitle>Before you begin</AlertTitle>
            <AlertDescription>
                You need a Fernway project, a service on an ES2022 runtime and PostgreSQL 14 or later for run history. See Requirements for
                the full list.
            </AlertDescription>
        </Alert>

        <h2 id="install">Install the SDK</h2>
        <p>Install the package with your package manager. The CLI ships in the same package, so there is nothing else to add.</p>
        <CodeTabs
            defaultTab="npm"
            icon={<Terminal />}
            tabs={INSTALL_COMMANDS.map((item) => ({ value: item.id, label: item.label, title: "Terminal", code: item.command, action: <CopyButton copied={item.id === "npm"} /> }))}
            className={IN_PROSE}
        />

        <h2 id="setup">Set up your project</h2>
        <p>Four steps take you from an empty folder to a workflow run you can inspect.</p>
        <StepList
            steps={STEPS.map((step) => ({ title: step.title, body: step.body, content: step.code ? <Code title="Terminal" code={step.code} /> : undefined }))}
            className={IN_PROSE}
        />
        <p>The generated config file looks like this:</p>
        <Code title="fernway.config.ts" code={CONFIG_EXAMPLE} className={IN_PROSE} />

        <Alert className={IN_PROSE}>
            <TriangleAlert />
            <AlertTitle>Keep the signing secret out of source control</AlertTitle>
            <AlertDescription>
                Anyone with the secret can send events that start workflows. Store it in your secret manager and rotate it from Settings →
                API keys if it leaks.
            </AlertDescription>
        </Alert>

        <h2 id="options">Configuration options</h2>
        <p>Every option can also be set per environment. Values in the config file win over defaults, and environment variables win over both.</p>
        <TableFrame className={IN_PROSE}>
            <DataTable columns={OPTION_COLUMNS} rows={OPTIONS} rowId={(option) => option.name} />
        </TableFrame>

        <h3 id="env">Environment variables</h3>
        <p>
            The SDK reads three variables. Use <code>fw_test_</code> keys locally; live keys only work from deployed workers.
        </p>
        <Code title=".env.local" code={ENV_EXAMPLE} className={IN_PROSE} />

        <h2 id="verify">Verify the installation</h2>
        <p>Run the doctor command. It checks the config, credentials, database and the workflows it can find.</p>
        <Code title="Terminal" code={DOCTOR_EXAMPLE} className={IN_PROSE} />

        <h2 id="next">Next steps</h2>
        <PagerCards
            previous={{ title: "Requirements", description: "Runtimes, databases and network access" }}
            next={{ title: "First workflow", description: "Write, run and replay a three-step workflow" }}
            className={IN_PROSE}
        />

        <Separator className={IN_PROSE} />
        <div className={cn(IN_PROSE, MUTED_BODY, "flex flex-wrap items-center justify-between gap-3")}>
            <span className="flex flex-wrap items-center gap-2">
                Was this page helpful?
                <Button variant="outline" size="sm"><ThumbsUp data-icon="inline-start" />Yes</Button>
                <Button variant="outline" size="sm"><ThumbsDown data-icon="inline-start" />No</Button>
            </span>
            <Button variant="ghost" size="sm"><Pencil data-icon="inline-start" />Edit this page</Button>
        </div>
    </Prose>
);

// [contain:inline-size]: the body never widens SidebarInset (upstream markup, no min-w-0) past the viewport.
export const DocsPage = () => (
    <Page gutter="none" gap="none">
        <PageContent gutter="xl" gap="none" document>
        <PageSplit gap="xl" narrow="hide">
            <Article />
            <OnThisPage
                items={TOC}
                note="Found a problem? Open an issue from the docs repository or ask in the community forum."
                className={cn(ASIDE_WIDTH.xs, ASIDE_NARROW_HIDDEN)}
            />
        </PageSplit>
        </PageContent>
    </Page>
);
