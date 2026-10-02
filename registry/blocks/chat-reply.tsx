import type { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@tyohnn/components/avatar";
import { Button } from "@tyohnn/components/button";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader } from "@tyohnn/components/message";
import { NOTE } from "@tyohnn/blocks/lib/copy";
import { Prose } from "@tyohnn/blocks/prose";
import { cn } from "@tyohnn/lib/utils";

export type ChatReplyAction = { label: string; icon: ReactNode; onClick?: () => void };

/**
 * What the assistant answered: its avatar and name, the reply as written text (paragraphs, lists, inline code)
 * at a reading measure, whatever it produced after the text (`extra`: a code block, a file), and a row of small
 * actions on the reply (copy, regenerate, rate) ending in one line about the run. The message it answers is a
 * ChatPrompt.
 */
export const ChatReply = ({
    avatar,
    name,
    children,
    extra,
    actions,
    meta,
}: {
    /** Initials or an icon */
    avatar: ReactNode;
    name: ReactNode;
    /** The reply's text */
    children: ReactNode;
    extra?: ReactNode;
    actions?: readonly ChatReplyAction[];
    /** After the actions: time, tokens, cost */
    meta?: ReactNode;
}) => (
    <Message>
        <MessageAvatar>
            <Avatar size="sm">
                <AvatarFallback>{avatar}</AvatarFallback>
            </Avatar>
        </MessageAvatar>
        <MessageContent className="min-w-0">
            <MessageHeader>{name}</MessageHeader>
            <Prose size="lg" className="max-w-[72ch]">{children}</Prose>
            {extra}
            {(actions !== undefined || meta !== undefined) && (
                <MessageFooter className="flex items-center gap-1">
                    {actions?.map((action) => <Button key={action.label} variant="ghost" size="icon-xs" aria-label={action.label} onClick={action.onClick}>{action.icon}</Button>)}
                    {meta !== undefined && <span className={cn(NOTE, "ml-2 whitespace-nowrap")}>{meta}</span>}
                </MessageFooter>
            )}
        </MessageContent>
    </Message>
);
