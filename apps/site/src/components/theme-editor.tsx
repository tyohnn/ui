"use client";

import { useState, type ReactNode } from "react";

import { PALETTE_GROUPS, contrast, resolveValue, toHex } from "@tyohnn/theme";

import type { ThemeInfo } from "@/lib/themes";

import { Combobox } from "./combobox";
import { useLocale } from "./locale-provider";
import { useTheme, type Mode } from "./theme-provider";

const download = (name: string, text: string) =>
{
    const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: name });

    link.click();
    URL.revokeObjectURL(url);
};

const Copy = ({ label, text }: { label: string; text: string }) =>
{
    const { t } = useLocale();
    const [done, setDone] = useState(false);

    return (
        <button
            type="button"
            className="th-action"
            onClick={() =>
            {
                void navigator.clipboard.writeText(text).then(() =>
                {
                    setDone(true);
                    setTimeout(() => setDone(false), 1200);
                });
            }}
        >
            {done ? t.copy.copied : label}
        </button>
    );
};

/**
 * One colour: the value as it resolves (an alias shows what it stands for), a picker on the chip and the
 * text as written. The picker speaks hex only, so it replaces the value with one; the text field is how a
 * precise `oklch(…)`, a `color-mix(…)` or an alias is written.
 */
const Swatch = ({ name, mode }: { name: string; mode: Mode }) =>
{
    const { t } = useLocale();
    const theme = useTheme()!;
    const values = theme.display[mode];
    const written = values[name] ?? "";
    const value = resolveValue(values, written);
    const edited = theme.state.edits[mode][name] !== undefined;

    return (
        <div className={edited ? "th-swatch edited" : "th-swatch"}>
            <label className="th-chip" style={{ background: value }}>
                <span className="sr-only">{t.theme.pick(name, t.modeTag[mode])}</span>
                <input type="color" value={toHex(value) ?? "#000000"} onChange={(event) => theme.setColour(mode, name, event.target.value)} />
            </label>
            <label className="th-field">
                <span className="th-name">{name}</span>
                <input
                    type="text"
                    value={theme.state.edits[mode][name] ?? written}
                    spellCheck={false}
                    onChange={(event) => theme.setColour(mode, name, event.target.value)}
                    aria-label={t.theme.fieldLabel(name, t.modeTag[mode])}
                />
            </label>
            {edited && (
                <button type="button" className="th-undo" onClick={() => theme.clearColour(mode, name)} title={t.theme.undoTitle(written === value ? null : value)}>
                    <span className="sr-only">{t.theme.undo(name)}</span>↺
                </button>
            )}
        </div>
    );
};

interface SelectOption
{
    value: string;
    search: string;
    group?: string;
    swatch: ReactNode;
}

/** One row of the colour picks, as shadcn create lays them out: the label over the value, the swatch at the end */
const Select = ({ label, options, value, onChange, display, swatch }: {
    label: string;
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    display?: string;
    swatch?: ReactNode;
}) =>
{
    const { t } = useLocale();

    return (
        <Combobox
            options={options}
            value={value}
            onChange={onChange}
            label={label}
            placeholder={t.theme.search}
            triggerClassName="th-select"
            optionClassName="th-option"
            align="left"
            trigger={<><span><small>{label}</small><b>{display ?? value}</b></span>{swatch}</>}
            renderOption={(option, selected) => (
                <>
                    <b>{option.search}</b>
                    <span className="th-option-end">{option.swatch}{selected ? <i className="check">✓</i> : null}</span>
                </>
            )}
        />
    );
};

/** The button that opens the colour popover, on the pages that have no side panel */
export const ThemeTrigger = ({ mode, open, onToggle }: { mode: Mode; open: boolean; onToggle: () => void }) =>
{
    const { t } = useLocale();
    const theme = useTheme();

    if (!theme) return null;

    const values = theme.display[mode];

    return (
        <button type="button" className="th-trigger" onClick={onToggle} aria-expanded={open}>
            <span className="th-dots" aria-hidden>
                {["background", "primary", "muted", "foreground"].map((name) => (
                    <i key={name} style={{ background: resolveValue(values, values[name] ?? "") }} />
                ))}
            </span>
            {t.theme.trigger}
            {!theme.isOwn && <span className="th-badge">{t.theme.edited}</span>}
        </button>
    );
};

/**
 * The colour panel. Everything in it edits the same 72 names a theme file holds, so what the reader sees
 * in the frames is what `tyohnn theme` would install. With `onClose` it is a popover under its button; without, it is
 * the second tab of the side panel (system-view.tsx), whose children are the intro, the sections and the footer.
 */
export const ThemePanel = ({ systemName, onClose }: { systemName: string; onClose?: () => void }) =>
{
    const { t } = useLocale();
    const theme = useTheme();
    const [mode, setMode] = useState<Mode>("light");
    const [group, setGroup] = useState<string>("base");

    if (!theme) return null;

    const bases = theme.themes.filter((entry) => entry.kind === "base");
    const named = theme.themes.filter((entry) => entry.kind === "theme");
    const accents = theme.themes.filter((entry) => entry.kind === "accent");
    const edits = Object.keys(theme.state.edits.light).length + Object.keys(theme.state.edits.dark).length;

    const dots = (entry: ThemeInfo) => (
        <span className="th-dots" aria-hidden>
            {entry.swatch[mode].map((colour, index) => <i key={index} style={{ background: colour }} />)}
        </span>
    );

    // An accent's swatch is the one colour it moves most; a chart colour's is its ramp.
    const chip = (entry: ThemeInfo) => <span className="th-chip" style={{ background: entry[mode].primary }} aria-hidden />;
    const ramp = (values: Record<string, string>) => (
        <span className="th-dots" aria-hidden>
            {PALETTE_GROUPS.chart.map((name) => <i key={name} style={{ background: resolveValue(values, values[name] ?? "") }} />)}
        </span>
    );

    const NONE = "";
    const palettes = [
        ...named.map((entry) => ({ value: entry.id, search: entry.id, group: `${t.theme.themes} · ${t.theme.themesHint}`, swatch: dots(entry) })),
        ...bases.map((entry) => ({ value: entry.id, search: entry.id, group: `${t.theme.bases} · ${t.theme.basesHint}`, swatch: dots(entry) })),
    ];
    const accentOptions = [
        { value: NONE, search: t.theme.none, swatch: null as ReactNode },
        ...accents.map((entry) => ({ value: entry.id, search: entry.id, swatch: chip(entry) as ReactNode })),
    ];
    const chartOptions = [
        { value: NONE, search: t.theme.chartDefault, swatch: null as ReactNode },
        ...accents.map((entry) => ({ value: entry.id, search: entry.id, swatch: ramp(entry[mode]) as ReactNode })),
    ];

    const intro = t.theme.intro(systemName);
    const content = (
        <>
            <section className="th-selects">
                <Select
                    label={t.theme.palette}
                    options={palettes}
                    value={theme.state.base}
                    onChange={theme.setBase}
                    swatch={palettes.find((option) => option.value === theme.state.base)?.swatch}
                />
                <Select
                    label={t.theme.accent}
                    options={accentOptions}
                    value={theme.state.accent ?? NONE}
                    onChange={(id) => theme.setAccent(id || null)}
                    display={theme.state.accent ?? t.theme.none}
                    swatch={accentOptions.find((option) => option.value === (theme.state.accent ?? NONE))?.swatch}
                />
                <Select
                    label={t.theme.chart}
                    options={chartOptions}
                    value={theme.state.chart ?? NONE}
                    onChange={(id) => theme.setChart(id || null)}
                    display={theme.state.chart ?? t.theme.chartDefault}
                    swatch={ramp(theme.display[mode])}
                />
            </section>

            <section>
                <h4>
                    {t.theme.every}
                    {edits > 0 && (
                        <button type="button" className="th-clear" onClick={theme.clearEdits}>
                            {t.theme.clear(edits)}
                        </button>
                    )}
                    <span className="th-modes">
                        {(["light", "dark"] as Mode[]).map((option) => (
                            <button key={option} type="button" className={mode === option ? "on" : ""} onClick={() => setMode(option)}>{t.mode[option]}</button>
                        ))}
                    </span>
                </h4>
                <div className="th-tabs">
                    {Object.keys(PALETTE_GROUPS).map((id) => (
                        <button key={id} type="button" className={group === id ? "on" : ""} onClick={() => setGroup(id)}>
                            {t.theme.groups[id] ?? id}
                        </button>
                    ))}
                </div>
                <div className="th-grid">
                    {PALETTE_GROUPS[group as keyof typeof PALETTE_GROUPS].map((name) => <Swatch key={name} name={name} mode={mode} />)}
                </div>
            </section>

            <footer>
                <Copy label={t.theme.copyCss} text={theme.css ?? ""} />
                <button type="button" className="th-action" onClick={() => download(`${theme.theme.name}.json`, `${JSON.stringify(theme.theme, null, 4)}\n`)}>{t.theme.download}</button>
                <Copy label={t.theme.copyInstall} text={`npx tyohnn@latest init --system ${systemName} --theme ${theme.link}`} />
                <Copy label={t.theme.copyShare} text={typeof window === "undefined" ? "" : window.location.href} />
                <button type="button" className="th-action ghost" onClick={theme.reset} disabled={theme.isOwn} title={t.theme.resetTitle}>{t.theme.resetAll}</button>
            </footer>
        </>
    );

    if (!onClose) return <><p className="side-intro">{intro}</p>{content}</>;

    return (
        <aside className="th-panel" aria-label={t.theme.title}>
            <header>
                <div>
                    <b>{t.theme.title}</b>
                    <small>{intro}</small>
                </div>
                <button type="button" className="th-close" onClick={onClose} aria-label={t.theme.close}>×</button>
            </header>
            {content}
        </aside>
    );
};

/** The panel as a popover under its button, for the pages with no column to put it in (compare, components) */
export const ThemeEditor = ({ systemName }: { systemName: string }) =>
{
    const [open, setOpen] = useState(false);

    return (
        <div className="th-root">
            <ThemeTrigger mode="light" open={open} onToggle={() => setOpen(!open)} />
            {open && <ThemePanel systemName={systemName} onClose={() => setOpen(false)} />}
        </div>
    );
};

/** The ratio the editor shows next to a pair, for tests and future inline hints. */
export const ratio = (values: Record<string, string>, foreground: string, background: string) =>
    contrast(resolveValue(values, values[foreground]), resolveValue(values, values[background]));
