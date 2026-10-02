"use client";

import { useState } from "react";

import { Slider } from "@tyohnn/components/slider";
import { HintField } from "@tyohnn/blocks/hint-field";

/**
 * One number set with a slider: its name, the current value at the end of the label line, and the slider under
 * it. A run parameter (temperature, a limit), a threshold. Controlled with `value`, or it keeps its own value
 * from `defaultValue`.
 */
export const SliderField = ({
    id,
    label,
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    step,
    format = String,
}: {
    id: string;
    label: string;
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    /** How the value is written at the end of the label line */
    format?: (value: number) => string;
}) =>
{
    const [own, setOwn] = useState(defaultValue ?? min ?? 0);
    const current = value ?? own;

    return (
        <HintField id={id} label={label} hint={format(current)}>
            <Slider
                id={id}
                value={[current]}
                onValueChange={(next) =>
                {
                    const number = Array.isArray(next) ? next[0] : next;

                    setOwn(number);
                    onValueChange?.(number);
                }}
                min={min}
                max={max}
                step={step}
                aria-label={label}
            />
        </HintField>
    );
};
