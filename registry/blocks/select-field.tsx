"use client";

import type { ReactNode } from "react";

import { Field, FieldLabel } from "@tyohnn/components/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@tyohnn/components/select";

export type SelectFieldOption = string | { value: string; label: string };

/**
 * A select as a form field: its label over a trigger as wide as the field. Options are plain strings or value and
 * label pairs. `name` is a fuller name for assistive technology when the visible label is short ("From" →
 * "Quiet hours start"). For a small select in a toolbar or a cell use CompactSelect.
 */
export const SelectField = ({
    id,
    label,
    name,
    options,
    value,
    defaultValue,
    onValueChange,
    disabled,
}: {
    id: string;
    label: ReactNode;
    name?: string;
    options: readonly SelectFieldOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
}) =>
{
    const items = options.map((option) => (typeof option === "string" ? { value: option, label: option } : option));

    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Select
                items={items}
                {...(value === undefined ? { defaultValue: defaultValue ?? items[0]?.value } : { value })}
                onValueChange={onValueChange && ((next) => onValueChange(String(next)))}
                disabled={disabled}
            >
                <SelectTrigger id={id} aria-label={name} className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {items.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                </SelectContent>
            </Select>
        </Field>
    );
};
