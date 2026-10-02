"use client";

import { type ReactNode, useState } from "react";

import { ToggleGroup, ToggleGroupItem } from "@tyohnn/components/toggle-group";

export type SegmentedOption = {
    value: string;
    label: string;
    /** An icon before the label, with `data-icon="inline-start"` */
    icon?: ReactNode;
};

/**
 * A few choices side by side as one joined control, exactly one of them on: a period (24h · 7d · 30d), a view
 * (board · list), a scope (all · mine). `label` names the group for assistive technology. The first option is on
 * until `value` or `defaultValue` says otherwise; for more than a handful of options use CompactSelect.
 */
export const SegmentedControl = ({
    label,
    options,
    value,
    defaultValue,
    onValueChange,
    className,
}: {
    label: string;
    options: readonly SegmentedOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    className?: string;
}) =>
{
    const [own, setOwn] = useState(defaultValue ?? options[0]?.value);

    return (
        <ToggleGroup
            variant="outline"
            size="sm"
            spacing={0}
            value={[value ?? own]}
            // Pressing the option that is on would turn everything off; one stays on, so that press changes nothing.
            onValueChange={(next) =>
            {
                if (next[0] === undefined) return;

                setOwn(String(next[0]));
                onValueChange?.(String(next[0]));
            }}
            aria-label={label}
            className={className}
        >
            {options.map((option) => <ToggleGroupItem key={option.value} value={option.value}>{option.icon}{option.label}</ToggleGroupItem>)}
        </ToggleGroup>
    );
};
