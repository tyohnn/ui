import { ArrowRight, Bell, Calendar, Check, Copy, Filter, Plus, Rocket, Sparkles, TriangleAlert, Zap } from "@tyohnn/icons";

import { Alert, AlertDescription, AlertTitle } from "@tyohnn/components/alert";
import { Avatar, AvatarFallback } from "@tyohnn/components/avatar";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@tyohnn/components/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@tyohnn/components/field";
import { Input } from "@tyohnn/components/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@tyohnn/components/item";
import { Progress } from "@tyohnn/components/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@tyohnn/components/select";
import { Separator } from "@tyohnn/components/separator";
import { Switch } from "@tyohnn/components/switch";
import { ToggleGroup, ToggleGroupItem } from "@tyohnn/components/toggle-group";

import { AUTHORS, EARLIER, FEATURES_SHORT, FIXES, IMPROVEMENTS, MIGRATION_EXAMPLE, RELEASE, TIMELINE_ROWS } from "./data";

/**
 * The body of the changelog template: Orbitly's 4.0 release post, whose sections are the right sidebar's table of
 * contents. New features show real UI fragments in cards instead of screenshots. Fixed data, no time and no
 * randomness. Prose uses the system's typeset axis (`typeset typeset-tool`); primitives inside it are `not-typeset`.
 * Code, the timeline bars and small text read tokens in CHANGELOG_STYLE.
 */

const TimelineFragment = () => (
    <Card size="sm" className="not-typeset clg-figure">
        <CardHeader>
            <CardTitle>Q1 roadmap</CardTitle>
            <CardDescription>Jan 5 – Mar 27 · 3 projects</CardDescription>
            <CardAction>
                <ToggleGroup variant="outline" size="sm" spacing={0} defaultValue={["weeks"]} aria-label="Scale">
                    <ToggleGroupItem value="weeks">Weeks</ToggleGroupItem>
                    <ToggleGroupItem value="months">Months</ToggleGroupItem>
                </ToggleGroup>
            </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
            <div className="clg-scale grid grid-cols-3">
                <span>January</span><span>February</span><span>March</span>
            </div>
            {TIMELINE_ROWS.map((row) => (
                <div key={row.name} className="grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)] items-center gap-3">
                    <div className="flex min-w-0 flex-col">
                        <span className="clg-row-name truncate">{row.name}</span>
                        <span className="clg-small">{row.owner} · {row.state}</span>
                    </div>
                    <div className="clg-track">
                        <div className="clg-bar flex items-center px-2" style={{ marginInlineStart: `${row.start}%`, width: `${row.span}%` }}>
                            <Progress value={row.progress} aria-label={`${row.name} progress`} className="w-full" />
                        </div>
                    </div>
                </div>
            ))}
        </CardContent>
    </Card>
);

const AutomationFragment = () => (
    <Card size="sm" className="not-typeset clg-figure">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="clg-title-icon" />Ship finished work</CardTitle>
            <CardDescription>Runs on 3 projects · 214 runs this week</CardDescription>
            <CardAction><Switch defaultChecked aria-label="Rule enabled" /></CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
            <div className="clg-step flex flex-wrap items-center gap-2 px-3 py-2">
                <Badge variant="secondary">When</Badge>
                <span className="clg-step-text">Status changes to</span>
                <Badge variant="outline"><Check data-icon="inline-start" />Done</Badge>
            </div>
            <div className="clg-step flex flex-wrap items-center gap-2 px-3 py-2">
                <Badge variant="secondary">If</Badge>
                <span className="clg-step-text">Label is</span>
                <Badge variant="outline">customer-facing</Badge>
            </div>
            <div className="clg-step flex flex-wrap items-center gap-2 px-3 py-2">
                <Badge>Then</Badge>
                <span className="clg-step-text">Move to</span>
                <Badge variant="outline"><Rocket data-icon="inline-start" />Shipped</Badge>
                <span className="clg-step-text">and notify</span>
                <Badge variant="outline"><Bell data-icon="inline-start" />#releases</Badge>
            </div>
        </CardContent>
        <CardFooter className="justify-between gap-2">
            <span className="clg-small">Last run 4 min ago · 0 errors</span>
            <Button variant="outline" size="sm"><Plus data-icon="inline-start" />Add action</Button>
        </CardFooter>
    </Card>
);

const FILTER_ITEMS = [
    { value: "mine", label: "Assigned to me" },
    { value: "team", label: "My team" },
    { value: "all", label: "Everyone" },
];

const FiltersFragment = () => (
    <Card size="sm" className="not-typeset clg-figure">
        <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <Filter className="clg-title-icon" />
                <Select items={FILTER_ITEMS} defaultValue="mine">
                    <SelectTrigger size="sm" className="min-w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {FILTER_ITEMS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Badge variant="secondary">Due this week</Badge>
                <Badge variant="secondary">Priority: High</Badge>
                <Button variant="ghost" size="sm">Clear</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Input aria-label="Filter name" defaultValue="My urgent work" className="max-w-64" />
                <Button size="sm">Save filter</Button>
                <span className="clg-small">Shared with Platform team · 18 tasks</span>
            </div>
        </CardContent>
    </Card>
);

const CustomFieldsFragment = () => (
    <Card size="sm" className="not-typeset clg-figure">
        <CardHeader>
            <CardTitle>New field</CardTitle>
            <CardDescription>Added to every task in Mobile app</CardDescription>
        </CardHeader>
        <CardContent>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="clg-field-name">Name</FieldLabel>
                    <Input id="clg-field-name" defaultValue="Story points" />
                </Field>
                <Field>
                    <FieldLabel htmlFor="clg-field-type">Type</FieldLabel>
                    <Select items={[{ value: "number", label: "Number" }, { value: "select", label: "Single select" }]} defaultValue="number">
                        <SelectTrigger id="clg-field-type"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="select">Single select</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field orientation="horizontal" className="sm:col-span-2">
                    <Switch id="clg-field-required" defaultChecked />
                    <FieldLabel htmlFor="clg-field-required">Required before a task moves to In review</FieldLabel>
                </Field>
                <FieldDescription className="sm:col-span-2">Numbers can be summed per column and shown on cards.</FieldDescription>
            </FieldGroup>
        </CardContent>
    </Card>
);

const Anchor = ({ id }: { id: string }) => <span id={id} className="clg-anchor" />;

export const ChangelogPost = () => (
    <div className="h-[calc(100svh-4rem)] min-h-0 overflow-y-auto [contain:inline-size]">
        <article className="typeset typeset-tool clg-article px-10 pt-8 pb-16">
            <div className="not-typeset flex flex-wrap items-center gap-2">
                <Badge>{RELEASE.version}</Badge>
                <span className="clg-small flex items-center gap-1.5"><Calendar />{RELEASE.date}</span>
                <Separator orientation="vertical" className="data-vertical:h-4 data-vertical:self-auto" />
                {RELEASE.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
            </div>
            <h1>Orbitly 4.0: timelines, automations and a faster editor</h1>
            <div className="not-typeset clg-authors flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4">
                    {AUTHORS.map((author) => (
                        <span key={author.name} className="flex items-center gap-2">
                            <Avatar size="sm"><AvatarFallback>{author.initials}</AvatarFallback></Avatar>
                            <span className="flex flex-col">
                                <span className="clg-row-name">{author.name}</span>
                                <span className="clg-small">{author.role}</span>
                            </span>
                        </span>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm"><Copy data-icon="inline-start" />Copy link</Button>
                    <Button size="sm"><Bell data-icon="inline-start" />Subscribe</Button>
                </div>
            </div>

            <h2 id="highlights">Highlights</h2>
            <Anchor id="summary" />
            <p>
                Orbitly 4.0 is our largest release since 3.0. Plans now have a <strong>timeline view</strong>, repetitive work can run as{" "}
                <strong>automations</strong>, and the task editor opens more than three times faster. It is rolling out to every workspace
                today; Enterprise workspaces on the scheduled channel get it on January 21.
            </p>
            <Alert className="not-typeset clg-block" id="upgrade">
                <Sparkles />
                <AlertTitle>Nothing to do for most teams</AlertTitle>
                <AlertDescription>
                    The web app updates on your next reload and the mobile apps need version 4.0 from the app stores. If you receive webhooks,
                    read Migration before February 15.
                </AlertDescription>
            </Alert>

            <h2 id="features">New features</h2>
            <h3 id="timeline">Timeline view</h3>
            <p>See every project in a plan on one calendar. Drag a bar to move its dates, drag its edge to change the length, and dependencies shift with it.</p>
            <TimelineFragment />

            <h3 id="automations">Automations</h3>
            <p>
                Build rules from a trigger, optional conditions and one or more actions. Rules run within seconds, show their history, and can be
                paused without losing their settings. Business plans include 5,000 runs a month.
            </p>
            <AutomationFragment />

            <h3 id="filters">Saved filters</h3>
            <p>Save any combination of filters with a name, pin it to the sidebar and share it with a team. Shared filters update for everyone.</p>
            <FiltersFragment />

            {FEATURES_SHORT.slice(0, 1).map((feature) => (
                <div key={feature.id} className="contents">
                    <h3 id={feature.id}>{feature.title}</h3>
                    <p>{feature.body}</p>
                </div>
            ))}

            <h3 id="custom-fields">Custom fields</h3>
            <p>Add number, date, single-select and person fields to a project. Fields can be required at a given status, filtered and summed on boards.</p>
            <CustomFieldsFragment />

            {FEATURES_SHORT.slice(1).map((feature) => (
                <div key={feature.id} className="contents">
                    <h3 id={feature.id} className="clg-h3-badge">
                        {feature.title}
                        {feature.badge ? <Badge variant="secondary" className="not-typeset">{feature.badge}</Badge> : null}
                    </h3>
                    <p>{feature.body}</p>
                </div>
            ))}

            <h2 id="improvements">Improvements</h2>
            <ul>
                {IMPROVEMENTS.map((item) => (
                    <li key={item.id} id={item.id}><strong>{item.title}.</strong> {item.body}</li>
                ))}
            </ul>

            <h2 id="fixes">Fixes</h2>
            <ul>
                {FIXES.map((item) => (
                    <li key={item.id} id={item.id}><strong>{item.title}.</strong> {item.body}</li>
                ))}
            </ul>

            <h2 id="migration">Migration</h2>
            <h3 id="webhooks">Webhook payload v2</h3>
            <p>
                Webhooks now send one envelope with a <code>type</code> and a <code>data</code> object, and statuses carry a stable{" "}
                <code>key</code> instead of their display label. Version 1 payloads keep working until February 15, 2026.
            </p>
            <div className="not-typeset clg-code">
                <div className="clg-code-bar flex items-center justify-between gap-2 py-1 pr-1 pl-3">
                    <span className="clg-code-title">webhooks.ts</span>
                    <Button variant="ghost" size="xs"><Copy data-icon="inline-start" />Copy</Button>
                </div>
                <pre className="px-4 py-3"><code>{MIGRATION_EXAMPLE}</code></pre>
            </div>
            <Alert className="not-typeset clg-block">
                <TriangleAlert />
                <AlertTitle>Renamed statuses break label checks</AlertTitle>
                <AlertDescription>
                    Integrations that compare the status label stop matching as soon as someone renames a status. Compare the status key instead,
                    then turn on v2 in Settings → Webhooks.
                </AlertDescription>
            </Alert>

            <Separator className="not-typeset clg-block" />
            <section className="not-typeset clg-block flex flex-col gap-3">
                <span className="clg-row-name">Earlier releases</span>
                <ItemGroup className="gap-2">
                    {EARLIER.map((release) => (
                        <Item key={release.version} variant="outline" size="sm" render={<a href="#" />}>
                            <ItemContent>
                                <ItemTitle>{release.title}</ItemTitle>
                                <ItemDescription>{release.version} · {release.date}</ItemDescription>
                            </ItemContent>
                            <ItemActions><ArrowRight className="clg-title-icon" /></ItemActions>
                        </Item>
                    ))}
                </ItemGroup>
            </section>
        </article>
    </div>
);

/**
 * The template's own stylesheet, tokens only: the article measure, spacing for primitives placed in the typeset flow,
 * the timeline track and bars, automation steps, the code block and small text.
 */
export const CHANGELOG_STYLE = `
[data-template="block-changelog"] .clg-article { max-width: 52rem; margin-inline: auto; }
[data-template="block-changelog"] .clg-article > h1 { margin-block-start: 1rem; }
[data-template="block-changelog"] .clg-authors { margin-block-start: 1.25rem; padding-block: 1rem; border-block: 1px solid var(--border); }
[data-template="block-changelog"] .clg-anchor { display: block; }
[data-template="block-changelog"] .clg-block,
[data-template="block-changelog"] .clg-figure,
[data-template="block-changelog"] .clg-code { margin-block-start: 1.25rem; }
[data-template="block-changelog"] .clg-h3-badge { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
[data-template="block-changelog"] .clg-small { font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); }
[data-template="block-changelog"] .clg-small svg { width: 14px; height: 14px; flex-shrink: 0; }
[data-template="block-changelog"] .clg-row-name { font-size: var(--ui-text-md); line-height: var(--ui-line-height-md); font-weight: 500; }
[data-template="block-changelog"] .clg-title-icon { width: 16px; height: 16px; flex-shrink: 0; color: var(--muted-foreground); }
[data-template="block-changelog"] .clg-scale { margin-inline-start: calc(11rem + 0.75rem); font-size: var(--ui-text-xs); line-height: var(--ui-line-height-xs); color: var(--muted-foreground); }
[data-template="block-changelog"] .clg-scale > span { padding-inline-start: 0.5rem; border-inline-start: 1px solid var(--border); }
[data-template="block-changelog"] .clg-track { border-radius: var(--radius-md); background-color: var(--muted); padding-block: 0.375rem; }
[data-template="block-changelog"] .clg-bar { height: 1.5rem; border: 1px solid var(--border); border-radius: var(--radius-md); background-color: var(--background); }
[data-template="block-changelog"] .clg-step { border: 1px solid var(--border); border-radius: var(--radius-lg); background-color: var(--muted); }
[data-template="block-changelog"] .clg-step-text { font-size: var(--ui-text-md); line-height: var(--ui-line-height-md); }
[data-template="block-changelog"] .clg-code {
    overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-lg);
    background-color: var(--muted); color: var(--foreground);
}
[data-template="block-changelog"] .clg-code-bar { border-bottom: 1px solid var(--border); background-color: var(--background); }
[data-template="block-changelog"] .clg-code-title { font-family: var(--font-mono); font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); }
[data-template="block-changelog"] .clg-code pre { margin: 0; overflow-x: auto; font-family: var(--font-mono); font-size: var(--ui-text-sm); line-height: 1.6; }
`;
