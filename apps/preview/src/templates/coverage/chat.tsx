import { useEffect } from "react";

import { toast as sonnerToast } from "sonner";

import { Download, Info, Loader, TriangleAlert, X } from "@tyohnn/icons";

import {
    Attachment,
    AttachmentAction,
    AttachmentActions,
    AttachmentContent,
    AttachmentDescription,
    AttachmentGroup,
    AttachmentMedia,
    AttachmentTitle,
    AttachmentTrigger,
} from "@tyohnn/components/attachment";
import { Avatar, AvatarFallback } from "@tyohnn/components/avatar";
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@tyohnn/components/bubble";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "@tyohnn/components/message";
import {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerProvider,
    MessageScrollerViewport,
} from "@tyohnn/components/message-scroller";
import {
    Questionnaire,
    QuestionnaireActions,
    QuestionnaireChoice,
    QuestionnaireChoiceDescription,
    QuestionnaireChoices,
    QuestionnaireDescription,
    QuestionnaireError,
    QuestionnaireInput,
    QuestionnaireItem,
    QuestionnaireNext,
    QuestionnairePrevious,
    QuestionnaireProgress,
    QuestionnaireSkip,
    QuestionnaireSubmit,
    QuestionnaireTitle,
} from "@tyohnn/components/questionnaire";
import { Toaster as SonnerToaster } from "@tyohnn/components/sonner";
import { Toaster, toast } from "@tyohnn/components/toast";

import { type CoverageSection, Row } from "./frame";

const BUBBLE_VARIANTS = ["default", "secondary", "muted", "tinted", "outline", "ghost", "destructive"] as const;

const CONVERSATION = [
    { id: "m1", role: "user", text: "Can you summarise the release notes?" },
    { id: "m2", role: "assistant", text: "Version 2.4 adds offline sync, a new command palette and faster search." },
    { id: "m3", role: "user", text: "Anything that breaks existing setups?" },
    { id: "m4", role: "assistant", text: "Only the legacy export endpoint is removed; the new one takes the same parameters." },
    { id: "m5", role: "user", text: "Great, thanks." },
] as const;

const PLAN_ITEMS = [
    { name: "plan", required: true, choices: [{ value: "plus" }, { value: "pro" }, { value: "enterprise", disabled: true }] },
] as const;

const NOTE_ITEMS = [{ name: "notes" }] as const;

export const chatSections: CoverageSection[] = [
    {
        name: "bubble",
        components: ["bubble"],
        render: () => (
            <div className="grid w-[1000px] grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                    {BUBBLE_VARIANTS.map((variant, index) => (
                        <Bubble key={variant} variant={variant} align={index % 2 ? "end" : "start"}>
                            <BubbleContent>Bubble variant {variant}</BubbleContent>
                        </Bubble>
                    ))}
                </div>
                <div className="flex flex-col gap-8">
                    <BubbleGroup>
                        <Bubble align="end">
                            <BubbleContent>First message in a group</BubbleContent>
                        </Bubble>
                        <Bubble align="end">
                            <BubbleContent>Second message</BubbleContent>
                            <BubbleReactions>👍 2</BubbleReactions>
                        </Bubble>
                    </BubbleGroup>
                    <Bubble variant="secondary">
                        <BubbleContent>Reactions on top, start</BubbleContent>
                        <BubbleReactions side="top" align="start">🎉</BubbleReactions>
                    </Bubble>
                    <Bubble variant="outline">
                        <BubbleContent render={<a href="#coverage" />}>Bubble content rendered as a link</BubbleContent>
                    </Bubble>
                </div>
            </div>
        ),
    },
    {
        name: "message",
        components: ["message"],
        render: () => (
            <div className="grid w-[1000px] grid-cols-2 gap-8">
                <MessageGroup>
                    <Message>
                        <MessageAvatar><Avatar size="sm"><AvatarFallback>AI</AvatarFallback></Avatar></MessageAvatar>
                        <MessageContent>
                            <MessageHeader>Assistant · 9:41</MessageHeader>
                            <Bubble variant="ghost"><BubbleContent>Here is the summary you asked for.</BubbleContent></Bubble>
                            <MessageFooter>Edited</MessageFooter>
                        </MessageContent>
                    </Message>
                    <Message align="end">
                        <MessageAvatar><Avatar size="sm"><AvatarFallback>ME</AvatarFallback></Avatar></MessageAvatar>
                        <MessageContent>
                            <Bubble><BubbleContent>Thanks, looks good.</BubbleContent></Bubble>
                            <MessageFooter>Read</MessageFooter>
                        </MessageContent>
                    </Message>
                </MessageGroup>
                <Message>
                    <MessageContent>
                        <MessageHeader>Without avatar</MessageHeader>
                        <p className="text-sm">Plain message content without a bubble.</p>
                    </MessageContent>
                </Message>
            </div>
        ),
    },
    {
        name: "message-scroller",
        components: ["message-scroller"],
        render: () => (
            <div className="h-80 w-[520px] rounded-lg border">
                <MessageScrollerProvider>
                    <MessageScroller className="h-full">
                        <MessageScrollerViewport>
                            <MessageScrollerContent>
                                {CONVERSATION.map((message) => (
                                    <MessageScrollerItem key={message.id}>
                                        <Message align={message.role === "user" ? "end" : "start"}>
                                            <MessageContent>
                                                <Bubble variant={message.role === "user" ? "default" : "ghost"} align={message.role === "user" ? "end" : "start"}>
                                                    <BubbleContent>{message.text}</BubbleContent>
                                                </Bubble>
                                            </MessageContent>
                                        </Message>
                                    </MessageScrollerItem>
                                ))}
                            </MessageScrollerContent>
                        </MessageScrollerViewport>
                        <MessageScrollerButton />
                    </MessageScroller>
                </MessageScrollerProvider>
            </div>
        ),
    },
    {
        name: "attachment",
        components: ["attachment"],
        render: () => (
            <>
                <Row label="Sizes · states" className="grid w-[1000px] grid-cols-3 gap-3">
                    {(["default", "sm", "xs"] as const).map((size) => (
                        <Attachment key={size} size={size}>
                            <AttachmentMedia><Download /></AttachmentMedia>
                            <AttachmentContent>
                                <AttachmentTitle>report-{size}.pdf</AttachmentTitle>
                                <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
                            </AttachmentContent>
                            <AttachmentActions>
                                <AttachmentAction aria-label="Remove"><X /></AttachmentAction>
                            </AttachmentActions>
                        </Attachment>
                    ))}
                    {(["idle", "uploading", "processing", "error"] as const).map((state) => (
                        <Attachment key={state} state={state}>
                            <AttachmentMedia>{state === "error" ? <TriangleAlert /> : state === "idle" ? <Info /> : <Loader />}</AttachmentMedia>
                            <AttachmentContent>
                                <AttachmentTitle>{state}.csv</AttachmentTitle>
                                <AttachmentDescription>State {state}</AttachmentDescription>
                            </AttachmentContent>
                        </Attachment>
                    ))}
                </Row>
                <Row label="Group · vertical · image · trigger">
                    <AttachmentGroup>
                        {["one.png", "two.png"].map((file) => (
                            <Attachment key={file} orientation="vertical">
                                <AttachmentMedia variant="image"><div className="size-full bg-muted" /></AttachmentMedia>
                                <AttachmentContent>
                                    <AttachmentTitle>{file}</AttachmentTitle>
                                    <AttachmentDescription>Image</AttachmentDescription>
                                </AttachmentContent>
                                <AttachmentActions>
                                    <AttachmentAction aria-label={`Remove ${file}`}><X /></AttachmentAction>
                                </AttachmentActions>
                            </Attachment>
                        ))}
                    </AttachmentGroup>
                    <Attachment>
                        <AttachmentTrigger>
                            <AttachmentMedia><Download /></AttachmentMedia>
                            <AttachmentContent>
                                <AttachmentTitle>Open attachment</AttachmentTitle>
                            </AttachmentContent>
                        </AttachmentTrigger>
                    </Attachment>
                </Row>
            </>
        ),
    },
    {
        name: "questionnaire",
        components: ["questionnaire"],
        render: () => (
            <div className="grid w-[1000px] grid-cols-2 items-start gap-8">
                <Questionnaire defaultItem="plan" items={PLAN_ITEMS} shortcuts="letters" onSubmit={() => undefined}>
                    <QuestionnaireProgress />
                    <QuestionnaireItem name="plan" required>
                        <QuestionnaireTitle>Choose a plan</QuestionnaireTitle>
                        <QuestionnaireDescription>Enterprise is not available on your account.</QuestionnaireDescription>
                        <QuestionnaireChoices>
                            <QuestionnaireChoice value="plus">
                                <span className="font-medium">Plus</span>
                                <QuestionnaireChoiceDescription>For individuals and small teams</QuestionnaireChoiceDescription>
                            </QuestionnaireChoice>
                            <QuestionnaireChoice value="pro">
                                <span className="font-medium">Pro</span>
                                <QuestionnaireChoiceDescription>For growing businesses</QuestionnaireChoiceDescription>
                            </QuestionnaireChoice>
                            <QuestionnaireChoice value="enterprise" disabled>
                                <span className="font-medium">Enterprise</span>
                                <QuestionnaireChoiceDescription>For large teams</QuestionnaireChoiceDescription>
                            </QuestionnaireChoice>
                        </QuestionnaireChoices>
                        <QuestionnaireError />
                    </QuestionnaireItem>
                    <QuestionnaireActions>
                        <QuestionnairePrevious />
                        <QuestionnaireSkip />
                        <QuestionnaireNext />
                        <QuestionnaireSubmit />
                    </QuestionnaireActions>
                </Questionnaire>
                <Questionnaire defaultItem="notes" items={NOTE_ITEMS} onSubmit={() => undefined}>
                    <QuestionnaireItem name="notes">
                        <QuestionnaireTitle>Anything else?</QuestionnaireTitle>
                        <QuestionnaireInput placeholder="Add a note" />
                    </QuestionnaireItem>
                    <QuestionnaireActions>
                        <QuestionnairePrevious />
                        <QuestionnaireSubmit />
                    </QuestionnaireActions>
                </Questionnaire>
            </div>
        ),
    },
    {
        name: "toast",
        components: ["toast"],
        portals: ['[data-slot="toast-viewport"]'],
        render: (open) => (
            <Toaster>
                <ToastOpener open={open} />
                <span className="text-sm">Base UI toasts open in the viewport.</span>
            </Toaster>
        ),
    },
    {
        name: "sonner",
        components: ["sonner"],
        portals: ["[data-sonner-toaster]"],
        render: (open) => (
            <>
                <SonnerToaster />
                <SonnerOpener open={open} />
                <span className="text-sm">Sonner toasts open in the corner.</span>
            </>
        ),
    },
];

/** Adds the toasts once, with fixed ids and no timeout, so a remount (StrictMode) adds nothing new. */
function ToastOpener({ open }: { open: boolean })
{
    useEffect(() =>
    {
        if (!open) return;

        toast.add({ id: "coverage-toast-plain", title: "Event created", description: "Sunday, December 3 at 9:00 AM", timeout: 0 });
        toast.add({ id: "coverage-toast-success", type: "success", title: "Saved", description: "Your changes are live.", timeout: 0 });
        toast.add({ id: "coverage-toast-action", type: "error", title: "Upload failed", description: "Try again.", timeout: 0, actionProps: { children: "Retry" } });
    }, [open]);

    return null;
}

function SonnerOpener({ open }: { open: boolean })
{
    useEffect(() =>
    {
        if (!open) return;

        sonnerToast("Event has been created", { id: "coverage-sonner-plain", description: "Sunday, December 3 at 9:00 AM", duration: Infinity });
        sonnerToast.success("Profile saved", { id: "coverage-sonner-success", duration: Infinity });
        sonnerToast.error("Upload failed", { id: "coverage-sonner-error", duration: Infinity, action: { label: "Retry", onClick: () => undefined } });
    }, [open]);

    return null;
}
