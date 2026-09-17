"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@tyohnn/components/select";
import { ToggleGroup, ToggleGroupItem } from "@tyohnn/components/toggle-group";

import { TEMPLATES, type TemplateId } from "@/lib/site";

export const TemplateSelect = ({ value, onChange, id }: { value: TemplateId; onChange: (value: TemplateId) => void; id?: string }) => (
    <Select items={TEMPLATES.map((template) => ({ value: template.id, label: template.label }))} value={value} onValueChange={(next) => next && onChange(next as TemplateId)}>
        <SelectTrigger id={id} size="sm" aria-label="Template" className="min-w-40">
            <SelectValue />
        </SelectTrigger>
        <SelectContent>
            {TEMPLATES.map((template) => <SelectItem key={template.id} value={template.id}>{template.label}</SelectItem>)}
        </SelectContent>
    </Select>
);

/** A single-choice segmented control over string options. */
export const Segmented = <T extends string>({ value, options, onChange, label }: {
    value: T;
    options: readonly { value: T; label: string }[];
    onChange: (value: T) => void;
    label: string;
}) => (
    <ToggleGroup
        variant="outline"
        size="sm"
        spacing={0}
        aria-label={label}
        value={[value]}
        onValueChange={(next: string[]) => next[0] && onChange(next[0] as T)}
    >
        {options.map((option) => <ToggleGroupItem key={option.value} value={option.value}>{option.label}</ToggleGroupItem>)}
    </ToggleGroup>
);
