import type { ReactNode } from "react";

import { MUTED_BODY } from "@tyohnn/blocks/lib/prose";
import { cn } from "@tyohnn/lib/utils";

export type Step = {
    title: ReactNode;
    body?: ReactNode;
    /** What the step needs under its text: a code block, a figure */
    content?: ReactNode;
};

/** Numbered steps to follow in order: a number in a circle, the step's title, what to do, and a code block or figure when the step has one. */
export const StepList = ({ steps, className }: { steps: readonly Step[]; className?: string }) => (
    <ol className={cn("mx-0 flex list-none flex-col gap-5 p-0", className)}>
        {steps.map((step, index) => (
            <li key={index} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-[length:var(--ui-text-sm)] leading-none text-foreground tabular-nums">{index + 1}</span>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <h3 className="m-0 text-[length:var(--ui-text-lg)] leading-[var(--ui-line-height-lg)] font-semibold">{step.title}</h3>
                    {step.body !== undefined && <p className={cn("m-0", MUTED_BODY)}>{step.body}</p>}
                    {step.content}
                </div>
            </li>
        ))}
    </ol>
);
