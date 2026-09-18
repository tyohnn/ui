"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { PALETTE, checkContrast, encodeTheme, themeToCss, type Theme } from "@tyohnn/theme";

import type { ThemeInfo } from "@/lib/themes";

export type Mode = "light" | "dark";

/** What the editor is showing: a base, an accent over it, and any colour the reader has changed by hand. */
export interface ThemeState
{
    base: string;
    accent: string | null;
    edits: { light: Record<string, string>; dark: Record<string, string> };
}

interface ThemeValue
{
    themes: ThemeInfo[];
    /** The system's own theme id, so "reset" means something */
    own: string;
    state: ThemeState;
    /** The palette the panel shows: always the whole 72, even before anything is changed */
    display: { light: Record<string, string>; dark: Record<string, string> };
    /** null while the state is the system's own theme: the frames are then left exactly as built */
    colours: { light: Record<string, string>; dark: Record<string, string> } | null;
    css: string | null;
    warnings: ReturnType<typeof checkContrast>;
    theme: Theme;
    link: string;
    setBase: (id: string) => void;
    setAccent: (id: string | null) => void;
    setColour: (mode: Mode, name: string, value: string) => void;
    /** Put one colour back to what the base and accent say */
    clearColour: (mode: Mode, name: string) => void;
    /** Keep the base and accent, drop every hand edit */
    clearEdits: () => void;
    reset: () => void;
    isOwn: boolean;
}

const Context = createContext<ThemeValue | null>(null);

/** The editor's state, or null on a page without the editor. */
export const useTheme = () => useContext(Context);

const empty = () => ({ light: {}, dark: {} });

const compose = (themes: ThemeInfo[], state: ThemeState) =>
{
    const base = themes.find((entry) => entry.id === state.base);
    const accent = state.accent ? themes.find((entry) => entry.id === state.accent) : undefined;
    const merge = (mode: Mode) => ({ ...base?.[mode], ...accent?.[mode], ...state.edits[mode] });

    return { light: merge("light"), dark: merge("dark") };
};

/** The theme as it would be written down: the layers it extends, plus the colours changed by hand. */
const themeOf = (state: ThemeState): Theme => ({
    name: state.accent ? `${state.base}-${state.accent}` : state.base,
    title: state.accent ? `${state.base} + ${state.accent}` : state.base,
    extends: state.accent ? { base: state.base, accent: state.accent } : { base: state.base },
    light: state.edits.light,
    dark: state.edits.dark,
});

const HASH_KEY = "theme";

const readHash = (): ThemeState | null =>
{
    if (typeof window === "undefined") return null;

    const found = new URLSearchParams(window.location.hash.slice(1)).get(HASH_KEY);

    if (!found) return null;

    try
    {
        const parsed = JSON.parse(atob(found.replace(/-/g, "+").replace(/_/g, "/"))) as ThemeState;

        return parsed.base ? { base: parsed.base, accent: parsed.accent ?? null, edits: { light: parsed.edits?.light ?? {}, dark: parsed.edits?.dark ?? {} } } : null;
    }
    catch
    {
        return null;
    }
};

const writeHash = (state: ThemeState | null) =>
{
    const params = new URLSearchParams(window.location.hash.slice(1));

    if (state) params.set(HASH_KEY, btoa(JSON.stringify(state)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""));
    else params.delete(HASH_KEY);

    const hash = params.toString();

    history.replaceState(null, "", hash ? `#${hash}` : window.location.pathname + window.location.search);
};

/**
 * Holds the colours the page is showing and puts them into every preview iframe on it. Every frame gets the
 * same palette, which is what makes a side-by-side comparison about the feel rather than the colour.
 *
 * The frames are same-origin, so a stylesheet can be written straight into their documents — the same
 * `:root` / `.dark` blocks the CLI would generate, in the same place in the cascade, which is why a
 * change lands instantly and looks exactly like a build would.
 */
export const ThemeProvider = ({ themes, own, always = false, children }: { themes: ThemeInfo[]; own: string; always?: boolean; children: ReactNode }) =>
{
    const [state, setState] = useState<ThemeState>({ base: own, accent: null, edits: empty() });
    const [ready, setReady] = useState(false);

    useEffect(() =>
    {
        setState(readHash() ?? { base: own, accent: null, edits: empty() });
        setReady(true);
    }, [own]);

    const isOwn = state.base === own && !state.accent && Object.keys(state.edits.light).length === 0 && Object.keys(state.edits.dark).length === 0;
    const display = useMemo(() => compose(themes, state), [themes, state]);
    // `always` is for a page comparing two systems: both sides wear the same colours from the start, so what
    // is left between them is the feel. Elsewhere the frames are left exactly as built until something changes.
    const colours = isOwn && !always ? null : display;
    const css = useMemo(() => colours ? themeToCss({ name: "editor", title: "editor", ...colours }) : null, [colours]);

    useEffect(() =>
    {
        if (ready) writeHash(isOwn ? null : state);
    }, [ready, isOwn, state]);

    // Paint every frame on the page, now and as frames arrive
    const painted = useRef(css);

    painted.current = css;

    const paint = useCallback((frame: HTMLIFrameElement) =>
    {
        const doc = frame.contentDocument;

        if (!doc?.head) return;

        const existing = doc.getElementById("tyohnn-editor-theme");

        if (!painted.current)
        {
            existing?.remove();

            return;
        }

        const style = existing ?? Object.assign(doc.createElement("style"), { id: "tyohnn-editor-theme" });

        style.textContent = painted.current;
        if (!existing) doc.head.append(style);
    }, []);

    const watched = useRef(new WeakSet<HTMLIFrameElement>());

    useEffect(() =>
    {
        const apply = () => [...document.querySelectorAll("iframe")].forEach((frame) =>
        {
            paint(frame);

            // A frame is only subscribed once, however often the page mutates around it.
            if (watched.current.has(frame)) return;

            watched.current.add(frame);
            frame.addEventListener("load", () => paint(frame));
        });

        apply();

        const observer = new MutationObserver(apply);

        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, [css, paint]);

    const value = useMemo<ThemeValue>(() =>
    {
        const theme = themeOf(state);

        return {
            themes,
            own,
            state,
            display,
            colours,
            css,
            warnings: checkContrast({ name: "editor", title: "editor", ...display }),
            theme,
            link: encodeTheme(theme),
            isOwn,
            setBase: (id) => setState((current) => ({ ...current, base: id })),
            setAccent: (id) => setState((current) => ({ ...current, accent: id })),
            setColour: (mode, name, colour) => setState((current) =>
            {
                if (!PALETTE.includes(name)) return current;

                const edits = { ...current.edits, [mode]: { ...current.edits[mode], [name]: colour } };

                return { ...current, edits };
            }),
            clearColour: (mode, name) => setState((current) =>
            {
                const { [name]: gone, ...rest } = current.edits[mode];

                return { ...current, edits: { ...current.edits, [mode]: rest } };
            }),
            clearEdits: () => setState((current) => ({ ...current, edits: empty() })),
            reset: () => setState({ base: own, accent: null, edits: empty() }),
        };
    }, [themes, own, state, display, colours, css, isOwn]);

    return <Context.Provider value={value}>{children}</Context.Provider>;
};
