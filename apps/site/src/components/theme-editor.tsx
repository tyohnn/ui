"use client";

import { useState } from "react";

import { PALETTE_GROUPS, contrast, resolveValue, toHex } from "@tyohnn/theme";

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

    const pick = (entry: typeof theme.themes[number]) => (
        <button
            key={entry.id}
            type="button"
            className={theme.state.base === entry.id ? "th-pick on" : "th-pick"}
            onClick={() => theme.setBase(entry.id)}
            title={entry.title}
        >
            <span className="th-dots" aria-hidden>
                {entry.swatch[mode].map((colour, index) => <i key={index} style={{ background: colour }} />)}
            </span>
            {entry.id}
        </button>
    );

    const intro = t.theme.intro(systemName);
    const content = (
        <>
            <section>
                <h4>{t.theme.themes} <small>{t.theme.themesHint}</small></h4>
                <div className="th-row">{named.map(pick)}</div>
            </section>

            <section>
                <h4>{t.theme.bases} <small>{t.theme.basesHint}</small></h4>
                <div className="th-row">{bases.map(pick)}</div>
            </section>

            <section>
                <h4>{t.theme.accent} <small>{t.theme.accentHint}</small></h4>
                <div className="th-row">
                    <button type="button" className={theme.state.accent === null ? "th-pick on" : "th-pick"} onClick={() => theme.setAccent(null)}>{t.theme.none}</button>
                    {accents.map((entry) => (
                        <button
                            key={entry.id}
                            type="button"
                            className={theme.state.accent === entry.id ? "th-pick on" : "th-pick"}
                            onClick={() => theme.setAccent(entry.id)}
                        >
                            <span className="th-chip" style={{ background: entry[mode].primary }} aria-hidden />
                            {entry.id}
                        </button>
                    ))}
                </div>
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

            {theme.warnings.length > 0 && (
                <section className="th-warn">
                    <h4>{t.theme.warnTitle}</h4>
                    <ul>
                        {theme.warnings.slice(0, 6).map((row) => (
                            <li key={`${row.mode}-${row.foreground}`}>
                                {t.theme.warn(<code>--{row.foreground}</code>, <code>--{row.background}</code>, row.ratio, t.modeTag[row.mode])}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

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
