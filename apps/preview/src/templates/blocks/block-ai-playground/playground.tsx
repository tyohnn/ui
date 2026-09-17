import {
    ArrowUp,
    Bot,
    Braces,
    Code,
    Copy,
    FileText,
    History,
    Mic,
    Paperclip,
    RefreshCw,
    Share,
    SlidersHorizontal,
    Sparkles,
    ThumbsDown,
    ThumbsUp,
    X,
    Zap,
} from "@tyohnn/icons";

import {
    Attachment,
    AttachmentAction,
    AttachmentActions,
    AttachmentContent,
    AttachmentDescription,
    AttachmentGroup,
    AttachmentMedia,
    AttachmentTitle,
} from "@tyohnn/components/attachment";
import { Avatar, AvatarFallback } from "@tyohnn/components/avatar";
import { Badge } from "@tyohnn/components/badge";
import { Bubble, BubbleContent } from "@tyohnn/components/bubble";
import { Button } from "@tyohnn/components/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@tyohnn/components/card";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@tyohnn/components/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea } from "@tyohnn/components/input-group";
import { Kbd } from "@tyohnn/components/kbd";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "@tyohnn/components/message";
import { Progress, ProgressLabel, ProgressValue } from "@tyohnn/components/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@tyohnn/components/select";
import { Separator } from "@tyohnn/components/separator";
import { Slider } from "@tyohnn/components/slider";
import { Switch } from "@tyohnn/components/switch";
import { Textarea } from "@tyohnn/components/textarea";
import { ToggleGroup, ToggleGroupItem } from "@tyohnn/components/toggle-group";

import { ATTACHMENTS, MODELS, PARAMETERS, REQUEST_EXAMPLE, SYSTEM_PROMPT, TOOLS } from "./data";

/**
 * The body of the AI playground: a conversation with an assistant model beside its run settings. Fixed data, no
 * time and no randomness. Layout utilities only; the code block's colours and the small text bands read tokens in
 * PLAYGROUND_STYLE, and long assistant replies use the system's typeset axis (`typeset typeset-tool`).
 */

const MODEL_ITEMS = MODELS.map((model) => ({ value: model.id, label: model.name }));

const ModelSelect = ({ id }: { id?: string }) => (
    <Select items={MODEL_ITEMS} defaultValue="aster-3-pro">
        <SelectTrigger id={id} size="sm" className="min-w-44">
            <SelectValue />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                <SelectLabel>Halcyon models</SelectLabel>
                {MODELS.map((model) => <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>)}
            </SelectGroup>
        </SelectContent>
    </Select>
);

const Toolbar = () => (
    <div className="aip-toolbar flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
            <ModelSelect />
            <Badge variant="secondary">
                <Sparkles data-icon="inline-start" />
                Preview
            </Badge>
        </div>
        <div className="flex items-center gap-1.5">
            <ToggleGroup variant="outline" size="sm" spacing={0} defaultValue={["chat"]} aria-label="Mode">
                <ToggleGroupItem value="chat">Chat</ToggleGroupItem>
                <ToggleGroupItem value="compare">Compare</ToggleGroupItem>
            </ToggleGroup>
            <Button variant="ghost" size="icon-sm" aria-label="History"><History /></Button>
            <Button variant="outline" size="sm">
                <Code data-icon="inline-start" />
                Get code
            </Button>
            <Button size="sm">
                <Share data-icon="inline-start" />
                Share
            </Button>
        </div>
    </div>
);

const AssistantAvatar = () => (
    <MessageAvatar>
        <Avatar size="sm">
            <AvatarFallback><Bot /></AvatarFallback>
        </Avatar>
    </MessageAvatar>
);

const UserAvatar = () => (
    <MessageAvatar>
        <Avatar size="sm">
            <AvatarFallback>MO</AvatarFallback>
        </Avatar>
    </MessageAvatar>
);

const ReplyActions = ({ meta }: { meta: string }) => (
    <MessageFooter className="flex items-center gap-1">
        <Button variant="ghost" size="icon-xs" aria-label="Copy"><Copy /></Button>
        <Button variant="ghost" size="icon-xs" aria-label="Regenerate"><RefreshCw /></Button>
        <Button variant="ghost" size="icon-xs" aria-label="Good response"><ThumbsUp /></Button>
        <Button variant="ghost" size="icon-xs" aria-label="Bad response"><ThumbsDown /></Button>
        <span className="aip-meta ml-2">{meta}</span>
    </MessageFooter>
);

const Conversation = () => (
    <div className="aip-scroll flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
        <div className="aip-system flex items-center gap-2 px-3 py-2">
            <SlidersHorizontal />
            <span>Session started 09:12 · system prompt applied · temperature 0.4 · top-p 0.9</span>
        </div>

        <MessageGroup>
            <Message align="end">
                <UserAvatar />
                <MessageContent>
                    <Bubble align="end">
                        <BubbleContent>
                            Our invoice exports still run as a nightly CSV job. Draft a migration plan to the Events API — under 200 words,
                            and include the request we should send when an invoice is finalised.
                        </BubbleContent>
                    </Bubble>
                    <MessageFooter>Mara · 09:14</MessageFooter>
                </MessageContent>
            </Message>
        </MessageGroup>

        <Message>
            <AssistantAvatar />
            <MessageContent className="min-w-0">
                <MessageHeader>Aster 3 Pro</MessageHeader>
                <div className="typeset typeset-tool aip-reply">
                    <p>Here is a four-step plan that keeps the CSV job as a fallback until the event stream is proven.</p>
                    <ol>
                        <li><strong>Subscribe</strong> the billing service to <code>invoice.finalized</code> and write each event to the export queue.</li>
                        <li><strong>Backfill</strong> the last 30 days from the CSV archive so both paths hold the same rows.</li>
                        <li><strong>Run both</strong> for one billing cycle and compare totals per account every morning.</li>
                        <li><strong>Retire</strong> the nightly job once three consecutive reconciliations match.</li>
                    </ol>
                    <p>Send this when an invoice is finalised:</p>
                </div>
                <div className="aip-code">
                    <div className="aip-code-bar flex items-center justify-between gap-2 px-3 py-1.5">
                        <span className="flex items-center gap-1.5">
                            <Braces />
                            POST /v2/events
                        </span>
                        <Button variant="ghost" size="xs">
                            <Copy data-icon="inline-start" />
                            Copy
                        </Button>
                    </div>
                    <pre className="px-4 py-3"><code>{REQUEST_EXAMPLE}</code></pre>
                </div>
                <ReplyActions meta="1.8 s · 412 tokens · $0.004" />
            </MessageContent>
        </Message>

        <Message align="end">
            <UserAvatar />
            <MessageContent>
                <Bubble align="end">
                    <BubbleContent>Add a rollback step, and flag anything that changes for the finance team.</BubbleContent>
                </Bubble>
                <MessageFooter>Mara · 09:16</MessageFooter>
            </MessageContent>
        </Message>

        <Message>
            <AssistantAvatar />
            <MessageContent className="min-w-0">
                <MessageHeader>Aster 3 Pro</MessageHeader>
                <div className="typeset typeset-tool aip-reply">
                    <p>
                        <strong>Rollback:</strong> keep the CSV job deployed but paused. If a reconciliation fails twice, pause the
                        subscriber, re-enable the job and replay the queue from the last matching checkpoint.
                    </p>
                    <p>
                        <strong>For finance:</strong> exports arrive within a minute instead of at 02:00, and credit notes appear as their
                        own <code>invoice.credited</code> rows rather than negative lines.
                    </p>
                </div>
                <ReplyActions meta="1.1 s · 168 tokens · $0.002" />
            </MessageContent>
        </Message>
    </div>
);

const Composer = () => (
    <div className="px-4 pt-2 pb-4">
        <InputGroup>
            <InputGroupAddon align="block-start">
                <AttachmentGroup>
                    {ATTACHMENTS.map((file) => (
                        <Attachment key={file.name} size="xs">
                            <AttachmentMedia><FileText /></AttachmentMedia>
                            <AttachmentContent>
                                <AttachmentTitle>{file.name}</AttachmentTitle>
                                <AttachmentDescription>{file.size}</AttachmentDescription>
                            </AttachmentContent>
                            <AttachmentActions>
                                <AttachmentAction aria-label={`Remove ${file.name}`}><X /></AttachmentAction>
                            </AttachmentActions>
                        </Attachment>
                    ))}
                </AttachmentGroup>
            </InputGroupAddon>
            <InputGroupTextarea
                aria-label="Message"
                className="min-h-16"
                defaultValue="Turn the plan into a checklist for the rollout ticket, one line per owner."
            />
            <InputGroupAddon align="block-end">
                <InputGroupButton size="icon-xs" variant="ghost" aria-label="Attach a file"><Paperclip /></InputGroupButton>
                <InputGroupButton size="icon-xs" variant="ghost" aria-label="Dictate"><Mic /></InputGroupButton>
                <InputGroupText className="ml-1">
                    <Zap />
                    1,284 / 32,000 tokens
                </InputGroupText>
                <span className="ml-auto flex items-center gap-2">
                    <InputGroupText><Kbd>⌘ ↵</Kbd></InputGroupText>
                    <InputGroupButton size="icon-xs" variant="default" aria-label="Send"><ArrowUp /></InputGroupButton>
                </span>
            </InputGroupAddon>
        </InputGroup>
    </div>
);

const ParameterSlider = ({ id, label, value, min, max, step, hint }: (typeof PARAMETERS)[number]) => (
    <Field>
        <div className="flex items-center justify-between gap-2">
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <span className="aip-value">{value}</span>
        </div>
        <Slider id={id} defaultValue={[value]} min={min} max={max} step={step} aria-label={label} />
        <FieldDescription>{hint}</FieldDescription>
    </Field>
);

const SettingsPanel = () => (
    <Card size="sm" className="aip-settings min-h-0 w-80 shrink-0">
        <CardHeader>
            <CardTitle>Run settings</CardTitle>
            <CardDescription>Applies to the next message</CardDescription>
            <CardAction>
                <Button variant="ghost" size="icon-sm" aria-label="Reset to defaults"><RefreshCw /></Button>
            </CardAction>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto">
            <FieldGroup className="gap-5">
                <Field>
                    <FieldLabel htmlFor="aip-model">Model</FieldLabel>
                    <ModelSelect id="aip-model" />
                    <FieldDescription>200k context · tools · vision</FieldDescription>
                </Field>
                {PARAMETERS.map((parameter) => <ParameterSlider key={parameter.id} {...parameter} />)}
                <FieldSeparator />
                <Field orientation="horizontal">
                    <FieldContent>
                        <FieldLabel htmlFor="aip-stream">Stream tokens</FieldLabel>
                        <FieldDescription>Show the reply as it is written</FieldDescription>
                    </FieldContent>
                    <Switch id="aip-stream" defaultChecked />
                </Field>
                <Field orientation="horizontal">
                    <FieldContent>
                        <FieldLabel htmlFor="aip-json">JSON mode</FieldLabel>
                        <FieldDescription>Replies must parse as JSON</FieldDescription>
                    </FieldContent>
                    <Switch id="aip-json" />
                </Field>
                <Field>
                    <FieldLabel>Tools</FieldLabel>
                    <div className="flex flex-wrap items-center gap-1.5">
                        {TOOLS.map((tool) => <Badge key={tool} variant="outline"><Braces data-icon="inline-start" />{tool}</Badge>)}
                        <Button variant="ghost" size="xs">Add tool</Button>
                    </div>
                    <FieldDescription>Called when the model decides it needs them</FieldDescription>
                </Field>
                <FieldSeparator />
                <Field>
                    <FieldLabel htmlFor="aip-system">System prompt</FieldLabel>
                    <Textarea id="aip-system" className="min-h-24" defaultValue={SYSTEM_PROMPT} />
                </Field>
            </FieldGroup>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-2">
            <Progress value={68}>
                <ProgressLabel>Monthly tokens</ProgressLabel>
                <ProgressValue className="ml-auto" />
            </Progress>
            <Separator />
            <span className="aip-meta">6.8M of 10M · resets Feb 1</span>
        </CardFooter>
    </Card>
);

// [contain:inline-size]: the row's content never widens SidebarInset (upstream markup, no min-w-0) past the viewport;
// a system with larger controls wraps the toolbar instead.
export const Playground = () => (
    <div className="flex h-[calc(100svh-4rem)] min-h-0 gap-4 p-4 pt-0 [contain:inline-size]">
        <Card className="aip-chat min-w-0 flex-1 gap-0 py-0">
            <Toolbar />
            <Conversation />
            <Composer />
        </Card>
        <SettingsPanel />
    </div>
);

/**
 * The template's own stylesheet. Values are system tokens: the toolbar and panel dividers, the small meta text
 * band, the system-prompt note and the code block (mono stack, muted surface).
 */
export const PLAYGROUND_STYLE = `
[data-template="block-ai-playground"] .aip-toolbar { border-bottom: 1px solid var(--border); }
[data-template="block-ai-playground"] .aip-meta { font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); white-space: nowrap; }
[data-template="block-ai-playground"] .aip-meta svg { width: 14px; height: 14px; flex-shrink: 0; }
[data-template="block-ai-playground"] .aip-value { font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
[data-template="block-ai-playground"] .aip-system {
    align-self: center; border: 1px dashed var(--border); border-radius: var(--radius-lg);
    font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground);
}
[data-template="block-ai-playground"] .aip-system svg { width: 14px; height: 14px; }
/* A chat reply reads at the UI's large text step, not the tool page's; typeset's centred measure is left-aligned here. */
[data-template="block-ai-playground"] .aip-reply { max-width: 72ch; margin-inline: 0; font-size: var(--ui-text-lg); }
[data-template="block-ai-playground"] .aip-code {
    max-width: 72ch; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-lg);
    background-color: var(--muted); color: var(--foreground);
}
[data-template="block-ai-playground"] .aip-code-bar {
    border-bottom: 1px solid var(--border); background-color: var(--background);
    font-family: var(--font-mono); font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground);
}
[data-template="block-ai-playground"] .aip-code-bar svg { width: 14px; height: 14px; }
[data-template="block-ai-playground"] .aip-code pre { margin: 0; overflow-x: auto; font-family: var(--font-mono); font-size: var(--ui-text-md); line-height: 1.6; }
`;
