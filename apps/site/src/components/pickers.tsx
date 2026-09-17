"use client";

import { Fragment } from "react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@tyohnn/components/select";
import { ToggleGroup, ToggleGroupItem } from "@tyohnn/components/toggle-group";

import { TEMPLATE_GROUPS, TEMPLATES, type TemplateId } from "@/lib/site";

const TEMPLATE_ITEMS = TEMPLATES.map((template) => ({ value: template.id, label: template.label }));
const GROUPS = TEMPLATE_GROUPS.map((group) => ({ ...group, templates: TEMPLATES.filter((template) => template.group === group.id) })).filter((group) => group.templates.length > 0);

/** The template picker of every page: the catalog's templates under their group (Showcase · Blocks). */
export const TemplateSelect = ({ value, onChange, id }: { value: TemplateId; onChange: (value: TemplateId) => void; id?: string }) => (
    <Select items={TEMPLATE_ITEMS} value={value} onValueChange={(next) => next && onChange(next as TemplateId)}>
        <SelectTrigger id={id} size="sm" aria-label="Template" className="min-w-52" data-template-select="">
            <SelectValue />
        </SelectTrigger>
        <SelectContent>
            {GROUPS.map((group, index) => (
                <Fragment key={group.id}>
                    {index > 0 && <SelectSeparator />}
                    <SelectGroup>
                        <SelectLabel>{group.label}</SelectLabel>
                        {group.templates.map((template) => <SelectItem key={template.id} value={template.id}>{template.label}</SelectItem>)}
                    </SelectGroup>
                </Fragment>
            ))}
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
