"use client";

import { useState, type ReactNode } from "react";

import { PALETTE_GROUPS, contrast, decodePreset, resolveValue, type Preset } from "@tyohnn/theme";

import type { TailwindFamily, ThemeInfo } from "@/lib/themes";

import { TokenEditor } from "./colour-tokens";
import { Combobox } from "./combobox";
import { CopyCommand } from "./copy-command";
import { useLocale } from "./locale-provider";
import { stateHash, useTheme, type Mode } from "./theme-provider";

const download = (name: string, text: string) =>
{
    const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: name });

    link.click();
    URL.revokeObjectURL(url);
};

const Copy = ({ label, text, className = "th-action" }: { label: string; text: string; className?: string }) =>
{
    const { t } = useLocale();
    const [done, setDone] = useState(false);

    return (
        <button
            type="button"
            className={className}
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

/** "Open preset": a button that becomes a field for a code, and opens it on Enter */
const OpenPreset = ({ onOpen }: { onOpen: (preset: Preset) => void }) =>
{
    const { t } = useLocale();
    const theme = useTheme()!;
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState("");
    const [wrong, setWrong] = useState(false);

    if (!editing)
    {
        return <button type="button" className="th-action wide" onClick={() => setEditing(true)} disabled={!theme.presets}>{t.theme.openPreset}</button>;
    }

    const submit = () =>
    {
        const preset = theme.presets ? decodePreset(theme.presets, text) : null;

        if (!preset) return setWrong(true);

        onOpen(preset);
        setEditing(false);
        setText("");
    };

    return (
        <form className={wrong ? "th-open wrong" : "th-open"} onSubmit={(event) => { event.preventDefault(); submit(); }}>
            <input
                autoFocus
                value={text}
                placeholder="--preset 1a2b0"
                spellCheck={false}
                aria-label={t.theme.openPreset}
                onChange={(event) => { setText(event.target.value); setWrong(false); }}
                onKeyDown={(event) => { if (event.key === "Escape") setEditing(false); }}
            />
            <button type="submit">{t.theme.open}</button>
            {wrong && <small role="alert">{t.theme.notACode}</small>}
        </form>
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
export const ThemePanel = ({
    systemName,
    variant = "lite",
    families = [],
    onClose,
    onOtherSystem,
    onShuffle,
}: {
    systemName: string;
    /**
     * lite: palette and accent, then a way on to Create (the system, compare and components pages, where colour is
     * something to try). full: everything, and the only place a preset code comes from (the create page).
     */
    variant?: "lite" | "full";
    /** Tailwind's palette, for the full variant's colour picker */
    families?: TailwindFamily[];
    onClose?: () => void;
    /** A preset opened for another system: the page decides how to get there (a link, or a switch in place) */
    onOtherSystem?: (preset: Preset) => void;
    /** Shuffle the system too (the create page); without it Shuffle changes colours only */
    onShuffle?: () => void;
}) =>
{
    const { t, href } = useLocale();
    const theme = useTheme();
    const [getCode, setGetCode] = useState(false);
    // The swatches in the picks show light: the colour a palette is known by
    const mode: Mode = "light";

    if (!theme) return null;

    const bases = theme.themes.filter((entry) => entry.kind === "base");
    const named = theme.themes.filter((entry) => entry.kind === "theme");
    const accents = theme.themes.filter((entry) => entry.kind === "accent");
    const full = variant === "full";
    // Create opens on this system wearing what is showing here, hand edits and all
    const toCreate = `${href("/create")}#system=${systemName}${theme.isOwn ? "" : `&${stateHash(theme.state)}`}`;

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

    const install = theme.code ? `npx tyohnn@latest init --preset ${theme.code}` : `npx tyohnn@latest init --system ${systemName} --theme ${theme.link}`;

    const open = (preset: Preset) =>
    {
        if (preset.system !== systemName && onOtherSystem) return onOtherSystem(preset);

        theme.setPicks({ base: preset.palette, accent: preset.accent, chart: preset.chart }, preset.edits);
    };

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
                {full && <Select
                    label={t.theme.chart}
                    options={chartOptions}
                    value={theme.state.chart ?? NONE}
                    onChange={(id) => theme.setChart(id || null)}
                    display={theme.state.chart ?? t.theme.chartDefault}
                    swatch={ramp(theme.display[mode])}
                />}
            </section>

            {full && <TokenEditor families={families} />}

            {!full && (
                <footer className="th-preset">
                    <p className="side-intro">{t.theme.moreInCreate}</p>
                    <a className="th-action wide primary" href={toCreate}>{t.theme.continueInCreate}</a>
                    <button type="button" className="th-action ghost" onClick={theme.reset} disabled={theme.isOwn} title={t.theme.resetTitle}>{t.theme.resetAll}</button>
                </footer>
            )}

            {full && <footer className="th-preset">
                {getCode && (
                    <div className="th-get">
                        <b>{t.theme.getCodeTitle}</b>
                        <small>{t.theme.getCodeHint}</small>
                        <CopyCommand command={install} />
                        <div className="th-get-row">
                            <Copy label={t.theme.copyCss} text={theme.css ?? ""} />
                            <button type="button" className="th-action" onClick={() => download(`${theme.theme.name}.json`, `${JSON.stringify(theme.theme, null, 4)}\n`)}>{t.theme.download}</button>
                            <Copy label={t.theme.copyShare} text={typeof window === "undefined" ? "" : window.location.href} />
                        </div>
                    </div>
                )}
                {theme.code
                    ? <Copy label={`--preset ${theme.code}`} text={`--preset ${theme.code}`} className="th-code" />
                    : null}
                <OpenPreset onOpen={open} />
                <button type="button" className="th-action wide" onClick={onShuffle ?? theme.shuffle}>{t.theme.shuffle}</button>
                <button type="button" className="th-action wide primary" aria-expanded={getCode} onClick={() => setGetCode(!getCode)}>{t.theme.getCode}</button>
                <button type="button" className="th-action ghost" onClick={theme.reset} disabled={theme.isOwn} title={t.theme.resetTitle}>{t.theme.resetAll}</button>
            </footer>}
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
