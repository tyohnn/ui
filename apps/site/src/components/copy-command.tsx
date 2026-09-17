"use client";

import { useState } from "react";

const useCopy = (command: string) =>
{
    const [copied, setCopied] = useState(false);

    const copy = async () =>
    {
        try
        {
            await navigator.clipboard.writeText(command);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
        catch
        {
            // Clipboard API unavailable (insecure context): select the command for a manual copy instead.
            const node = document.querySelector(`[data-command="${CSS.escape(command)}"]`);

            if (!node) return;

            const range = document.createRange();

            range.selectNodeContents(node);
            getSelection()?.removeAllRanges();
            getSelection()?.addRange(range);
        }
    };

    return { copied, copy };
};

/** One shell command in a pill with a copy button. */
export const CopyCommand = ({ command, className }: { command: string; className?: string }) =>
{
    const { copied, copy } = useCopy(command);

    return (
        <span className={className ? `cmd ${className}` : "cmd"}>
            <span><span className="dollar">$</span> <span data-command={command}>{command}</span></span>
            <button type="button" className="copy" onClick={copy} aria-label={`Copy: ${command}`}>{copied ? "Copied" : "Copy"}</button>
        </span>
    );
};

/** A labelled command row (docs). */
export const CommandCard = ({ label, command }: { label?: string; command: string }) =>
{
    const { copied, copy } = useCopy(command);

    return (
        <div className="cmd-card">
            {label && <span className="what">{label}</span>}
            <span className="line"><i>$</i><span data-command={command}>{command}</span></span>
            <button type="button" className="copy" onClick={copy} aria-label={`Copy: ${command}`}>{copied ? "Copied" : "Copy"}</button>
        </div>
    );
};
