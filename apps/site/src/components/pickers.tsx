"use client";

import type { Mode, SystemSummary, TemplateEntry } from "@/lib/site";
import { CATEGORIES, screenSource } from "@/lib/site";

import { Combobox } from "./combobox";

const systemOptions = (systems: SystemSummary[]) =>
    systems.map((system) => ({ value: system.name, search: `${system.name} ${system.tagline}`, system }));

const SystemOption = ({ system, selected }: { system: SystemSummary; selected: boolean }) => (
    <>
        <b style={{ fontFamily: system.nameFont }}>{system.name}</b>
        <span className="tag">{system.defaultMode}</span>
        <small>{system.tagline}</small>
        <span className="check">{selected ? "✓" : ""}</span>
    </>
);

const nameFontOf = (systems: SystemSummary[], name: string) => systems.find((system) => system.name === name)?.nameFont;

/** The Components page's system picker */
export const SystemCombobox = ({ systems, value, onChange }: { systems: SystemSummary[]; value: string; onChange: (name: string) => void }) => (
    <Combobox
        options={systemOptions(systems)}
        value={value}
        onChange={onChange}
        label="System"
        placeholder="Search systems…"
        triggerClassName="combo-trigger"
        trigger={<><span className="lbl">System</span><b style={{ fontFamily: nameFontOf(systems, value) }}>{value}</b><span className="chev" aria-hidden>⌄</span></>}
        renderOption={(option, selected) => <SystemOption system={option.system} selected={selected} />}
    />
);

/** Compare's A / B pickers */
export const SystemPicker = ({ systems, value, onChange, side }: { systems: SystemSummary[]; value: string; onChange: (name: string) => void; side: "A" | "B" }) => (
    <Combobox
        options={systemOptions(systems)}
        value={value}
        onChange={onChange}
        label={`System ${side}`}
        placeholder="Search systems…"
        triggerClassName="picker"
        align="left"
        trigger={<><span className="lbl">{side}</span><b style={{ fontFamily: nameFontOf(systems, value) }}>{value}</b><span className="chev" aria-hidden>⌄</span></>}
        renderOption={(option, selected) => <SystemOption system={option.system} selected={selected} />}
    />
);

/** Compare's screen picker, grouped by category */
export const ScreenPicker = ({ value, onChange }: { value: string; onChange: (id: string) => void }) =>
{
    const options = CATEGORIES.flatMap((category) => category.screens.map((screen: TemplateEntry) => ({
        value: screen.id,
        search: `${screen.label} ${screen.block ?? ""} ${category.label}`,
        group: category.label,
        screen,
    })));
    const current = options.find((option) => option.value === value)?.screen;

    return (
        <Combobox
            options={options}
            value={value}
            onChange={onChange}
            label="Screen"
            placeholder="Search screens…"
            triggerClassName="picker tpl"
            optionClassName="template"
            trigger={<><span className="lbl">Screen</span><b>{current?.label}</b><small>{current ? screenSource(current) : ""}</small><span className="chev" aria-hidden>⌄</span></>}
            renderOption={(option, selected) => (
                <>
                    <b>{option.screen.label}</b>
                    <span className="tag">{screenSource(option.screen)}</span>
                    <span className="check">{selected ? "✓" : ""}</span>
                </>
            )}
        />
    );
};

/** Light / Dark for the frames */
export const ModeSeg = ({ mode, onChange, label = "Preview mode" }: { mode: Mode; onChange: (mode: Mode) => void; label?: string }) => (
    <span className="seg" role="group" aria-label={label}>
        <button type="button" aria-pressed={mode === "light"} onClick={() => onChange("light")}>Light</button>
        <button type="button" aria-pressed={mode === "dark"} onClick={() => onChange("dark")}>Dark</button>
    </span>
);
