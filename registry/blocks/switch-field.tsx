"use client";

import type { ReactNode } from "react";

import { Field, FieldContent, FieldDescription, FieldLabel } from "@tyohnn/components/field";
import { Switch } from "@tyohnn/components/switch";

/** One setting as a switch: its name and what turning it on does, with the switch at the end of the row. */
export const SwitchField = ({
    id,
    label,
    description,
    checked,
    defaultChecked,
    onCheckedChange,
    disabled,
}: {
    id: string;
    label: ReactNode;
    description?: ReactNode;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
}) => (
    <Field orientation="horizontal">
        <FieldContent>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {description !== undefined && <FieldDescription>{description}</FieldDescription>}
        </FieldContent>
        <Switch id={id} checked={checked} defaultChecked={defaultChecked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </Field>
);
