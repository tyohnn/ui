"use client";

import { type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";

export interface ComboOption
{
    value: string;
    /** Text the filter matches */
    search: string;
    group?: string;
}

/**
 * A button that opens a filterable listbox (the system and screen pickers). Type to filter, ↑ ↓ to move,
 * Enter to pick, Escape or a click outside to close.
 */
export const Combobox = <T extends ComboOption>({
    options,
    value,
    onChange,
    label,
    trigger,
    renderOption,
    placeholder,
    triggerClassName,
    optionClassName,
    align = "right",
}: {
    options: T[];
    value: string;
    onChange: (value: string) => void;
    /** Accessible name of the picker */
    label: string;
    trigger: ReactNode;
    renderOption: (option: T, selected: boolean) => ReactNode;
    placeholder: string;
    triggerClassName: string;
    optionClassName?: string;
    align?: "left" | "right";
}) =>
{
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);
    const root = useRef<HTMLDivElement>(null);
    const input = useRef<HTMLInputElement>(null);
    const listId = useId();

    const filtered = useMemo(() =>
    {
        const needle = query.trim().toLowerCase();

        return needle ? options.filter((option) => option.search.toLowerCase().includes(needle)) : options;
    }, [options, query]);

    useEffect(() =>
    {
        if (!open) return;

        setQuery("");
        setActive(Math.max(0, options.findIndex((option) => option.value === value)));
        requestAnimationFrame(() => input.current?.focus());

        const onPointer = (event: PointerEvent) =>
        {
            if (!root.current?.contains(event.target as Node)) setOpen(false);
        };

        document.addEventListener("pointerdown", onPointer);

        return () => document.removeEventListener("pointerdown", onPointer);
    }, [open, options, value]);

    useEffect(() => setActive(0), [query]);

    // Keep the active option visible inside the list (never scrolls the page: the list is the scroller).
    useEffect(() =>
    {
        if (!open) return;

        const list = root.current?.querySelector<HTMLElement>(".combo-list");
        const option = list?.querySelector<HTMLElement>(`[data-index="${active}"]`);

        if (!list || !option) return;

        if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
        else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }, [active, open]);

    const pick = (option: T | undefined) =>
    {
        if (!option) return;

        onChange(option.value);
        setOpen(false);
    };

    const onKeyDown = (event: React.KeyboardEvent) =>
    {
        if (event.key === "ArrowDown")
        {
            event.preventDefault();
            setActive((index) => Math.min(filtered.length - 1, index + 1));
        }
        else if (event.key === "ArrowUp")
        {
            event.preventDefault();
            setActive((index) => Math.max(0, index - 1));
        }
        else if (event.key === "Enter")
        {
            event.preventDefault();
            pick(filtered[active]);
        }
        else if (event.key === "Escape")
        {
            setOpen(false);
        }
    };

    let lastGroup: string | undefined;

    return (
        <div className="sys-combo" ref={root}>
            <button
                type="button"
                className={triggerClassName}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={label}
                onClick={() => setOpen((current) => !current)}
                onKeyDown={(event) =>
                {
                    if (event.key === "ArrowDown")
                    {
                        event.preventDefault();
                        setOpen(true);
                    }
                }}
            >
                {trigger}
            </button>
            {open && (
                <div className={align === "left" ? "combo-pop left" : "combo-pop"} onKeyDown={onKeyDown}>
                    <div className="combo-search">
                        <input
                            ref={input}
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={placeholder}
                            role="combobox"
                            aria-controls={listId}
                            aria-expanded
                            aria-activedescendant={filtered[active] ? `${listId}-${active}` : undefined}
                            aria-label={placeholder}
                        />
                        <kbd>{filtered.length}</kbd>
                    </div>
                    <div className="combo-list" role="listbox" id={listId} aria-label={label}>
                        {filtered.length === 0 && <div className="combo-empty">No match</div>}
                        {filtered.map((option, index) =>
                        {
                            const heading = option.group && option.group !== lastGroup ? option.group : null;

                            lastGroup = option.group;

                            return (
                                <div key={option.value}>
                                    {heading && <div className="combo-group">{heading}</div>}
                                    <div
                                        id={`${listId}-${index}`}
                                        data-index={index}
                                        role="option"
                                        aria-selected={option.value === value}
                                        className={["combo-opt", optionClassName, index === active && option.value !== value ? "hover" : ""].filter(Boolean).join(" ")}
                                        onPointerMove={() => setActive(index)}
                                        onClick={() => pick(option)}
                                    >
                                        {renderOption(option, option.value === value)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
