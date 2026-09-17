"use client";

import { useState } from "react";

import { Button } from "@tyohnn/components/button";
import { cn } from "@tyohnn/lib/utils";

/** One shell command with a copy button. */
export const CopyCommand = ({ command, label, className }: { command: string; label?: string; className?: string }) =>
{
    const [copied, setCopied] = useState(false);

    const copy = async () =>
    {
        try
        {
            await navigator.clipboard.writeText(command);
        }
        catch
        {
            // Clipboard API unavailable (insecure context): select the text for a manual copy instead.
            const range = document.createRange();
            const code = document.querySelector(`[data-command="${CSS.escape(command)}"]`);

            if (code)
            {
                range.selectNodeContents(code);
                getSelection()?.removeAllRanges();
                getSelection()?.addRange(range);
            }
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className={cn("flex min-w-0 flex-col gap-1", className)}>
            {label && <span className="text-xs text-muted-foreground">{label}</span>}
            <div className="flex min-w-0 items-center gap-2 rounded-md border bg-muted/40 py-1 pr-1 pl-3">
                <code data-command={command} className="site-code min-w-0 flex-1 overflow-x-auto whitespace-nowrap">
                    <span className="text-muted-foreground select-none">$ </span>
                    {command}
                </code>
                <Button variant="ghost" size="xs" onClick={copy} aria-label={`Copy: ${command}`} data-copied={copied || undefined}>
                    {copied ? "Copied" : "Copy"}
                </Button>
            </div>
        </div>
    );
};
