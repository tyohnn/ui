"use client";

import type { ReactNode } from "react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@tyohnn/components/select";

export type CompactSelectOption = string | { value: string; label: string };

/**
 * A small select for a toolbar filter or a cell: a role, a status, a sort order. Options are plain strings or
 * value and label pairs; the first is selected until `value` or `defaultValue` says otherwise. `label` names the
 * control for assistive technology, or — with `showLabel` — is written in the trigger before the value ("Sort by …").
 */
export const CompactSelect = ({
    label,
    showLabel,
    icon,
    options,
    value,
    defaultValue,
    onValueChange,
    disabled,
    className,
}: {
    label: string;
    showLabel?: boolean;
    icon?: ReactNode;
    options: readonly CompactSelectOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
    className?: string;
}) =>
{
    const items = options.map((option) => (typeof option === "string" ? { value: option, label: option } : option));

    return (
        <Select
            items={items}
            {...(value === undefined ? { defaultValue: defaultValue ?? items[0]?.value } : { value })}
            onValueChange={onValueChange && ((next) => onValueChange(String(next)))}
            disabled={disabled}
        >
            <SelectTrigger size="sm" aria-label={showLabel ? undefined : label} className={className}>
                {icon}
                {showLabel && <span className="text-muted-foreground">{label}</span>}
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {items.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
};
