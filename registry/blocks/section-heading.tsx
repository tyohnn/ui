import type { ReactNode } from "react";

import { LEAD } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

/**
 * The head of a section inside a page: its title with a sentence under it, and one action at the other end
 * ("All 12 topics"). For the head of the page itself use PageHeading; for a title with a short meta at the end
 * of the line use SectionTitle.
 */
export const SectionHeading = ({ title, description, action, className }: { title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string }) => (
    <div className={cn("flex flex-wrap items-end justify-between gap-2", className)}>
        <div className="flex flex-col gap-1">
            <h2 className="m-0 text-[length:var(--ui-text-lg)] leading-[var(--ui-line-height-lg)] font-semibold">{title}</h2>
            {description !== undefined && <p className={LEAD}>{description}</p>}
        </div>
        {action}
    </div>
);
