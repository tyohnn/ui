"use client";

import { useEffect, useState } from "react";

import type { Preset, PresetLists } from "@tyohnn/theme";

import type { SystemSummary } from "@/lib/site";
import type { TailwindFamily, ThemeInfo } from "@/lib/themes";

import { Combobox } from "./combobox";
import { useLocale } from "./locale-provider";
import { SystemOption, systemOptions } from "./pickers";
import { SystemView } from "./system-view";
import { ThemeProvider, useTheme } from "./theme-provider";

const SYSTEM_KEY = "system";

const readSystem = (names: string[]): string | null =>
{
    const found = new URLSearchParams(window.location.hash.slice(1)).get(SYSTEM_KEY);

    return found && names.includes(found) ? found : null;
};

const writeSystem = (name: string) =>
{
    const params = new URLSearchParams(window.location.hash.slice(1));

    params.set(SYSTEM_KEY, name);
    history.replaceState(null, "", `#${params.toString()}`);
};

/**
 * The create page, shadcn create's loop for tyohnn: pick a system for the feel, change its palette, accent and
 * chart colour, and take it away as one preset code. It is the system page with the system as a pick of its own:
 * the same side panel and the same screens, so switching system keeps the colours that were not the old
 * system's own and the frames follow.
 */
export const CreateView = ({
    systems,
    themes,
    owns,
    presets,
    families,
}: {
    /** In the order presets.json counts them: tyohnn's own systems first, then the shadcn ports */
    systems: SystemSummary[];
    themes: ThemeInfo[];
    owns: Record<string, string>;
    presets: PresetLists;
    /** Tailwind's palette, for the colour picker */
    families: TailwindFamily[];
}) =>
{
    const names = systems.map((system) => system.name);
    // null until the link has been read, so the frames start on the linked system rather than switching to it
    const [name, setName] = useState<string | null>(null);

    useEffect(() => setName(readSystem(names) ?? names[0]), []);

    if (!name) return null;

    const choose = (next: string) =>
    {
        setName(next);
        writeSystem(next);
    };

    return (
        <ThemeProvider themes={themes} own={owns[name] ?? name} system={name} presets={presets}>
            <CreateBody systems={systems} name={name} onSystem={choose} families={families} />
        </ThemeProvider>
    );
};

const CreateBody = ({ systems, name, onSystem, families }: { systems: SystemSummary[]; name: string; onSystem: (name: string) => void; families: TailwindFamily[] }) =>
{
    const { t } = useLocale();
    const theme = useTheme()!;
    const index = systems.findIndex((system) => system.name === name);
    const system = systems[index];
    const next = systems[(index + 1) % systems.length].name;

    // Another system's preset switches system here, in place, and puts its colours on.
    const open = (preset: Preset) =>
    {
        onSystem(preset.system);
        theme.setPicks({ base: preset.palette, accent: preset.accent, chart: preset.chart }, preset.edits);
    };

    const shuffle = () =>
    {
        onSystem(systems[Math.floor(Math.random() * systems.length)].name);
        theme.shuffle();
    };

    return (
        <SystemView
            system={system}
            next={next}
            create={{ families, onOtherSystem: open, onShuffle: shuffle }}
            head={(
                <div className="page-head">
                    <div>
                        <div className="eyebrow">{t.create.eyebrow}</div>
                        <h1>{t.create.title}</h1>
                        <p>{t.create.body}</p>
                    </div>
                </div>
            )}
            panelTop={(
                <div className="th-selects">
                    <Combobox
                        options={systemOptions(systems)}
                        value={name}
                        onChange={onSystem}
                        label={t.create.system}
                        placeholder={t.create.systemSearch}
                        triggerClassName="th-select"
                        align="left"
                        trigger={<><span><small>{t.create.system}</small><b style={{ fontFamily: system.nameFont }}>{name}</b></span><span className="th-dots" aria-hidden>{system.palette.slice(0, 4).map((colour, at) => <i key={at} style={{ background: colour }} />)}</span></>}
                        renderOption={(option, selected) => <SystemOption system={option.system} selected={selected} />}
                    />
                </div>
            )}
        />
    );
};
