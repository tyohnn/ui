import type { ReactNode } from "react";

import { Field, FieldLabel } from "@tyohnn/components/field";
import { NOTE } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

/**
 * A field whose label line ends in a short hint or the current value ("200k · tools", "0.4"), with the control
 * under it. `id` is the control's id, so the label points at it.
 */
export const HintField = ({ id, label, hint, children, className }: { id?: string; label: ReactNode; hint?: ReactNode; children: ReactNode; className?: string }) => (
    <Field className={className}>
        <div className="flex items-center justify-between gap-2">
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {hint !== undefined && <span className={cn(NOTE, "tabular-nums")}>{hint}</span>}
        </div>
        {children}
    </Field>
);
