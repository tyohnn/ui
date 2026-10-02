"use client";

import type { Mode, SystemSummary, TemplateEntry } from "@/lib/site";
import { CATEGORIES, screenSource } from "@/lib/site";

import { Combobox } from "./combobox";
import { useLocale } from "./locale-provider";

const systemOptions = (systems: SystemSummary[]) =>
    systems.map((system) => ({ value: system.name, search: `${system.name} ${system.tagline}`, system }));

const SystemOption = ({ system, selected }: { system: SystemSummary; selected: boolean }) =>
{
    const { t } = useLocale();
    const mode = t.modeTag[system.defaultMode];

    return (
        <>
            <b style={{ fontFamily: system.nameFont }}>{system.name}</b>
            <span className="tag">{mode}</span>
            <small>{system.tagline}</small>
            <span className="check">{selected ? "✓" : ""}</span>
        </>
    );
};

const nameFontOf = (systems: SystemSummary[], name: string) => systems.find((system) => system.name === name)?.nameFont;

/** The Components page's system picker */
export const SystemCombobox = ({ systems, value, onChange }: { systems: SystemSummary[]; value: string; onChange: (name: string) => void }) =>
{
    const { t } = useLocale();

    return (
        <Combobox
            options={systemOptions(systems)}
            value={value}
            onChange={onChange}
            label={t.pickers.system}
            placeholder={t.pickers.systemSearch}
            triggerClassName="combo-trigger"
            trigger={<><span className="lbl">{t.pickers.system}</span><b style={{ fontFamily: nameFontOf(systems, value) }}>{value}</b><span className="chev" aria-hidden>⌄</span></>}
            renderOption={(option, selected) => <SystemOption system={option.system} selected={selected} />}
        />
    );
};

/** Compare's A / B pickers */
export const SystemPicker = ({ systems, value, onChange, side }: { systems: SystemSummary[]; value: string; onChange: (name: string) => void; side: "A" | "B" }) =>
{
    const { t } = useLocale();

    return (
        <Combobox
            options={systemOptions(systems)}
            value={value}
            onChange={onChange}
            label={t.pickers.systemSide(side)}
            placeholder={t.pickers.systemSearch}
            triggerClassName="picker"
            align="left"
            trigger={<><span className="lbl">{side}</span><b style={{ fontFamily: nameFontOf(systems, value) }}>{value}</b><span className="chev" aria-hidden>⌄</span></>}
            renderOption={(option, selected) => <SystemOption system={option.system} selected={selected} />}
        />
    );
};

/** Compare's screen picker, grouped by category */
export const ScreenPicker = ({ value, onChange }: { value: string; onChange: (id: string) => void }) =>
{
    const { t, labels } = useLocale();
    const options = CATEGORIES.flatMap((category) => category.screens.map((screen: TemplateEntry) => ({
        value: screen.id,
        // Both languages match, so "orders" finds 주문 and 주문 finds it too
        search: `${labels.screen(screen.id, screen.label)} ${screen.label} ${screen.block ?? ""} ${labels.category(category.id, category.label)}`,
        group: labels.category(category.id, category.label),
        screen,
    })));
    const current = options.find((option) => option.value === value)?.screen;

    return (
        <Combobox
            options={options}
            value={value}
            onChange={onChange}
            label={t.pickers.screen}
            placeholder={t.pickers.screenSearch}
            triggerClassName="picker tpl"
            optionClassName="template"
            trigger={<><span className="lbl">{t.pickers.screen}</span><b>{current ? labels.screen(current.id, current.label) : ""}</b><small>{current ? screenSource(current) : ""}</small><span className="chev" aria-hidden>⌄</span></>}
            renderOption={(option, selected) => (
                <>
                    <b>{labels.screen(option.screen.id, option.screen.label)}</b>
                    <span className="tag">{screenSource(option.screen)}</span>
                    <span className="check">{selected ? "✓" : ""}</span>
                </>
            )}
        />
    );
};

/** Light / Dark for the frames */
export const ModeSeg = ({ mode, onChange, label }: { mode: Mode; onChange: (mode: Mode) => void; label?: string }) =>
{
    const { t } = useLocale();

    return (
        <span className="seg" role="group" aria-label={label ?? t.pickers.modeLabel}>
            <button type="button" aria-pressed={mode === "light"} onClick={() => onChange("light")}>{t.mode.light}</button>
            <button type="button" aria-pressed={mode === "dark"} onClick={() => onChange("dark")}>{t.mode.dark}</button>
        </span>
    );
};
