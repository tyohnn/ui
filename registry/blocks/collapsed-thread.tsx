import type { ReactNode } from "react";

import { ChevronDown } from "@tyohnn/icons";

import { Avatar, AvatarFallback } from "@tyohnn/components/avatar";
import { NOTE } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

export type CollapsedMessage = { id: string; name: string; initials: string; teaser: ReactNode; date: ReactNode };

/**
 * The earlier messages of a thread, folded to one row each: who wrote, the start of what they wrote, when. A row
 * is a button that opens its message (`onOpen`). Put it above the message that is open.
 */
export const CollapsedThread = ({ messages, onOpen, className }: { messages: readonly CollapsedMessage[]; onOpen?: (id: string) => void; className?: string }) => (
    <div className={cn("flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border", className)}>
        {messages.map((message) => (
            <button
                key={message.id}
                type="button"
                onClick={onOpen && (() => onOpen(message.id))}
                className="flex w-full items-center gap-3 bg-transparent px-3 py-2 text-left text-inherit [font:inherit] [&+&]:border-t [&+&]:border-border"
            >
                <Avatar size="sm">
                    <AvatarFallback>{message.initials}</AvatarFallback>
                </Avatar>
                <span className="shrink-0 text-[length:var(--ui-text-md)] font-medium text-foreground">{message.name}</span>
                <span className={cn(NOTE, "min-w-0 flex-1 truncate")}>{message.teaser}</span>
                <span className={cn(NOTE, "shrink-0")}>{message.date}</span>
                <ChevronDown className="size-[16px] shrink-0 text-muted-foreground" />
            </button>
        ))}
    </div>
);
