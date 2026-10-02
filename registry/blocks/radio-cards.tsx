"use client";

import type { ReactNode } from "react";

import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@tyohnn/components/field";
import { RadioGroup, RadioGroupItem } from "@tyohnn/components/radio-group";
import { cn } from "@tyohnn/lib/utils";

export type RadioCard = { value: string; label: ReactNode; description?: ReactNode };

/**
 * A choice among a few options, each a card with its name and what it means; the whole card selects it. Two
 * columns. Use it where the options need a sentence each — a digest frequency, a plan, a visibility level; for
 * short options use a select. `id` prefixes the ids of the radios; `label` names the group for assistive technology.
 */
export const RadioCards = ({
    id,
    label,
    options,
    value,
    defaultValue,
    onValueChange,
    className,
}: {
    id: string;
    label: string;
    options: readonly RadioCard[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    className?: string;
}) => (
    <RadioGroup
        {...(value === undefined ? { defaultValue } : { value })}
        onValueChange={onValueChange && ((next) => onValueChange(String(next)))}
        aria-label={label}
        className={cn("grid grid-cols-2 gap-3", className)}
    >
        {options.map((option) => (
            <FieldLabel key={option.value} htmlFor={`${id}-${option.value}`}>
                <Field orientation="horizontal">
                    <RadioGroupItem id={`${id}-${option.value}`} value={option.value} />
                    <FieldContent>
                        <FieldTitle>{option.label}</FieldTitle>
                        {option.description !== undefined && <FieldDescription>{option.description}</FieldDescription>}
                    </FieldContent>
                </Field>
            </FieldLabel>
        ))}
    </RadioGroup>
);
