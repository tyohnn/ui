import { Fragment } from "react";

import {
    Archive,
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

import { AttachmentList } from "@tyohnn/blocks/attachment-list";
import { CollapsedThread } from "@tyohnn/blocks/collapsed-thread";
import { IconToolbar } from "@tyohnn/blocks/icon-toolbar";
import { ICON_LINE, NOTE } from "@tyohnn/blocks/lib/copy";
import { PendingText } from "@tyohnn/blocks/pending";
import { MailHeader } from "@tyohnn/blocks/mail-header";
import { Prose } from "@tyohnn/blocks/prose";
import { ReplyComposer } from "@tyohnn/blocks/reply-composer";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { cn } from "@tyohnn/lib/utils";

import { LOADING } from "../../loading";
import { EARLIER_THREAD, OPEN_MAIL } from "./data";

/**
 * The body of the inbox: the reading pane for the first mail in the list. A toolbar of mail actions, the collapsed
 * earlier messages of the thread, the message header, the body, two attachments and a reply composer. Fixed data.
 * The screen is composed from blocks (registry/blocks); which actions a mail has, the labels and the words are the
 * mail client's own and stay here.
 */

const MAIL_ACTIONS = [
    [
        { label: "Archive", icon: <Archive /> },
        { label: "Move to trash", icon: <Trash /> },
        { label: "Snooze", icon: <Clock /> },
    ],
    [
        { label: "Reply", icon: <Reply /> },
        { label: "Reply all", icon: <ReplyAll /> },
        { label: "Forward", icon: <Forward /> },
    ],
];

const PAGE_ACTIONS = [
    { label: "Newer", icon: <ChevronLeft /> },
    { label: "Older", icon: <ChevronRight /> },
    { label: "More", icon: <MoreVertical /> },
];

const FILE_ICONS = [<FileText key="document" />, <Image key="image" />];

const Attachments = () => (
    <div className="flex flex-col gap-2">
        <span className={cn(NOTE, ICON_LINE)}>
            <Paperclip />
            2 attachments · 5.1 MB
        </span>
        <AttachmentList
            files={OPEN_MAIL.attachments.map((file, index) => ({
                name: file.name,
                detail: file.meta,
                icon: FILE_ICONS[index],
                action: { label: `Download ${file.name}`, icon: <Download /> },
            }))}
        />
    </div>
);

// The message while it waits: a paragraph of bars. How long the mail is comes with the mail, so what follows it in
// the pane moves when it arrives.
const BODY_BARS = [76, 80, 72, 48];

const MailBody = () => (
    <Prose size="md" className="max-w-[80ch] [&_p]:whitespace-pre-line">
        {LOADING ? (
            <p>
                {BODY_BARS.map((length, index) => (
                    <Fragment key={length}>
                        {index > 0 && <br />}
                        <PendingText length={length} className="overflow-hidden whitespace-nowrap" />
                    </Fragment>
                ))}
            </p>
        ) : OPEN_MAIL.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 24)}>{paragraph}</p>)}
    </Prose>
);

// flex-[1_1_0px]: the reader takes the inset's remaining height and scrolls inside; [contain:inline-size] keeps its
// content from widening SidebarInset (upstream markup, no min-w-0). The page is 64rem wide at most, and the
// composer's rows end where the page's content does (64rem less the page's padding).
export const Reader = () => (
    <div className="flex min-h-0 flex-[1_1_0px] flex-col [contain:inline-size]">
        <IconToolbar groups={MAIL_ACTIONS} position="1 of 128" endActions={PAGE_ACTIONS} />
        <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex max-w-[64rem] flex-col gap-6 px-6 py-6">
                <CollapsedThread loading={LOADING} count={EARLIER_THREAD.length} messages={EARLIER_THREAD.map((mail) => ({ id: mail.date, ...mail }))} />
                <MailHeader
                    loading={LOADING}
                    loadingLines={2}
                    subject={OPEN_MAIL.subject}
                    aside={(
                        <>
                            {OPEN_MAIL.labels.map((label) => <Badge key={label} variant="secondary">{LOADING ? <PendingText length={label.length} /> : label}</Badge>)}
                            <Button variant="ghost" size="icon-sm" aria-label="Star"><Star /></Button>
                        </>
                    )}
                    name={OPEN_MAIL.from.name}
                    address={<>&lt;{OPEN_MAIL.from.email}&gt;</>}
                    initials={OPEN_MAIL.from.initials}
                    lines={[<>To: {OPEN_MAIL.to}</>, <>Cc: {OPEN_MAIL.cc}</>]}
                    date={OPEN_MAIL.date}
                />
                <MailBody />
                <Attachments />
            </div>
        </div>
        <ReplyComposer
            className="[&>*]:max-w-[61rem]"
            icon={<Reply />}
            heading="Reply to Priya Das, Tomas Lind"
            defaultValue={"Hi Priya,\n\nGreat news — Friday at 11 works for us. I'll fold both changes into the handoff file and send the updated build notes on Thursday."}
            tools={[
                { label: "Attach a file", icon: <Paperclip /> },
                { label: "Insert emoji", icon: <Smile /> },
            ]}
            status="Draft saved 09:41"
            actions={(
                <>
                    <Button variant="outline" size="sm">Discard</Button>
                    <Button size="sm">
                        <Send data-icon="inline-start" />
                        Send
                    </Button>
                </>
            )}
        />
    </div>
);
