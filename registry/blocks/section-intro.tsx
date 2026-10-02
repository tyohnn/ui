import type { ReactNode } from "react";

import { MUTED_BODY } from "@tyohnn/blocks/lib/prose";
import { cn } from "@tyohnn/lib/utils";

/**
 * A section's title over one sentence that says what the section holds, above a table or a list in a reference
 * page. For a title with a short meta at the end of the line (a count, a duration) use SectionHeading.
 */
export const SectionIntro = ({ title, description, className }: { title: ReactNode; description?: ReactNode; className?: string }) => (
    <div className={cn("flex flex-col gap-1", className)}>
        <h2 className="m-0 text-[length:var(--ui-text-lg)] leading-[var(--ui-line-height-lg)] font-semibold">{title}</h2>
        {description !== undefined && <p className={cn("m-0", MUTED_BODY)}>{description}</p>}
    </div>
);
