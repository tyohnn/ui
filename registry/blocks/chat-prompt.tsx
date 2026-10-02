import type { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@tyohnn/components/avatar";
import { Bubble, BubbleContent } from "@tyohnn/components/bubble";
import { Message, MessageAvatar, MessageContent, MessageFooter } from "@tyohnn/components/message";

/**
 * What the person sent in a conversation with an assistant: their avatar and the message as a bubble on the end
 * side, with one line under it (who and when). The answer to it is a ChatReply.
 */
export const ChatPrompt = ({ avatar, meta, children }: { /** Initials or an icon */ avatar: ReactNode; meta?: ReactNode; children: ReactNode }) => (
    <Message align="end">
        <MessageAvatar>
            <Avatar size="sm">
                <AvatarFallback>{avatar}</AvatarFallback>
            </Avatar>
        </MessageAvatar>
        <MessageContent>
            <Bubble align="end">
                <BubbleContent>{children}</BubbleContent>
            </Bubble>
            {meta !== undefined && <MessageFooter>{meta}</MessageFooter>}
        </MessageContent>
    </Message>
);
