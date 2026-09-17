import { Calendar, CircleDashed, Clock, Info, Plus, Tag, TriangleAlert, Users, Copy, MessageSquare, Eye } from "@tyohnn/icons";

import { Alert, AlertDescription, AlertTitle } from "@tyohnn/components/alert";
import { Avatar, AvatarFallback } from "@tyohnn/components/avatar";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Checkbox } from "@tyohnn/components/checkbox";
import { Label } from "@tyohnn/components/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tyohnn/components/table";

import { CHECKLIST, FLAG_CONFIG, MILESTONES, PROPERTIES } from "./data";

/**
 * The body of the editor: one project brief as a document page. A cover emoji and title, the page's property rows,
 * then long-form content on the system's document typeset (headings, lists, a quote, a code block) with components
 * set in it — a checklist, callouts and a milestone table — each marked `not-typeset` so the component's own
 * styles apply. Fixed data; layout utilities only, the property rows and code block read tokens in DOCUMENT_STYLE.
 */

const STATUS_VARIANT = {
    Done: "secondary",
    "In progress": "default",
    "Not started": "outline",
    "At risk": "destructive",
} as const;

const Property = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
    <div className="ed-property flex min-h-8 flex-wrap items-center gap-x-3 gap-y-1">
        <span className="ed-property-label flex w-32 shrink-0 items-center gap-2">
            {icon}
            {label}
        </span>
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">{children}</div>
    </div>
);

const Properties = () => (
    <div className="not-typeset flex flex-col gap-1">
        <Property icon={<CircleDashed />} label="Status">
            <Badge>{PROPERTIES.status}</Badge>
        </Property>
        <Property icon={<Users />} label="Owner">
            <Avatar size="sm">
                <AvatarFallback>{PROPERTIES.owner.initials}</AvatarFallback>
            </Avatar>
            <span className="ed-property-value">{PROPERTIES.owner.name}</span>
        </Property>
        <Property icon={<Eye />} label="Reviewers">
            {PROPERTIES.reviewers.map((person) => (
                <span key={person.initials} className="mr-2 flex items-center gap-1.5">
                    <Avatar size="sm">
                        <AvatarFallback>{person.initials}</AvatarFallback>
                    </Avatar>
                    <span className="ed-property-value">{person.name}</span>
                </span>
            ))}
        </Property>
        <Property icon={<Calendar />} label="Due date">
            <span className="ed-property-value">{PROPERTIES.due}</span>
        </Property>
        <Property icon={<Tag />} label="Tags">
            {PROPERTIES.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
            <Button variant="ghost" size="icon-xs" aria-label="Add tag"><Plus /></Button>
        </Property>
        <Property icon={<Clock />} label="Last edited">
            <span className="ed-property-value">{PROPERTIES.updated} by Yuki Tanaka</span>
        </Property>
        <div className="flex items-center gap-2 pt-2">
            <Button variant="ghost" size="sm">
                <MessageSquare data-icon="inline-start" />
                4 comments
            </Button>
            <Button variant="ghost" size="sm">
                <Plus data-icon="inline-start" />
                Add a property
            </Button>
        </div>
    </div>
);

const Checklist = () => (
    <div className="not-typeset flex flex-col gap-2.5">
        {CHECKLIST.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
                <Checkbox id={item.id} defaultChecked={item.done} className="mt-0.5" />
                <Label htmlFor={item.id} className={item.done ? "ed-done" : undefined}>{item.label}</Label>
            </div>
        ))}
    </div>
);

const Milestones = () => (
    <div className="not-typeset ed-table">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Milestone</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {MILESTONES.map((milestone) => (
                    <TableRow key={milestone.name}>
                        <TableCell>{milestone.name}</TableCell>
                        <TableCell>{milestone.owner}</TableCell>
                        <TableCell>{milestone.date}</TableCell>
                        <TableCell className="text-right">
                            <Badge variant={STATUS_VARIANT[milestone.status]}>{milestone.status}</Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);

const CodeBlock = () => (
    <div className="not-typeset ed-code">
        <div className="ed-code-bar flex items-center justify-between gap-2 px-3 py-1.5">
            <span>TypeScript</span>
            <Button variant="ghost" size="xs">
                <Copy data-icon="inline-start" />
                Copy
            </Button>
        </div>
        <pre className="px-4 py-3"><code>{FLAG_CONFIG}</code></pre>
    </div>
);

// [contain:inline-size]: the page never widens SidebarInset (upstream markup, no min-w-0) past the viewport.
export const Document = () => (
    <div className="min-h-0 flex-[1_1_0px] overflow-y-auto [contain:inline-size]">
        <article className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
            <div className="flex flex-col gap-3">
                <span className="ed-cover" aria-hidden>📊</span>
                <h1 className="ed-title">Checkout Redesign — Project Brief</h1>
            </div>
            <Properties />
            <div className="typeset ed-body">
                <p>
                    Checkout is where we lose the most revenue we have already earned. In December, 31% of carts that reached the
                    shipping step were abandoned, and returning customers re-entered a saved card in 58% of orders. This brief
                    proposes a single-page checkout for web and iOS that keeps what customers already told us.
                </p>

                <h2>Goals</h2>
                <ul>
                    <li>Raise checkout conversion from <strong>64% to 70%</strong> for returning customers.</li>
                    <li>Cut the median time to pay from 2 min 40 s to under 90 seconds.</li>
                    <li>Keep payment errors and refunds at or below today&apos;s rates.</li>
                </ul>
            </div>

            <Alert className="not-typeset">
                <Info />
                <AlertTitle>Decision needed by January 21</AlertTitle>
                <AlertDescription>
                    Finance and legal must agree whether tax is estimated before the address is complete. The design works either way,
                    but the copy on the order summary changes.
                </AlertDescription>
            </Alert>

            <div className="typeset ed-body">
                <h2>Scope</h2>
                <h3>Discovery checklist</h3>
            </div>
            <Checklist />

            <div className="typeset ed-body">
                <h3>What we heard</h3>
                <blockquote>
                    <p>&ldquo;I know my address and my card are saved. Why am I clicking through four screens to see them again?&rdquo;</p>
                </blockquote>
                <p>
                    Six of eight participants said the same thing in their own words. The two who did not were first-time buyers,
                    who still need the guided flow — so it stays for guests.
                </p>

                <h2>Milestones</h2>
            </div>
            <Milestones />

            <Alert variant="destructive" className="not-typeset">
                <TriangleAlert />
                <AlertTitle>Full rollout is at risk</AlertTitle>
                <AlertDescription>The iOS payment sheet update ships with the February app release; if it slips, iOS stays at 0%.</AlertDescription>
            </Alert>

            <div className="typeset ed-body">
                <h2>Implementation notes</h2>
                <p>
                    The new flow ships behind <code>checkout-single-page</code>. Web starts at 10% of returning customers; iOS
                    follows once the payment sheet update is live.
                </p>
            </div>
            <CodeBlock />

            <div className="typeset ed-body">
                <h3>Open questions</h3>
                <ol>
                    <li>Do we show delivery dates before the address is confirmed?</li>
                    <li>Which guardrail breach pauses the experiment automatically?</li>
                </ol>
            </div>
        </article>
    </div>
);

/** The document's stylesheet: cover and title, property rows, the done checklist items and the code block. Tokens only. */
export const DOCUMENT_STYLE = `
[data-template="block-editor"] .ed-cover { font-size: calc(var(--ui-text-lg) * 2.5); line-height: 1; }
[data-template="block-editor"] .ed-title { font-family: var(--font-heading); font-size: calc(var(--ui-text-lg) * 2); line-height: 1.2; font-weight: 700; color: var(--foreground); }
[data-template="block-editor"] .ed-property-label { font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); }
[data-template="block-editor"] .ed-property-label svg { width: 14px; height: 14px; flex-shrink: 0; }
[data-template="block-editor"] .ed-property-value { font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--foreground); }
[data-template="block-editor"] .ed-body { max-width: none; margin-inline: 0; }
[data-template="block-editor"] .ed-done { color: var(--muted-foreground); text-decoration: line-through; }
[data-template="block-editor"] .ed-table { border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
[data-template="block-editor"] .ed-code { overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-lg); background-color: var(--muted); color: var(--foreground); }
[data-template="block-editor"] .ed-code-bar {
    border-bottom: 1px solid var(--border); background-color: var(--background);
    font-family: var(--font-mono); font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground);
}
[data-template="block-editor"] .ed-code pre { margin: 0; overflow-x: auto; font-family: var(--font-mono); font-size: var(--ui-text-md); line-height: 1.6; }
`;
