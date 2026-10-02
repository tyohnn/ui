import { Calendar, CircleDashed, Clock, Info, Plus, Tag, TriangleAlert, Users, Copy, MessageSquare, Eye } from "@tyohnn/icons";

import { Checklist } from "@tyohnn/blocks/checklist";
import { CodeBlock } from "@tyohnn/blocks/code-block";
import { DataTable, type DataTableColumn } from "@tyohnn/blocks/data-table";
import { DocumentTitle } from "@tyohnn/blocks/document-title";
import { PendingText } from "@tyohnn/blocks/lib/pending";
import { Page, PageContent } from "@tyohnn/blocks/page";
import { PropertyList, PropertyText } from "@tyohnn/blocks/property-list";
import { Prose } from "@tyohnn/blocks/prose";
import { TableFrame } from "@tyohnn/blocks/table-frame";
import { Alert, AlertDescription, AlertTitle } from "@tyohnn/components/alert";
import { Avatar, AvatarFallback } from "@tyohnn/components/avatar";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";

import { LOADING } from "../../loading";
import { CHECKLIST, FLAG_CONFIG, MILESTONES, PROPERTIES } from "./data";

/**
 * The body of the editor: one project brief as a document page. A cover emoji and title, the page's property rows,
 * then long-form content on the system's document typeset (headings, lists, a quote) with a checklist, callouts,
 * a milestone table and a code block between the passages. Fixed data. The page is composed from blocks
 * (registry/blocks); which properties and milestones the brief has, and the prose itself, stay here.
 */

const STATUS_VARIANT = {
    Done: "secondary",
    "In progress": "default",
    "Not started": "outline",
    "At risk": "destructive",
} as const;

type Milestone = (typeof MILESTONES)[number];

// The status waits as an empty badge, so a waiting row is as tall as it will be. Its bar takes the badge's own line
// height: the badge then sits on the same baseline as one with a word in it.
const MILESTONE_COLUMNS: DataTableColumn<Milestone>[] = [
    { id: "milestone", header: "Milestone", cell: (milestone) => milestone.name },
    { id: "owner", header: "Owner", cell: (milestone) => milestone.owner },
    { id: "date", header: "Date", cell: (milestone) => milestone.date },
    { id: "status", header: "Status", align: "end", pending: <Badge variant="outline"><PendingText length={9} className="leading-[inherit]" /></Badge>, cell: (milestone) => <Badge variant={STATUS_VARIANT[milestone.status]}>{milestone.status}</Badge> },
];

const Properties = () => (
    <PropertyList
        loading={LOADING}
        properties={[
            { icon: <CircleDashed />, label: "Status", value: <Badge>{PROPERTIES.status}</Badge> },
            {
                icon: <Users />,
                label: "Owner",
                value: (
                    <>
                        <Avatar size="sm">
                            <AvatarFallback>{PROPERTIES.owner.initials}</AvatarFallback>
                        </Avatar>
                        <PropertyText>{PROPERTIES.owner.name}</PropertyText>
                    </>
                ),
            },
            {
                icon: <Eye />,
                label: "Reviewers",
                value: PROPERTIES.reviewers.map((person) => (
                    <span key={person.initials} className="mr-2 flex items-center gap-1.5">
                        <Avatar size="sm">
                            <AvatarFallback>{person.initials}</AvatarFallback>
                        </Avatar>
                        <PropertyText>{person.name}</PropertyText>
                    </span>
                )),
            },
            { icon: <Calendar />, label: "Due date", value: <PropertyText>{PROPERTIES.due}</PropertyText> },
            {
                icon: <Tag />,
                label: "Tags",
                value: (
                    <>
                        {PROPERTIES.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                        <Button variant="ghost" size="icon-xs" aria-label="Add tag"><Plus /></Button>
                    </>
                ),
            },
            { icon: <Clock />, label: "Last edited", value: <PropertyText>{PROPERTIES.updated} by Yuki Tanaka</PropertyText> },
        ]}
        actions={(
            <>
                <Button variant="ghost" size="sm">
                    <MessageSquare data-icon="inline-start" />
                    4 comments
                </Button>
                <Button variant="ghost" size="sm">
                    <Plus data-icon="inline-start" />
                    Add a property
                </Button>
            </>
        )}
    />
);

// [contain:inline-size]: the page never widens SidebarInset (upstream markup, no min-w-0) past the viewport.
export const Document = () => (
    <Page gutter="none" gap="none">
        <PageContent as="article" measure="sm" gap="md" document>
            <DocumentTitle loading={LOADING} cover="📊" title="Checkout Redesign — Project Brief" />
            <Properties />
            <Prose preset="document">
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
            </Prose>

            <Alert>
                <Info />
                <AlertTitle>Decision needed by January 21</AlertTitle>
                <AlertDescription>
                    Finance and legal must agree whether tax is estimated before the address is complete. The design works either way,
                    but the copy on the order summary changes.
                </AlertDescription>
            </Alert>

            <Prose preset="document">
                <h2>Scope</h2>
                <h3>Discovery checklist</h3>
            </Prose>
            <Checklist loading={LOADING} count={CHECKLIST.length} items={CHECKLIST} />

            <Prose preset="document">
                <h3>What we heard</h3>
                <blockquote>
                    <p>&ldquo;I know my address and my card are saved. Why am I clicking through four screens to see them again?&rdquo;</p>
                </blockquote>
                <p>
                    Six of eight participants said the same thing in their own words. The two who did not were first-time buyers,
                    who still need the guided flow — so it stays for guests.
                </p>

                <h2>Milestones</h2>
            </Prose>
            <TableFrame>
                <DataTable loading={LOADING} loadingRows={MILESTONES.length} columns={MILESTONE_COLUMNS} rows={MILESTONES} rowId={(milestone) => milestone.name} />
            </TableFrame>

            <Alert variant="destructive">
                <TriangleAlert />
                <AlertTitle>Full rollout is at risk</AlertTitle>
                <AlertDescription>The iOS payment sheet update ships with the February app release; if it slips, iOS stays at 0%.</AlertDescription>
            </Alert>

            <Prose preset="document">
                <h2>Implementation notes</h2>
                <p>
                    The new flow ships behind <code>checkout-single-page</code>. Web starts at 10% of returning customers; iOS
                    follows once the payment sheet update is live.
                </p>
            </Prose>
            {/* This page's code bar is roomier than the block's default, and the whole bar — the copy button with the title — is muted mono text. */}
            <CodeBlock
                loading={LOADING}
                loadingLines={FLAG_CONFIG.split("\n").length}
                title="TypeScript"
                code={FLAG_CONFIG}
                barClassName="px-3 py-1.5 font-mono text-muted-foreground"
                action={(
                    <Button variant="ghost" size="xs">
                        <Copy data-icon="inline-start" />
                        Copy
                    </Button>
                )}
            />

            <Prose preset="document">
                <h3>Open questions</h3>
                <ol>
                    <li>Do we show delivery dates before the address is confirmed?</li>
                    <li>Which guardrail breach pauses the experiment automatically?</li>
                </ol>
            </Prose>
        </PageContent>
    </Page>
);
