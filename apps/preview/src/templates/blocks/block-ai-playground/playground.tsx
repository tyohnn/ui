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

import { CardToolbar } from "@tyohnn/blocks/card-toolbar";
import { ChatNotice } from "@tyohnn/blocks/chat-notice";
import { ChatPrompt } from "@tyohnn/blocks/chat-prompt";
import { ChatReply } from "@tyohnn/blocks/chat-reply";
import { CompactSelect } from "@tyohnn/blocks/compact-select";
import { FieldPanel } from "@tyohnn/blocks/field-panel";
import { HintField } from "@tyohnn/blocks/hint-field";
import { NOTE } from "@tyohnn/blocks/lib/copy";
import { PendingText, pendingFrame } from "@tyohnn/blocks/lib/pending";
import { PromptInput } from "@tyohnn/blocks/prompt-input";
import { SliderField } from "@tyohnn/blocks/slider-field";
import { SwitchField } from "@tyohnn/blocks/switch-field";
import { UsageMeter } from "@tyohnn/blocks/usage-meter";
import { SegmentedControl } from "@tyohnn/blocks/segmented-control";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Card } from "@tyohnn/components/card";
import { Field, FieldLabel } from "@tyohnn/components/field";
import { MessageGroup } from "@tyohnn/components/message";
import { Separator } from "@tyohnn/components/separator";
import { Textarea } from "@tyohnn/components/textarea";
import { cn } from "@tyohnn/lib/utils";

import { LOADING } from "../../loading";
import { ATTACHMENTS, MODELS, PARAMETERS, REQUEST_EXAMPLE, SYSTEM_PROMPT, TOOLS } from "./data";

/**
 * The body of the AI playground: a conversation with an assistant model beside its run settings. Fixed data, no
 * time and no randomness. The screen is composed from blocks (registry/blocks): the card's toolbar, the notice,
 * the prompts and replies of the conversation, the message box, and the settings panel with its fields. Which
 * models, parameters and tools exist, the reply actions and the request example are the playground's own and stay
 * here; long assistant replies use the system's typeset axis through ChatReply.
 */

const MODEL_ITEMS = MODELS.map((model) => ({ value: model.id, label: model.name }));

const ModelSelect = ({ id }: { id?: string }) => (
    <CompactSelect id={id} label="Model" heading="Halcyon models" options={MODEL_ITEMS} defaultValue="aster-3-pro" className="min-w-44" />
);

const Toolbar = () => (
    <CardToolbar
        actions={(
            <>
                <SegmentedControl label="Mode" options={[{ value: "chat", label: "Chat" }, { value: "compare", label: "Compare" }]} defaultValue="chat" />
                <Button variant="ghost" size="icon-sm" aria-label="History"><History /></Button>
                <Button variant="outline" size="sm">
                    <Code data-icon="inline-start" />
                    Get code
                </Button>
                <Button size="sm">
                    <Share data-icon="inline-start" />
                    Share
                </Button>
            </>
        )}
    >
        <ModelSelect />
        <Badge variant="secondary">
            <Sparkles data-icon="inline-start" />
            Preview
        </Badge>
    </CardToolbar>
);

const REPLY_ACTIONS = [
    { label: "Copy", icon: <Copy /> },
    { label: "Regenerate", icon: <RefreshCw /> },
    { label: "Good response", icon: <ThumbsUp /> },
    { label: "Bad response", icon: <ThumbsDown /> },
];

// The request the reply ends with: a titled code panel at the reply's measure. One of a kind here (a mono title bar
// with a copy button over the code), so it is written in place with utilities.
const RequestExample = () => (
    <div className="max-w-[72ch] overflow-hidden rounded-[var(--radius-lg)] border border-border bg-muted text-foreground">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-background px-3 py-1.5 font-mono text-[length:var(--ui-text-sm)] leading-[var(--ui-line-height-sm)] text-muted-foreground [&_svg]:size-[14px]">
            <span className="flex items-center gap-1.5">
                <Braces />
                POST /v2/events
            </span>
            <Button variant="ghost" size="xs">
                <Copy data-icon="inline-start" />
                Copy
            </Button>
        </div>
        <pre className="m-0 overflow-x-auto px-4 py-3 font-mono text-[length:var(--ui-text-md)] leading-[1.6]"><code>{REQUEST_EXAMPLE}</code></pre>
    </div>
);

// While it waits the pane is the frame: a message is as tall as its text, so the messages carry none of their own.
const Conversation = () => (
    <div {...pendingFrame(LOADING)} className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
        <ChatNotice loading={LOADING} icon={<SlidersHorizontal />}>Session started 09:12 · system prompt applied · temperature 0.4 · top-p 0.9</ChatNotice>

        <MessageGroup>
            <ChatPrompt loading={LOADING} avatar="MO" meta="Mara · 09:14">
                Our invoice exports still run as a nightly CSV job. Draft a migration plan to the Events API — under 200 words,
                and include the request we should send when an invoice is finalised.
            </ChatPrompt>
        </MessageGroup>

        <ChatReply loading={LOADING} lines={6} avatar={<Bot />} name="Aster 3 Pro" extra={<RequestExample />} actions={REPLY_ACTIONS} meta="1.8 s · 412 tokens · $0.004">
            <p>Here is a four-step plan that keeps the CSV job as a fallback until the event stream is proven.</p>
            <ol>
                <li><strong>Subscribe</strong> the billing service to <code>invoice.finalized</code> and write each event to the export queue.</li>
                <li><strong>Backfill</strong> the last 30 days from the CSV archive so both paths hold the same rows.</li>
                <li><strong>Run both</strong> for one billing cycle and compare totals per account every morning.</li>
                <li><strong>Retire</strong> the nightly job once three consecutive reconciliations match.</li>
            </ol>
            <p>Send this when an invoice is finalised:</p>
        </ChatReply>

        <ChatPrompt loading={LOADING} lines={1} avatar="MO" meta="Mara · 09:16">Add a rollback step, and flag anything that changes for the finance team.</ChatPrompt>

        <ChatReply loading={LOADING} avatar={<Bot />} name="Aster 3 Pro" actions={REPLY_ACTIONS} meta="1.1 s · 168 tokens · $0.002">
            <p>
                <strong>Rollback:</strong> keep the CSV job deployed but paused. If a reconciliation fails twice, pause the
                subscriber, re-enable the job and replay the queue from the last matching checkpoint.
            </p>
            <p>
                <strong>For finance:</strong> exports arrive within a minute instead of at 02:00, and credit notes appear as their
                own <code>invoice.credited</code> rows rather than negative lines.
            </p>
        </ChatReply>
    </div>
);

const Composer = () => (
    <div className="px-4 pt-2 pb-4">
        <PromptInput
            defaultValue="Turn the plan into a checklist for the rollout ticket, one line per owner."
            files={ATTACHMENTS.map((file) => ({ name: file.name, detail: file.size, icon: <FileText />, action: { label: `Remove ${file.name}`, icon: <X /> } }))}
            tools={[
                { label: "Attach a file", icon: <Paperclip /> },
                { label: "Dictate", icon: <Mic /> },
            ]}
            status={(
                <>
                    <Zap />
                    1,284 / 32,000 tokens
                </>
            )}
            shortcut="⌘ ↵"
            send={{ icon: <ArrowUp /> }}
        />
    </div>
);

// The body is sized to fit the panel in every system (sera, luma and maia have the tallest controls): no per-slider
// hints or dividers, and the system prompt's Textarea takes whatever height is left instead of a fixed one. The body
// still scrolls on its own (the footer's usage bar stays put) if a system's controls ever outgrow it.
const SettingsPanel = () => (
    <FieldPanel
        className="w-80"
        title="Run settings"
        description="Applies to the next message"
        action={<Button variant="ghost" size="icon-sm" aria-label="Reset to defaults"><RefreshCw /></Button>}
        footer={(
            <>
                <UsageMeter value={68} label="Monthly tokens" />
                <Separator />
                <span className={cn(NOTE, "whitespace-nowrap")}>{LOADING ? <PendingText length={24} /> : "6.8M of 10M · resets Feb 1"}</span>
            </>
        )}
    >
        <HintField loading={LOADING} id="aip-model" label="Model" hint="200k · tools · vision">
            <ModelSelect id="aip-model" />
        </HintField>
        {PARAMETERS.map((parameter) => (
            <SliderField loading={LOADING} key={parameter.id} id={parameter.id} label={parameter.label} defaultValue={parameter.value} min={parameter.min} max={parameter.max} step={parameter.step} />
        ))}
        <SwitchField loading={LOADING} id="aip-stream" label="Stream tokens" description="Show the reply as it is written" defaultChecked />
        <SwitchField loading={LOADING} id="aip-json" label="JSON mode" description="Replies must parse as JSON" />
        <Field>
            <FieldLabel>Tools</FieldLabel>
            <div className="flex flex-wrap items-center gap-1.5">
                {TOOLS.map((tool) => <Badge key={tool} variant="outline"><Braces data-icon="inline-start" />{LOADING ? <PendingText length={tool.length} /> : tool}</Badge>)}
                <Button variant="ghost" size="xs">Add tool</Button>
            </div>
        </Field>
        <Field className="min-h-0 flex-1">
            <FieldLabel htmlFor="aip-system">System prompt</FieldLabel>
            <Textarea id="aip-system" className="min-h-16 flex-1 resize-none" defaultValue={LOADING ? undefined : SYSTEM_PROMPT} disabled={LOADING} />
        </Field>
    </FieldPanel>
);

// [contain:inline-size]: the row's content never widens SidebarInset (upstream markup, no min-w-0) past the viewport;
// a system with larger controls wraps the toolbar instead.
export const Playground = () => (
    <div className="flex h-[calc(100svh-4rem)] min-h-0 gap-4 p-4 pt-0 [contain:inline-size]">
        <Card className="min-w-0 flex-1 gap-0 py-0">
            <Toolbar />
            <Conversation />
            <Composer />
        </Card>
        <SettingsPanel />
    </div>
);
