import { ArrowRight, Braces, Check, Copy, Key, Lock, Send, Terminal } from "@tyohnn/icons";

import { CodeBlock } from "@tyohnn/blocks/code-block";
import { CodeTabs } from "@tyohnn/blocks/code-tabs";
import { DefinitionList } from "@tyohnn/blocks/definition-list";
import { EndpointHeader } from "@tyohnn/blocks/endpoint-header";
import { IconNote } from "@tyohnn/blocks/icon-note";
import { InfoCard } from "@tyohnn/blocks/info-card";
import { BODY, MUTED_BODY } from "@tyohnn/blocks/lib/copy";
import { PendingText } from "@tyohnn/blocks/lib/pending";
import { ParameterTable } from "@tyohnn/blocks/parameter-table";
import { Prose } from "@tyohnn/blocks/prose";
import { SectionHeading } from "@tyohnn/blocks/section-heading";
import { Alert, AlertDescription, AlertTitle } from "@tyohnn/components/alert";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Separator } from "@tyohnn/components/separator";

import { LOADING } from "../../loading";
import {
    BODY_PARAMETERS,
    ENDPOINT,
    HEADERS,
    type Parameter,
    PATH_PARAMETERS,
    QUERY_PARAMETERS,
    REQUEST_EXAMPLES,
    RESPONSE_EXAMPLE,
    STATUS_CODES,
} from "./data";

/**
 * The body of the API reference template: Ledgerline's "Create a payment" endpoint with its parameters on the left
 * and request/response examples beside them. Fixed data, no time and no randomness. The page is composed from
 * blocks (registry/blocks); which parameters, status codes and examples exist is the API's own and stays here.
 */

const Parameters = ({ title, description, parameters }: { title: string; description: string; parameters: Parameter[] }) => (
    <section className="flex flex-col gap-3">
        <SectionHeading title={title} description={description} />
        <ParameterTable
            parameters={parameters.map((parameter) => ({ ...parameter, note: parameter.values ? <>One of {parameter.values}</> : undefined }))}
        />
    </section>
);

// The copy icon is drawn at the title icon's size, as the code bar of this page always drew it.
const CopyButton = () => <Button variant="ghost" size="xs"><Copy data-icon="inline-start" className="size-[14px]" />Copy</Button>;

const Endpoint = () => (
    <div className="flex min-w-0 flex-col gap-8">
        <EndpointHeader
            loading={LOADING}
            method={ENDPOINT.method}
            path={ENDPOINT.path}
            pathAction={<Button variant="ghost" size="icon-xs" aria-label="Copy path"><Copy /></Button>}
            title="Create a payment"
        >
            <Prose>
                <p>
                    Charges a saved payment method or a one-time token and moves the funds to the connected account. A payment starts as{" "}
                    <code>processing</code> and settles to <code>succeeded</code> or <code>failed</code>; each change sends a{" "}
                    <code>payment.updated</code> event.
                </p>
                <p>
                    With <code>capture=manual</code> the amount is only authorised. Capture it with the capture endpoint within 7 days or the
                    authorisation is released.
                </p>
            </Prose>
            <div className="flex flex-wrap items-center gap-2">
                <Button size="sm"><Send data-icon="inline-start" />Try it</Button>
                <Button variant="outline" size="sm"><Braces data-icon="inline-start" />OpenAPI spec</Button>
                <IconNote icon={<Check />} className={`gap-1.5 ${BODY}`}>Idempotent with a key · Rate limit 100 writes/s</IconNote>
            </div>
        </EndpointHeader>

        <Alert>
            <Lock />
            <AlertTitle>Requires a secret key with payments:write</AlertTitle>
            <AlertDescription>
                Send the key as HTTP Basic auth or a Bearer token. Publishable keys and restricted keys without the scope return 401. Test keys
                start with sk_test_ and never move real money.
            </AlertDescription>
        </Alert>

        <Parameters title="Path parameters" description="Part of the URL." parameters={PATH_PARAMETERS} />
        <Parameters title="Query parameters" description="Appended to the URL. They change the response, not the payment." parameters={QUERY_PARAMETERS} />
        <Parameters title="Headers" description="Optional headers this endpoint reads." parameters={HEADERS} />
        <Parameters title="Body parameters" description="Form-encoded or JSON. Unknown parameters return 400." parameters={BODY_PARAMETERS} />

        <section className="flex flex-col gap-3">
            <SectionHeading title="Status codes" description="Every error returns a JSON body with type, code, message and request_id." />
            <DefinitionList
                items={STATUS_CODES.map((status) => ({
                    id: status.code,
                    badge: <Badge variant={status.tone === "success" ? "secondary" : "outline"}>{status.code}</Badge>,
                    term: status.label,
                    description: status.description,
                }))}
            />
        </section>

        <Separator />
        <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={MUTED_BODY}>{LOADING ? <PendingText length={48} /> : "Last changed in 2026-01-01: capture accepts manual."}</span>
            <Button variant="ghost" size="sm">Retrieve a payment<ArrowRight data-icon="inline-end" /></Button>
        </div>
    </div>
);

// The examples column stays in view beside the parameters while the page scrolls.
const Examples = () => (
    <div className="sticky top-8 flex min-w-0 flex-col gap-4 self-start">
        <InfoCard
            title="Request"
            description={<code className="block font-mono">{ENDPOINT.host}</code>}
            action={<Badge variant="outline"><Key data-icon="inline-start" />sk_test_…9w2Q</Badge>}
            className="gap-3"
        >
            <CodeTabs
                loading={LOADING}
                loadingLines={REQUEST_EXAMPLES[0].code.split("\n").length}
                defaultTab="curl"
                icon={<Terminal />}
                size="sm"
                tabs={REQUEST_EXAMPLES.map((example) => ({ value: example.id, label: example.label, code: example.code, action: <CopyButton /> }))}
            />
        </InfoCard>
        <InfoCard title="Response" description="application/json · 212 ms" action={<Badge variant="secondary">201 Created</Badge>} className="gap-3">
            <CodeBlock loading={LOADING} loadingLines={RESPONSE_EXAMPLE.split("\n").length} title="payment" icon={<Terminal />} code={RESPONSE_EXAMPLE} size="sm" action={<CopyButton />} />
        </InfoCard>
    </div>
);

// [contain:inline-size]: the body never widens SidebarInset (upstream markup, no min-w-0) past the viewport. The body
// scrolls in its own pane: upstream's sticky header has no z-index, so positioned table parts would paint over it on a
// page scroll.
export const ApiReference = () => (
    <div className="h-[calc(100svh-4rem)] min-h-0 overflow-y-auto [contain:inline-size]">
        <div className="grid gap-8 px-8 pt-8 pb-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
            <Endpoint />
            <Examples />
        </div>
    </div>
);
