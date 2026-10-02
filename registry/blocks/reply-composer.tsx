"use client";

import type { ReactNode } from "react";

import { Button } from "@tyohnn/components/button";
import { Textarea } from "@tyohnn/components/textarea";
import { NOTE } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

export type ReplyComposerTool = { label: string; icon: ReactNode; onClick?: () => void };

/**
 * The reply box under an open message, over a divider: a line that says who the reply goes to, the text, and a
 * row with the insert tools (attach, emoji), the draft's status and the buttons that discard or send it.
 * `label` names the text field for assistive technology.
 */
export const ReplyComposer = ({
    icon,
    heading,
    label,
    value,
    defaultValue,
    onValueChange,
    placeholder,
    tools,
    status,
    actions,
    className,
}: {
    /** Before the heading: the kind of reply */
    icon?: ReactNode;
    /** "Reply to …" */
    heading: ReactNode;
    label: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    tools?: readonly ReplyComposerTool[];
    /** After the tools ("Draft saved 09:41") */
    status?: ReactNode;
    /** The buttons at the end of the row */
    actions?: ReactNode;
    className?: string;
}) => (
    <div className={cn("flex flex-col gap-2 border-t border-border px-6 py-3", className)}>
        <div className="flex items-center gap-2 [&>svg]:size-[16px] [&>svg]:text-muted-foreground">
            {icon}
            <span className={cn(NOTE, "min-w-0 truncate")}>{heading}</span>
        </div>
        <Textarea
            aria-label={label}
            className="min-h-20"
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder}
            onChange={onValueChange && ((event) => onValueChange(event.target.value))}
        />
        <div className="flex flex-wrap items-center gap-2">
            {tools?.map((tool) => <Button key={tool.label} variant="ghost" size="icon-sm" aria-label={tool.label} onClick={tool.onClick}>{tool.icon}</Button>)}
            {status !== undefined && <span className={NOTE}>{status}</span>}
            {actions !== undefined && <div className="ml-auto flex items-center gap-2">{actions}</div>}
        </div>
    </div>
);
