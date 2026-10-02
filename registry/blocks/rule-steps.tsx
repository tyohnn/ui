import { Fragment, type ReactNode } from "react";

import { BODY } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

export type RuleStep = {
    id: string;
    /** The step's keyword as a badge: When, If, Then */
    keyword: ReactNode;
    /** The rest of the sentence: plain words as strings, the values as badges */
    parts: readonly ReactNode[];
};

/**
 * A rule read as a sentence per step — when this happens, if that holds, then do this — each in its own outlined
 * row: the keyword as a badge, then words and the values they refer to.
 */
export const RuleSteps = ({ steps, className }: { steps: readonly RuleStep[]; className?: string }) => (
    <div className={cn("flex flex-col gap-2", className)}>
        {steps.map((step) => (
            <div key={step.id} className="flex flex-wrap items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-muted px-3 py-2">
                {step.keyword}
                {step.parts.map((part, index) => (typeof part === "string" ? <span key={index} className={BODY}>{part}</span> : <Fragment key={index}>{part}</Fragment>))}
            </div>
        ))}
    </div>
);
