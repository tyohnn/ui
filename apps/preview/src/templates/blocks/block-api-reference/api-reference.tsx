import { ArrowRight, Braces, Check, Copy, Key, Lock, Send, Terminal } from "@tyohnn/icons";

import { Alert, AlertDescription, AlertTitle } from "@tyohnn/components/alert";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@tyohnn/components/card";
import { Separator } from "@tyohnn/components/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tyohnn/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tyohnn/components/tabs";

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
 * and request/response examples beside them. Fixed data, no time and no randomness. Layout utilities only; code
 * panes, mono text and the status list read tokens in API_REFERENCE_STYLE.
 */

const ParameterTable = ({ title, description, parameters }: { title: string; description: string; parameters: Parameter[] }) => (
    <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
            <h2 className="apr-h2">{title}</h2>
            <p className="apr-muted">{description}</p>
        </div>
        <div className="apr-table">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead>Description</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {parameters.map((parameter) => (
                        <TableRow key={parameter.name}>
                            <TableCell><code className="apr-name">{parameter.name}</code></TableCell>
                            <TableCell><code className="apr-type">{parameter.type}</code></TableCell>
                            <TableCell>
                                {parameter.required ? <Badge>Required</Badge> : <Badge variant="outline">Optional</Badge>}
                            </TableCell>
                            <TableCell className="apr-wrap">
                                <span className="flex flex-col gap-1">
                                    {parameter.description}
                                    {parameter.values ? <span className="apr-values">One of {parameter.values}</span> : null}
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    </section>
);

const CodePane = ({ code, label }: { code: string; label: string }) => (
    <div className="apr-code">
        <div className="apr-code-bar flex items-center justify-between gap-2 py-1 pr-1 pl-3">
            <span className="apr-code-title flex min-w-0 items-center gap-1.5"><Terminal /><span className="truncate">{label}</span></span>
            <Button variant="ghost" size="xs"><Copy data-icon="inline-start" />Copy</Button>
        </div>
        <pre className="px-4 py-3"><code>{code}</code></pre>
    </div>
);

const Endpoint = () => (
    <div className="flex min-w-0 flex-col gap-8">
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
                <Badge>{ENDPOINT.method}</Badge>
                <code className="apr-path min-w-0">{ENDPOINT.path}</code>
                <Button variant="ghost" size="icon-xs" aria-label="Copy path"><Copy /></Button>
            </div>
            <h1 className="apr-h1">Create a payment</h1>
            <div className="typeset typeset-tool apr-prose">
                <p>
                    Charges a saved payment method or a one-time token and moves the funds to the connected account. A payment starts as{" "}
                    <code>processing</code> and settles to <code>succeeded</code> or <code>failed</code>; each change sends a{" "}
                    <code>payment.updated</code> event.
                </p>
                <p>
                    With <code>capture=manual</code> the amount is only authorised. Capture it with the capture endpoint within 7 days or the
                    authorisation is released.
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button size="sm"><Send data-icon="inline-start" />Try it</Button>
                <Button variant="outline" size="sm"><Braces data-icon="inline-start" />OpenAPI spec</Button>
                <span className="apr-muted flex items-center gap-1.5"><Check />Idempotent with a key · Rate limit 100 writes/s</span>
            </div>
        </div>

        <Alert>
            <Lock />
            <AlertTitle>Requires a secret key with payments:write</AlertTitle>
            <AlertDescription>
                Send the key as HTTP Basic auth or a Bearer token. Publishable keys and restricted keys without the scope return 401. Test keys
                start with sk_test_ and never move real money.
            </AlertDescription>
        </Alert>

        <ParameterTable title="Path parameters" description="Part of the URL." parameters={PATH_PARAMETERS} />
        <ParameterTable title="Query parameters" description="Appended to the URL. They change the response, not the payment." parameters={QUERY_PARAMETERS} />
        <ParameterTable title="Headers" description="Optional headers this endpoint reads." parameters={HEADERS} />
        <ParameterTable title="Body parameters" description="Form-encoded or JSON. Unknown parameters return 400." parameters={BODY_PARAMETERS} />

        <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <h2 className="apr-h2">Status codes</h2>
                <p className="apr-muted">Every error returns a JSON body with type, code, message and request_id.</p>
            </div>
            <ul className="apr-status flex flex-col">
                {STATUS_CODES.map((status) => (
                    <li key={status.code} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3">
                        <Badge variant={status.tone === "success" ? "secondary" : "outline"}>{status.code}</Badge>
                        <span className="apr-status-label">{status.label}</span>
                        <span className="apr-muted min-w-0 flex-1">{status.description}</span>
                    </li>
                ))}
            </ul>
        </section>

        <Separator />
        <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="apr-muted">Last changed in 2026-01-01: capture accepts manual.</span>
            <Button variant="ghost" size="sm">Retrieve a payment<ArrowRight data-icon="inline-end" /></Button>
        </div>
    </div>
);

const Examples = () => (
    <div className="apr-examples flex min-w-0 flex-col gap-4">
        <Card size="sm" className="gap-3">
            <CardHeader>
                <CardTitle>Request</CardTitle>
                <CardDescription className="apr-host">{ENDPOINT.host}</CardDescription>
                <CardAction>
                    <Badge variant="outline"><Key data-icon="inline-start" />sk_test_…9w2Q</Badge>
                </CardAction>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="curl">
                    <TabsList>
                        {REQUEST_EXAMPLES.map((example) => <TabsTrigger key={example.id} value={example.id}>{example.label}</TabsTrigger>)}
                    </TabsList>
                    {REQUEST_EXAMPLES.map((example) => (
                        <TabsContent key={example.id} value={example.id}>
                            <CodePane code={example.code} label={example.label} />
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
        <Card size="sm" className="gap-3">
            <CardHeader>
                <CardTitle>Response</CardTitle>
                <CardDescription>application/json · 212 ms</CardDescription>
                <CardAction>
                    <Badge variant="secondary">201 Created</Badge>
                </CardAction>
            </CardHeader>
            <CardContent>
                <CodePane code={RESPONSE_EXAMPLE} label="payment" />
            </CardContent>
        </Card>
    </div>
);

// [contain:inline-size]: the body never widens SidebarInset (upstream markup, no min-w-0) past the viewport. The body
// scrolls in its own pane: upstream's sticky header has no z-index, so positioned table parts would paint over it on a
// page scroll. The examples column stays in view beside the parameters.
export const ApiReference = () => (
    <div className="h-[calc(100svh-4rem)] min-h-0 overflow-y-auto [contain:inline-size]">
        <div className="grid gap-8 px-8 pt-8 pb-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
            <Endpoint />
            <Examples />
        </div>
    </div>
);

/** The template's own stylesheet, tokens only: headings, muted text, mono names, table frame, code panes and the status list. */
export const API_REFERENCE_STYLE = `
[data-template="block-api-reference"] .apr-h1 { margin: 0; font-family: var(--font-heading, inherit); font-size: calc(var(--ui-text-lg) * 1.75); line-height: 1.2; font-weight: 600; }
[data-template="block-api-reference"] .apr-h2 { margin: 0; font-size: var(--ui-text-lg); line-height: var(--ui-line-height-lg); font-weight: 600; }
[data-template="block-api-reference"] .apr-muted { margin: 0; font-size: var(--ui-text-md); line-height: var(--ui-line-height-md); color: var(--muted-foreground); }
[data-template="block-api-reference"] .apr-muted svg { width: 14px; height: 14px; flex-shrink: 0; }
[data-template="block-api-reference"] .apr-prose { max-width: none; margin-inline: 0; }
[data-template="block-api-reference"] .apr-prose > :first-child { margin-block-start: 0; }
[data-template="block-api-reference"] .apr-path { font-family: var(--font-mono); font-size: var(--ui-text-md); overflow-wrap: anywhere; }
[data-template="block-api-reference"] .apr-host { font-family: var(--font-mono); }
[data-template="block-api-reference"] .apr-table { overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-lg); }
[data-template="block-api-reference"] .apr-name { font-family: var(--font-mono); font-size: var(--ui-text-sm); font-weight: 600; white-space: nowrap; }
[data-template="block-api-reference"] .apr-type { font-family: var(--font-mono); font-size: var(--ui-text-sm); color: var(--muted-foreground); white-space: nowrap; }
[data-template="block-api-reference"] .apr-wrap { white-space: normal; }
[data-template="block-api-reference"] .apr-values { font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); }
[data-template="block-api-reference"] .apr-status { margin: 0; padding: 0; list-style: none; border: 1px solid var(--border); border-radius: var(--radius-lg); }
[data-template="block-api-reference"] .apr-status > li + li { border-top: 1px solid var(--border); }
[data-template="block-api-reference"] .apr-status-label { font-size: var(--ui-text-md); line-height: var(--ui-line-height-md); font-weight: 500; white-space: nowrap; }
[data-template="block-api-reference"] .apr-examples { position: sticky; top: 2rem; align-self: start; }
[data-template="block-api-reference"] .apr-code {
    overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-lg);
    background-color: var(--muted); color: var(--foreground);
}
[data-template="block-api-reference"] .apr-code-bar { border-bottom: 1px solid var(--border); background-color: var(--background); }
[data-template="block-api-reference"] .apr-code-title { font-family: var(--font-mono); font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); }
[data-template="block-api-reference"] .apr-code-bar svg { width: 14px; height: 14px; flex-shrink: 0; }
[data-template="block-api-reference"] .apr-code pre { margin: 0; overflow-x: auto; font-family: var(--font-mono); font-size: var(--ui-text-sm); line-height: 1.6; }
`;
