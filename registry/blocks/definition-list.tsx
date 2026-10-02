import type { ReactNode } from "react";

import { BODY, MUTED_BODY } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

export type Definition = {
    id: string;
    /** What is defined, as a badge: a status code, a key, an error type */
    badge: ReactNode;
    /** Its name, on one line */
    term: ReactNode;
    description: ReactNode;
};

/** An outlined list of short definitions with a hairline between them: a code or key as a badge, its name, and what it means. */
export const DefinitionList = ({ items, className }: { items: readonly Definition[]; className?: string }) => (
    <ul className={cn("m-0 flex list-none flex-col rounded-[var(--radius-lg)] border border-border p-0", className)}>
        {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-border px-4 py-3 first:border-t-0">
                {item.badge}
                <span className={cn(BODY, "font-medium whitespace-nowrap")}>{item.term}</span>
                <span className={cn(MUTED_BODY, "min-w-0 flex-1")}>{item.description}</span>
            </li>
        ))}
    </ul>
);
