"use client";

import type { ReactNode } from "react";

import { Field, FieldLabel } from "@tyohnn/components/field";
import { Switch } from "@tyohnn/components/switch";
import { NOTE } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

/**
 * One setting on a single line: its name, a hint and the switch at the end — for a dense list of switches. For a
 * setting whose description runs under the name use SwitchField.
 *
 * The hint is cut with an ellipsis before it reaches the switch: its width is capped at a little over half the
 * row, so a wider typeface or a fallback font never pushes its last word under the switch.
 */
export const SwitchRow = ({
    id,
    label,
    hint,
    checked,
    defaultChecked,
    onCheckedChange,
    disabled,
}: {
    id: string;
    label: ReactNode;
    hint?: ReactNode;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
}) => (
    <Field orientation="horizontal">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {hint !== undefined && <span className={cn(NOTE, "max-w-[56%] min-w-0 flex-[0_1_auto] truncate text-right")}>{hint}</span>}
        <Switch id={id} checked={checked} defaultChecked={defaultChecked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </Field>
);
