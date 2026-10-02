"use client";

import { ToggleGroup, ToggleGroupItem } from "@tyohnn/components/toggle-group";

/**
 * A choice between a few views of the same thing, as joined outline buttons: Chat or Compare, Unified or Split.
 * One is always chosen. `label` names the group for assistive technology.
 */
export const ViewToggle = ({
    label,
    options,
    value,
    defaultValue,
    onValueChange,
    className,
}: {
    label: string;
    options: readonly { value: string; label: string }[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    className?: string;
}) => (
    <ToggleGroup
        variant="outline"
        size="sm"
        spacing={0}
        {...(value === undefined ? { defaultValue: [defaultValue ?? options[0]?.value] } : { value: [value] })}
        onValueChange={onValueChange && ((next) => { if (next[0] !== undefined) onValueChange(String(next[0])); })}
        aria-label={label}
        className={className}
    >
        {options.map((option) => <ToggleGroupItem key={option.value} value={option.value}>{option.label}</ToggleGroupItem>)}
    </ToggleGroup>
);
