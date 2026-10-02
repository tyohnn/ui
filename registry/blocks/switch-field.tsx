"use client";

import type { ReactNode } from "react";

import { Field, FieldContent, FieldDescription, FieldLabel } from "@tyohnn/components/field";
import { Switch } from "@tyohnn/components/switch";

/**
 * One setting as a switch: its name and what turning it on does, with the switch at the end of the row. `icon`
 * puts a small icon before the name. For a dense list with the hint on the same line use SwitchRow.
 */
export const SwitchField = ({
    id,
    icon,
    label,
    description,
    checked,
    defaultChecked,
    onCheckedChange,
    disabled,
}: {
    id: string;
    icon?: ReactNode;
    label: ReactNode;
    description?: ReactNode;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
}) => (
    <Field orientation="horizontal">
        <FieldContent>
            <FieldLabel htmlFor={id} className={icon === undefined ? undefined : "[&_svg]:size-[14px] [&_svg]:shrink-0"}>{icon}{label}</FieldLabel>
            {description !== undefined && <FieldDescription>{description}</FieldDescription>}
        </FieldContent>
        <Switch id={id} checked={checked} defaultChecked={defaultChecked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </Field>
);
