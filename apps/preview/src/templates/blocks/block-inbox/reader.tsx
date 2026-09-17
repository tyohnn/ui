import {
    Archive,
    ChevronDown,
    Clock,
    Forward,
    MoreVertical,
    Paperclip,
    Reply,
    ReplyAll,
    Send,
    Star,
    Trash,
    Download,
    FileText,
    Image,
    Smile,
    ChevronLeft,
    ChevronRight,
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
import { Button } from "@tyohnn/components/button";
import { Separator } from "@tyohnn/components/separator";
import { Textarea } from "@tyohnn/components/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@tyohnn/components/tooltip";

import { EARLIER_THREAD, OPEN_MAIL } from "./data";

/**
 * The body of the inbox: the reading pane for the first mail in the list. A toolbar of mail actions, the message
 * header, the body, two attachments, the collapsed earlier messages of the thread and a reply composer. Fixed data;
 * layout utilities only, the small text bands and dividers read tokens in READER_STYLE.
 */

const ToolButton = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Tooltip>
        <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label={label} />}>{children}</TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
    </Tooltip>
);

const Toolbar = () => (
    <div className="ibx-toolbar flex flex-wrap items-center gap-1 px-4 py-2">
        <ToolButton label="Archive"><Archive /></ToolButton>
        <ToolButton label="Move to trash"><Trash /></ToolButton>
        <ToolButton label="Snooze"><Clock /></ToolButton>
        <Separator orientation="vertical" className="mx-1 data-vertical:h-4 data-vertical:self-auto" />
        <ToolButton label="Reply"><Reply /></ToolButton>
        <ToolButton label="Reply all"><ReplyAll /></ToolButton>
        <ToolButton label="Forward"><Forward /></ToolButton>
        <span className="ibx-meta ml-auto">1 of 128</span>
        <ToolButton label="Newer"><ChevronLeft /></ToolButton>
        <ToolButton label="Older"><ChevronRight /></ToolButton>
        <ToolButton label="More"><MoreVertical /></ToolButton>
    </div>
);

const EarlierThread = () => (
    <div className="ibx-thread flex flex-col">
        {EARLIER_THREAD.map((mail) => (
            <button key={mail.date} type="button" className="ibx-thread-row flex items-center gap-3 px-3 py-2 text-left">
                <Avatar size="sm">
                    <AvatarFallback>{mail.initials}</AvatarFallback>
                </Avatar>
                <span className="ibx-thread-name shrink-0">{mail.name}</span>
                <span className="ibx-meta min-w-0 flex-1 truncate">{mail.teaser}</span>
                <span className="ibx-meta shrink-0">{mail.date}</span>
                <ChevronDown className="ibx-thread-chevron shrink-0" />
            </button>
        ))}
    </div>
);

const MessageHead = () => (
    <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="ibx-subject min-w-0">{OPEN_MAIL.subject}</h1>
            <div className="flex items-center gap-1.5">
                {OPEN_MAIL.labels.map((label) => <Badge key={label} variant="secondary">{label}</Badge>)}
                <Button variant="ghost" size="icon-sm" aria-label="Star"><Star /></Button>
            </div>
        </div>
        <div className="flex items-start gap-3">
            <Avatar size="lg">
                <AvatarFallback>{OPEN_MAIL.from.initials}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="ibx-from">{OPEN_MAIL.from.name}</span>
                    <span className="ibx-meta">&lt;{OPEN_MAIL.from.email}&gt;</span>
                </div>
                <span className="ibx-meta">To: {OPEN_MAIL.to}</span>
                <span className="ibx-meta">Cc: {OPEN_MAIL.cc}</span>
            </div>
            <span className="ibx-meta shrink-0">{OPEN_MAIL.date}</span>
        </div>
    </div>
);

const Attachments = () => (
    <div className="flex flex-col gap-2">
        <span className="ibx-meta flex items-center gap-1.5">
            <Paperclip />
            2 attachments · 5.1 MB
        </span>
        <AttachmentGroup>
            {OPEN_MAIL.attachments.map((file, index) => (
                <Attachment key={file.name} size="sm">
                    <AttachmentMedia>{index === 0 ? <FileText /> : <Image />}</AttachmentMedia>
                    <AttachmentContent>
                        <AttachmentTitle>{file.name}</AttachmentTitle>
                        <AttachmentDescription>{file.meta}</AttachmentDescription>
                    </AttachmentContent>
                    <AttachmentActions>
                        <AttachmentAction aria-label={`Download ${file.name}`}><Download /></AttachmentAction>
                    </AttachmentActions>
                </Attachment>
            ))}
        </AttachmentGroup>
    </div>
);

const Composer = () => (
    <div className="ibx-composer flex flex-col gap-2 px-6 py-3">
        <div className="flex items-center gap-2">
            <Reply className="ibx-composer-icon" />
            <span className="ibx-meta min-w-0 truncate">Reply to Priya Das, Tomas Lind</span>
        </div>
        <Textarea
            aria-label="Reply"
            className="min-h-20"
            defaultValue={"Hi Priya,\n\nGreat news — Friday at 11 works for us. I'll fold both changes into the handoff file and send the updated build notes on Thursday."}
        />
        <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="icon-sm" aria-label="Attach a file"><Paperclip /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Insert emoji"><Smile /></Button>
            <span className="ibx-meta">Draft saved 09:41</span>
            <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm">Discard</Button>
                <Button size="sm">
                    <Send data-icon="inline-start" />
                    Send
                </Button>
            </div>
        </div>
    </div>
);

// flex-[1_1_0px]: the reader takes the inset's remaining height and scrolls inside; [contain:inline-size] keeps its
// content from widening SidebarInset (upstream markup, no min-w-0).
export const Reader = () => (
    <div className="flex min-h-0 flex-[1_1_0px] flex-col [contain:inline-size]">
        <Toolbar />
        <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="ibx-page flex flex-col gap-6 px-6 py-6">
                <EarlierThread />
                <MessageHead />
                <div className="typeset typeset-tool ibx-body">
                    {OPEN_MAIL.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 24)}>{paragraph}</p>)}
                </div>
                <Attachments />
            </div>
        </div>
        <Composer />
    </div>
);

/** The reader's stylesheet: dividers, the small text band, the subject and sender lines, the collapsed thread rows. Tokens only. */
export const READER_STYLE = `
[data-template="block-inbox"] .ibx-toolbar { border-bottom: 1px solid var(--border); }
[data-template="block-inbox"] .ibx-page { max-width: 64rem; }
[data-template="block-inbox"] .ibx-meta { font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); }
[data-template="block-inbox"] .ibx-meta svg { width: 14px; height: 14px; flex-shrink: 0; }
[data-template="block-inbox"] .ibx-subject { font-family: var(--font-heading); font-size: calc(var(--ui-text-lg) * 1.3); line-height: 1.3; font-weight: 600; color: var(--foreground); }
[data-template="block-inbox"] .ibx-from { font-size: var(--ui-text-md); font-weight: 600; color: var(--foreground); }
[data-template="block-inbox"] .ibx-thread { border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
[data-template="block-inbox"] .ibx-thread-row { width: 100%; font: inherit; color: inherit; background-color: transparent; }
[data-template="block-inbox"] .ibx-thread-row + .ibx-thread-row { border-top: 1px solid var(--border); }
[data-template="block-inbox"] .ibx-thread-name { font-size: var(--ui-text-md); font-weight: 500; color: var(--foreground); }
[data-template="block-inbox"] .ibx-thread-chevron { width: 16px; height: 16px; color: var(--muted-foreground); }
[data-template="block-inbox"] .ibx-body { max-width: 80ch; margin-inline: 0; font-size: var(--ui-text-md); }
[data-template="block-inbox"] .ibx-body p { white-space: pre-line; }
[data-template="block-inbox"] .ibx-composer { border-top: 1px solid var(--border); }
[data-template="block-inbox"] .ibx-composer > * { max-width: 61rem; }
[data-template="block-inbox"] .ibx-composer-icon { width: 16px; height: 16px; color: var(--muted-foreground); }
`;
