import { Bell, Calendar, Check, Copy, Filter, Plus, Rocket, Sparkles, TriangleAlert, Zap } from "@tyohnn/icons";

import { Byline } from "@tyohnn/blocks/byline";
import { CodeBlock } from "@tyohnn/blocks/code-block";
import { IconNote } from "@tyohnn/blocks/icon-note";
import { InfoCard } from "@tyohnn/blocks/info-card";
import { BODY, IN_PROSE, NOTE } from "@tyohnn/blocks/lib/copy";
import { LinkItemList } from "@tyohnn/blocks/link-item-list";
import { Prose } from "@tyohnn/blocks/prose";
import { RuleSteps } from "@tyohnn/blocks/rule-steps";
import { TimelineBars } from "@tyohnn/blocks/timeline-bars";
import { Alert, AlertDescription, AlertTitle } from "@tyohnn/components/alert";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@tyohnn/components/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@tyohnn/components/field";
import { Input } from "@tyohnn/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@tyohnn/components/select";
import { Separator } from "@tyohnn/components/separator";
import { Switch } from "@tyohnn/components/switch";
import { ToggleGroup, ToggleGroupItem } from "@tyohnn/components/toggle-group";
import { cn } from "@tyohnn/lib/utils";

import { AUTHORS, EARLIER, FEATURES_SHORT, FIXES, IMPROVEMENTS, MIGRATION_EXAMPLE, RELEASE, TIMELINE_ROWS } from "./data";

/**
 * The body of the changelog template: Orbitly's 4.0 release post, whose sections are the right sidebar's table of
 * contents. New features show real UI fragments in cards instead of screenshots. Fixed data, no time and no
 * randomness. The post is Prose on the system's typeset axis, composed from blocks (registry/blocks); what is set
 * in the text carries IN_PROSE. The feature fragments are this release's own illustrations and stay here.
 */

// A small icon in front of a card title or a row of controls.
const LEAD_ICON = "size-[16px] shrink-0 text-muted-foreground";

const TimelineFragment = () => (
    <InfoCard
        title="Q1 roadmap"
        description="Jan 5 – Mar 27 · 3 projects"
        action={(
            <ToggleGroup variant="outline" size="sm" spacing={0} defaultValue={["weeks"]} aria-label="Scale">
                <ToggleGroupItem value="weeks">Weeks</ToggleGroupItem>
                <ToggleGroupItem value="months">Months</ToggleGroupItem>
            </ToggleGroup>
        )}
        className={IN_PROSE}
    >
        <TimelineBars
            scale={["January", "February", "March"]}
            rows={TIMELINE_ROWS.map((row) => ({
                id: row.name,
                name: row.name,
                meta: <>{row.owner} · {row.state}</>,
                start: row.start,
                span: row.span,
                progress: row.progress,
                progressLabel: `${row.name} progress`,
            }))}
        />
    </InfoCard>
);

const AutomationFragment = () => (
    <Card size="sm" className={IN_PROSE}>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className={LEAD_ICON} />Ship finished work</CardTitle>
            <CardDescription>Runs on 3 projects · 214 runs this week</CardDescription>
            <CardAction><Switch defaultChecked aria-label="Rule enabled" /></CardAction>
        </CardHeader>
        <CardContent>
            <RuleSteps
                steps={[
                    { id: "when", keyword: <Badge variant="secondary">When</Badge>, parts: ["Status changes to", <Badge variant="outline"><Check data-icon="inline-start" />Done</Badge>] },
                    { id: "if", keyword: <Badge variant="secondary">If</Badge>, parts: ["Label is", <Badge variant="outline">customer-facing</Badge>] },
                    {
                        id: "then",
                        keyword: <Badge>Then</Badge>,
                        parts: [
                            "Move to",
                            <Badge variant="outline"><Rocket data-icon="inline-start" />Shipped</Badge>,
                            "and notify",
                            <Badge variant="outline"><Bell data-icon="inline-start" />#releases</Badge>,
                        ],
                    },
                ]}
            />
        </CardContent>
        <CardFooter className="justify-between gap-2">
            <span className={NOTE}>Last run 4 min ago · 0 errors</span>
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
    <Card size="sm" className={IN_PROSE}>
        <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <Filter className={LEAD_ICON} />
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
                <span className={NOTE}>Shared with Platform team · 18 tasks</span>
            </div>
        </CardContent>
    </Card>
);

const CustomFieldsFragment = () => (
    <InfoCard title="New field" description="Added to every task in Mobile app" className={IN_PROSE}>
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
    </InfoCard>
);

// A place in the text the sidebar links to that has no heading of its own.
const Anchor = ({ id }: { id: string }) => <span id={id} className="block" />;

export const ChangelogPost = () => (
    <div className="h-[calc(100svh-4rem)] min-h-0 overflow-y-auto [contain:inline-size]">
        <Prose as="article" className="mx-auto max-w-[52rem] px-10 pt-8 pb-16">
            <div className="not-typeset flex flex-wrap items-center gap-2">
                <Badge>{RELEASE.version}</Badge>
                <IconNote className="gap-1.5" icon={<Calendar />}>{RELEASE.date}</IconNote>
                <Separator orientation="vertical" className="data-vertical:h-4 data-vertical:self-auto" />
                {RELEASE.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
            </div>
            <h1 className="mt-4">Orbitly 4.0: timelines, automations and a faster editor</h1>
            <Byline
                authors={AUTHORS}
                actions={(
                    <>
                        <Button variant="outline" size="sm"><Copy data-icon="inline-start" />Copy link</Button>
                        <Button size="sm"><Bell data-icon="inline-start" />Subscribe</Button>
                    </>
                )}
                className={IN_PROSE}
            />

            <h2 id="highlights">Highlights</h2>
            <Anchor id="summary" />
            <p>
                Orbitly 4.0 is our largest release since 3.0. Plans now have a <strong>timeline view</strong>, repetitive work can run as{" "}
                <strong>automations</strong>, and the task editor opens more than three times faster. It is rolling out to every workspace
                today; Enterprise workspaces on the scheduled channel get it on January 21.
            </p>
            <Alert className={IN_PROSE} id="upgrade">
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
                    <h3 id={feature.id} className="flex flex-wrap items-center gap-2">
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
            <CodeBlock
                title="webhooks.ts"
                code={MIGRATION_EXAMPLE}
                size="sm"
                action={<Button variant="ghost" size="xs"><Copy data-icon="inline-start" />Copy</Button>}
                className={IN_PROSE}
            />
            <Alert className={IN_PROSE}>
                <TriangleAlert />
                <AlertTitle>Renamed statuses break label checks</AlertTitle>
                <AlertDescription>
                    Integrations that compare the status label stop matching as soon as someone renames a status. Compare the status key instead,
                    then turn on v2 in Settings → Webhooks.
                </AlertDescription>
            </Alert>

            <Separator className={IN_PROSE} />
            <section className={cn(IN_PROSE, "flex flex-col gap-3")}>
                <span className={cn(BODY, "font-medium")}>Earlier releases</span>
                <LinkItemList trailing="arrow" items={EARLIER.map((release) => ({ id: release.version, href: "#", title: release.title, description: <>{release.version} · {release.date}</> }))} />
            </section>
        </Prose>
    </div>
);
