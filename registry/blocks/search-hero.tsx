"use client";

import type { ReactNode } from "react";

import { Search } from "@tyohnn/icons";

import { Badge } from "@tyohnn/components/badge";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from "@tyohnn/components/input-group";
import { Kbd } from "@tyohnn/components/kbd";
import { LEAD, NOTE } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

/**
 * The band at the top of a help center or a directory, centred on one large search field: a status badge, the
 * greeting as the page's title, a sentence under it, the field with its shortcut and its button, and a line of
 * suggested searches. Use it where searching is the first thing to do on the page.
 */
export const SearchHero = ({
    status,
    title,
    description,
    searchLabel,
    placeholder,
    shortcut,
    submitLabel,
    suggestionsLabel,
    suggestions,
    value,
    onValueChange,
    onSubmit,
    className,
}: {
    /** A badge over the title: the service's state */
    status?: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    /** Names the field for assistive technology */
    searchLabel: string;
    placeholder?: string;
    /** The keys that focus the field ("⌘ K") */
    shortcut?: string;
    submitLabel: string;
    /** What the suggestions are ("Popular:") */
    suggestionsLabel?: string;
    suggestions?: readonly string[];
    value?: string;
    onValueChange?: (value: string) => void;
    onSubmit?: () => void;
    className?: string;
}) => (
    <section className={cn("flex flex-col items-center gap-4 border-b border-border bg-muted px-6 py-10 text-center", className)}>
        {status}
        <h1 className="m-0 font-heading text-[length:calc(var(--ui-text-lg)*1.75)] leading-[1.2] font-semibold">{title}</h1>
        {description !== undefined && <p className={LEAD}>{description}</p>}
        <InputGroup className="h-12 w-full max-w-[40rem] bg-background">
            <InputGroupAddon>
                <Search />
            </InputGroupAddon>
            <InputGroupInput aria-label={searchLabel} placeholder={placeholder} value={value} onChange={onValueChange && ((event) => onValueChange(event.target.value))} />
            <InputGroupAddon align="inline-end">
                {shortcut !== undefined && <InputGroupText><Kbd>{shortcut}</Kbd></InputGroupText>}
                <InputGroupButton variant="default" size="sm" onClick={onSubmit}>{submitLabel}</InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
        {suggestions !== undefined && (
            <div className="flex flex-wrap items-center justify-center gap-2">
                {suggestionsLabel !== undefined && <span className={NOTE}>{suggestionsLabel}</span>}
                {suggestions.map((term) => <Badge key={term} variant="outline">{term}</Badge>)}
            </div>
        )}
    </section>
);
