"use client";

import { Search } from "@tyohnn/icons";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@tyohnn/components/input-group";
import { cn } from "@tyohnn/lib/utils";

/** The search field of a table's toolbar. `label` names it for assistive technology; the placeholder says what it searches. */
export const TableSearch = ({ label, placeholder, value, onValueChange, className }: { label: string; placeholder?: string; value?: string; onValueChange?: (value: string) => void; className?: string }) => (
    <InputGroup className={cn("w-56", className)}>
        <InputGroupAddon><Search /></InputGroupAddon>
        <InputGroupInput aria-label={label} placeholder={placeholder} value={value} onChange={onValueChange && ((event) => onValueChange(event.target.value))} />
    </InputGroup>
);
