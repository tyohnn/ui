"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FRAME_TOKEN_GROUPS } from "../../../../registry/blocks/lib/frame";

import { useLocale } from "./locale-provider";

/**
 * The frame tokens the page is trying — how far a page stands from its edge, the room between its blocks, a reading
 * column's width, an aside's — and the same values in every preview iframe on it. Like the colours, the frames are
 * same-origin, so a stylesheet is written straight into their documents: a slider moves every screen at once.
 *
 * Nothing is kept while every value is the default; the frames are then exactly as built.
 */
export const useFrameTokens = () =>
{
    const [values, setValues] = useState<Record<string, number>>({});
    const css = useMemo(
        () => (Object.keys(values).length === 0 ? null : `:root {\n${Object.entries(values).map(([name, rem]) => `    ${name}: ${rem}rem;`).join("\n")}\n}`),
        [values],
    );
    const painted = useRef(css);

    painted.current = css;

    const paint = useCallback((frame: HTMLIFrameElement) =>
    {
        const doc = frame.contentDocument;

        if (!doc?.head) return;

        const existing = doc.getElementById("tyohnn-editor-frames");

        if (!painted.current)
        {
            existing?.remove();

            return;
        }

        const style = existing ?? Object.assign(doc.createElement("style"), { id: "tyohnn-editor-frames" });

        style.textContent = painted.current;
        if (!existing) doc.head.append(style);
    }, []);

    const watched = useRef(new WeakSet<HTMLIFrameElement>());

    useEffect(() =>
    {
        const apply = () => [...document.querySelectorAll("iframe")].forEach((frame) =>
        {
            paint(frame);

            if (watched.current.has(frame)) return;

            watched.current.add(frame);
            frame.addEventListener("load", () => paint(frame));
        });

        apply();

        const observer = new MutationObserver(apply);

        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, [css, paint]);

    return {
        values,
        css,
        changed: Object.keys(values).length,
        /** What a preview opened on its own takes in `&frames=`: the values, or just "show the panel" */
        param: Object.keys(values).length === 0 ? "1" : encodeURIComponent(JSON.stringify(values)),
        set: (name: string, rem: number, initial: number) => setValues((current) =>
        {
            const { [name]: _dropped, ...rest } = current;

            return rem === initial ? rest : { ...rest, [name]: rem };
        }),
        reset: () => setValues({}),
    };
};

export type FrameTokens = ReturnType<typeof useFrameTokens>;

const Copy = ({ label, text, disabled }: { label: string; text: string; disabled?: boolean }) =>
{
    const { t } = useLocale();
    const [done, setDone] = useState(false);

    return (
        <button
            type="button"
            className="th-action"
            disabled={disabled}
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
 * The layout panel: every frame token by axis with a slider. The tokens and their defaults are read out of the
 * frames' own classes (registry/blocks/lib/frame.ts), so what the reader moves here is what a system or a product
 * would declare.
 */
export const FrameEditor = ({ frames }: { frames: FrameTokens }) =>
{
    const { t, labels } = useLocale();
    const [open, setOpen] = useState(false);

    return (
        <div className="th-root">
            <button type="button" className="th-trigger fr-trigger" onClick={() => setOpen(!open)} aria-expanded={open}>
                {t.frames.trigger}
                {frames.changed > 0 && <span className="th-badge">{t.frames.edited}</span>}
            </button>

            {open && (
                <div className="th-panel fr-panel">
                    <header>
                        <div>
                            <b>{t.frames.title}</b>
                            <small>{t.frames.intro}</small>
                        </div>
                        <button type="button" className="th-close" onClick={() => setOpen(false)} aria-label={t.frames.close}>×</button>
                    </header>

                    {FRAME_TOKEN_GROUPS.map((group) =>
                    {
                        const text = labels.frameGroup(group.id, group);

                        return (
                            <section key={group.id}>
                                <h4>{text.title} <small>{text.hint}</small></h4>
                                <div className="fr-grid">
                                    {group.tokens.map((token) =>
                                    {
                                        const value = frames.values[token.name] ?? token.rem;
                                        const edited = frames.values[token.name] !== undefined;

                                        return (
                                            <label key={token.name} className={edited ? "fr-token edited" : "fr-token"}>
                                                <span className="th-name">{token.name}</span>
                                                <span className="fr-value">{value}rem · {Math.round(value * 16)}px</span>
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={group.max}
                                                    step={group.step}
                                                    value={value}
                                                    onChange={(event) => frames.set(token.name, Number(event.target.value), token.rem)}
                                                />
                                            </label>
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })}

                    <footer>
                        <Copy label={t.frames.copyCss} text={frames.css ?? ""} disabled={frames.changed === 0} />
                        <button type="button" className="th-action ghost" onClick={frames.reset} disabled={frames.changed === 0} title={t.frames.resetTitle}>{t.frames.resetAll}</button>
                    </footer>
                </div>
            )}
        </div>
    );
};
