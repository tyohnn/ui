import type { ReactNode } from "react";

import { NOTE, SMALL } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

export type Property = {
    icon: ReactNode;
    label: string;
    /** Badges, people, PropertyText — they sit on one line and wrap */
    value: ReactNode;
};

/**
 * The properties of a document or a record as rows: the property's name behind a small icon in a fixed column,
 * and its value beside it (a status badge, people, a date, tags). `actions` is a row of buttons under the
 * properties (comments, add a property).
 */
export const PropertyList = ({ properties, actions, className }: { properties: readonly Property[]; actions?: ReactNode; className?: string }) => (
    <div className={cn("flex flex-col gap-1", className)}>
        {properties.map((property) => (
            <div key={property.label} className="flex min-h-8 flex-wrap items-center gap-x-3 gap-y-1">
                <span className={cn(NOTE, "flex w-32 shrink-0 items-center gap-2 [&_svg]:size-[var(--control-icon-size-md)] [&_svg]:shrink-0")}>
                    {property.icon}
                    {property.label}
                </span>
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">{property.value}</div>
            </div>
        ))}
        {actions !== undefined && <div className="flex items-center gap-2 pt-2">{actions}</div>}
    </div>
);

/** A property's value as plain text: a name, a date */
export const PropertyText = ({ children, className }: { children: ReactNode; className?: string }) => (
    <span className={cn(SMALL, "text-foreground", className)}>{children}</span>
);
