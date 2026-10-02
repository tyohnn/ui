"use client";

import { Search } from "@tyohnn/icons";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@tyohnn/components/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@tyohnn/components/select";
import { cn } from "@tyohnn/lib/utils";

/** The search field of a table's toolbar. `label` names it for assistive technology; the placeholder says what it searches. */
export const TableSearch = ({ label, placeholder, value, onValueChange, className }: { label: string; placeholder?: string; value?: string; onValueChange?: (value: string) => void; className?: string }) => (
    <InputGroup className={cn("w-56", className)}>
        <InputGroupAddon><Search /></InputGroupAddon>
        <InputGroupInput aria-label={label} placeholder={placeholder} value={value} onChange={onValueChange && ((event) => onValueChange(event.target.value))} />
    </InputGroup>
);

/**
 * One filter of a table's toolbar as a small select. The first option is the unfiltered one ("All statuses") and
 * is selected until `value` says otherwise.
 */
export const TableFilter = ({ label, options, value, onValueChange, className }: { label: string; options: readonly string[]; value?: string; onValueChange?: (value: string) => void; className?: string }) => (
    <Select
        items={options.map((option) => ({ value: option, label: option }))}
        {...(value === undefined ? { defaultValue: options[0] } : { value })}
        onValueChange={onValueChange && ((next) => onValueChange(String(next)))}
    >
        <SelectTrigger size="sm" aria-label={label} className={cn("min-w-36", className)}>
            <SelectValue />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                {options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
            </SelectGroup>
        </SelectContent>
    </Select>
);
