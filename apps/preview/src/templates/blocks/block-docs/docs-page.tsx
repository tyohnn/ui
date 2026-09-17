import { ArrowLeft, ArrowRight, Check, Clock, Copy, Info, Pencil, Terminal, ThumbsDown, ThumbsUp, TriangleAlert } from "@tyohnn/icons";

import { Alert, AlertDescription, AlertTitle } from "@tyohnn/components/alert";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@tyohnn/components/card";
import { Separator } from "@tyohnn/components/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tyohnn/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tyohnn/components/tabs";

import { CONFIG_EXAMPLE, DOCTOR_EXAMPLE, ENV_EXAMPLE, INSTALL_COMMANDS, OPTIONS, STEPS, TOC } from "./data";

/**
 * The body of the docs template: Fernway's "Installation" page with an "On this page" rail. Fixed data, no time and
 * no randomness. Prose uses the system's typeset axis (`typeset typeset-tool`); primitives inside it are `not-typeset`. Code blocks, step
 * numbers and the rail read tokens in DOCS_STYLE.
 */

const CodeBlock = ({ title, code, copied = false }: { title: string; code: string; copied?: boolean }) => (
    <div className="dcs-code not-typeset">
        <div className="dcs-code-bar flex items-center justify-between gap-2 py-1 pr-1 pl-3">
            <span className="dcs-code-title flex min-w-0 items-center gap-1.5">
                <Terminal />
                <span className="truncate">{title}</span>
            </span>
            <Button variant="ghost" size="xs">
                {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
                {copied ? "Copied" : "Copy"}
            </Button>
        </div>
        <pre className="px-4 py-3"><code>{code}</code></pre>
    </div>
);

const Article = () => (
    <article className="typeset typeset-tool dcs-article min-w-0 flex-1">
        <p className="dcs-eyebrow">Getting started</p>
        <h1>Installation</h1>
        <p className="dcs-lead">
            Add the Fernway SDK to an existing service, connect it to your project and run your first durable workflow locally. The whole
            setup takes about five minutes.
        </p>
        <div className="dcs-meta not-typeset flex flex-wrap items-center gap-x-3 gap-y-2">
            <Badge variant="secondary">v2.4.0</Badge>
            <Badge variant="outline">Stable</Badge>
            <span className="flex items-center gap-1.5"><Clock />6 min read</span>
            <span>Updated Jan 12, 2026 by Ines Varga</span>
        </div>

        <Alert className="not-typeset dcs-block">
            <Info />
            <AlertTitle>Before you begin</AlertTitle>
            <AlertDescription>
                You need a Fernway project, a service on an ES2022 runtime and PostgreSQL 14 or later for run history. See Requirements for
                the full list.
            </AlertDescription>
        </Alert>

        <h2 id="install">Install the SDK</h2>
        <p>Install the package with your package manager. The CLI ships in the same package, so there is nothing else to add.</p>
        <Tabs defaultValue="npm" className="not-typeset dcs-block">
            <TabsList>
                {INSTALL_COMMANDS.map((item) => <TabsTrigger key={item.id} value={item.id}>{item.label}</TabsTrigger>)}
            </TabsList>
            {INSTALL_COMMANDS.map((item) => (
                <TabsContent key={item.id} value={item.id}>
                    <CodeBlock title="Terminal" code={item.command} copied={item.id === "npm"} />
                </TabsContent>
            ))}
        </Tabs>

        <h2 id="setup">Set up your project</h2>
        <p>Four steps take you from an empty folder to a workflow run you can inspect.</p>
        <ol className="dcs-steps not-typeset flex flex-col gap-5">
            {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                    <span className="dcs-step-number flex size-7 shrink-0 items-center justify-center">{index + 1}</span>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <h3 className="dcs-step-title">{step.title}</h3>
                        <p className="dcs-step-body">{step.body}</p>
                        {step.code ? <CodeBlock title="Terminal" code={step.code} /> : null}
                    </div>
                </li>
            ))}
        </ol>
        <p>The generated config file looks like this:</p>
        <CodeBlock title="fernway.config.ts" code={CONFIG_EXAMPLE} />

        <Alert className="not-typeset dcs-block">
            <TriangleAlert />
            <AlertTitle>Keep the signing secret out of source control</AlertTitle>
            <AlertDescription>
                Anyone with the secret can send events that start workflows. Store it in your secret manager and rotate it from Settings →
                API keys if it leaks.
            </AlertDescription>
        </Alert>

        <h2 id="options">Configuration options</h2>
        <p>Every option can also be set per environment. Values in the config file win over defaults, and environment variables win over both.</p>
        <div className="dcs-table not-typeset">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Option</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Default</TableHead>
                        <TableHead>Description</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {OPTIONS.map((option) => (
                        <TableRow key={option.name}>
                            <TableCell>
                                <span className="flex flex-wrap items-center gap-1.5">
                                    <code className="dcs-inline-code">{option.name}</code>
                                    {option.required ? <Badge variant="outline">Required</Badge> : null}
                                </span>
                            </TableCell>
                            <TableCell className="dcs-wrap"><code className="dcs-type">{option.type}</code></TableCell>
                            <TableCell><code className="dcs-inline-code">{option.fallback}</code></TableCell>
                            <TableCell className="dcs-wrap">{option.description}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>

        <h3 id="env">Environment variables</h3>
        <p>
            The SDK reads three variables. Use <code>fw_test_</code> keys locally; live keys only work from deployed workers.
        </p>
        <CodeBlock title=".env.local" code={ENV_EXAMPLE} />

        <h2 id="verify">Verify the installation</h2>
        <p>Run the doctor command. It checks the config, credentials, database and the workflows it can find.</p>
        <CodeBlock title="Terminal" code={DOCTOR_EXAMPLE} />

        <h2 id="next">Next steps</h2>
        <div className="not-typeset dcs-block grid gap-3 sm:grid-cols-2">
            <Card size="sm" className="dcs-pager">
                <CardHeader>
                    <CardDescription className="flex items-center gap-1.5"><ArrowLeft />Previous</CardDescription>
                    <CardTitle>Requirements</CardTitle>
                    <CardDescription>Runtimes, databases and network access</CardDescription>
                </CardHeader>
            </Card>
            <Card size="sm" className="dcs-pager dcs-pager-next">
                <CardHeader>
                    <CardDescription className="flex items-center justify-end gap-1.5">Next<ArrowRight /></CardDescription>
                    <CardTitle>First workflow</CardTitle>
                    <CardDescription>Write, run and replay a three-step workflow</CardDescription>
                </CardHeader>
            </Card>
        </div>

        <Separator className="not-typeset dcs-block" />
        <div className="not-typeset dcs-feedback flex flex-wrap items-center justify-between gap-3">
            <span className="flex flex-wrap items-center gap-2">
                Was this page helpful?
                <Button variant="outline" size="sm"><ThumbsUp data-icon="inline-start" />Yes</Button>
                <Button variant="outline" size="sm"><ThumbsDown data-icon="inline-start" />No</Button>
            </span>
            <Button variant="ghost" size="sm"><Pencil data-icon="inline-start" />Edit this page</Button>
        </div>
    </article>
);

const OnThisPage = () => (
    <nav aria-label="On this page" className="dcs-rail hidden w-56 shrink-0 flex-col gap-3 xl:flex">
        <span className="dcs-rail-title">On this page</span>
        <ul className="flex flex-col gap-2">
            {TOC.map((item) => (
                <li key={item.id} className={item.nested ? "pl-3" : undefined}>
                    <a href={`#${item.id}`} data-active={item.active || undefined}>{item.label}</a>
                </li>
            ))}
        </ul>
        <Separator />
        <span className="dcs-rail-note">Found a problem? Open an issue from the docs repository or ask in the community forum.</span>
    </nav>
);

// [contain:inline-size]: the body never widens SidebarInset (upstream markup, no min-w-0) past the viewport.
export const DocsPage = () => (
    <div className="h-[calc(100svh-4rem)] min-h-0 overflow-y-auto [contain:inline-size]">
        <div className="flex gap-10 px-10 pt-8 pb-16">
            <Article />
            <OnThisPage />
        </div>
    </div>
);

/**
 * The template's own stylesheet, tokens only: the lead and eyebrow text, code blocks (mono stack, muted surface),
 * step numbers, spacing for primitives placed in the typeset flow, and the "On this page" rail.
 */
export const DOCS_STYLE = `
[data-template="block-docs"] .dcs-article { max-width: 52rem; margin-inline: 0; }
[data-template="block-docs"] .dcs-article > h1 { margin-block-start: 0.25rem; }
[data-template="block-docs"] .dcs-eyebrow { margin: 0; font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); }
[data-template="block-docs"] .dcs-lead { color: var(--muted-foreground); }
[data-template="block-docs"] .dcs-meta { margin-block-start: 1rem; font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); }
[data-template="block-docs"] .dcs-meta svg { width: 14px; height: 14px; }
[data-template="block-docs"] .dcs-block,
[data-template="block-docs"] .dcs-article > .dcs-code,
[data-template="block-docs"] .dcs-table,
[data-template="block-docs"] .dcs-steps,
[data-template="block-docs"] .dcs-feedback { margin-block-start: 1.25rem; }
[data-template="block-docs"] .dcs-code {
    overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-lg);
    background-color: var(--muted); color: var(--foreground);
}
[data-template="block-docs"] .dcs-code-bar {
    border-bottom: 1px solid var(--border); background-color: var(--background);
}
[data-template="block-docs"] .dcs-code-title { font-family: var(--font-mono); font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); }
[data-template="block-docs"] .dcs-code-bar svg { width: 14px; height: 14px; flex-shrink: 0; }
[data-template="block-docs"] .dcs-code pre { margin: 0; overflow-x: auto; font-family: var(--font-mono); font-size: var(--ui-text-md); line-height: 1.6; }
[data-template="block-docs"] .dcs-steps { list-style: none; margin-inline: 0; padding: 0; }
[data-template="block-docs"] .dcs-step-number {
    border: 1px solid var(--border); border-radius: 999px; background-color: var(--muted);
    font-size: var(--ui-text-sm); line-height: 1; font-variant-numeric: tabular-nums; color: var(--foreground);
}
[data-template="block-docs"] .dcs-step-title { margin: 0; font-size: var(--ui-text-lg); line-height: var(--ui-line-height-lg); font-weight: 600; }
[data-template="block-docs"] .dcs-step-body { margin: 0; font-size: var(--ui-text-md); line-height: var(--ui-line-height-md); color: var(--muted-foreground); }
[data-template="block-docs"] .dcs-table { overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-lg); }
[data-template="block-docs"] .dcs-inline-code { font-family: var(--font-mono); font-size: var(--ui-text-sm); white-space: nowrap; }
[data-template="block-docs"] .dcs-type { font-family: var(--font-mono); font-size: var(--ui-text-sm); }
[data-template="block-docs"] .dcs-wrap { white-space: normal; }
[data-template="block-docs"] .dcs-pager-next { text-align: end; }
[data-template="block-docs"] .dcs-pager svg { width: 14px; height: 14px; }
[data-template="block-docs"] .dcs-feedback { font-size: var(--ui-text-md); line-height: var(--ui-line-height-md); color: var(--muted-foreground); }
[data-template="block-docs"] .dcs-rail { position: sticky; top: 2rem; align-self: flex-start; font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); }
[data-template="block-docs"] .dcs-rail-title { font-weight: 600; color: var(--foreground); }
[data-template="block-docs"] .dcs-rail a { color: var(--muted-foreground); text-decoration: none; }
[data-template="block-docs"] .dcs-rail a[data-active] { color: var(--foreground); font-weight: 500; }
[data-template="block-docs"] .dcs-rail-note { color: var(--muted-foreground); }
`;
