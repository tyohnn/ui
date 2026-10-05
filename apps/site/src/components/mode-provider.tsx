"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { Mode } from "@/lib/site";

const KEY = "tyohnn-preview-mode";

interface ModeValue
{
    mode: Mode;
    setMode: (mode: Mode) => void;
}

const Context = createContext<ModeValue | null>(null);

/**
 * The one light/dark mode every preview on the site is shown in — the hero split, the taste specimens, the
 * gallery, the system, components and compare pages. It starts light, is remembered per browser, and is mirrored
 * on <html data-preview-mode> so server-rendered CSS (the specimens) can follow it without client code.
 */
export const ModeProvider = ({ children }: { children: ReactNode }) =>
{
    const [mode, setState] = useState<Mode>("light");

    useEffect(() =>
    {
        try
        {
            const saved = window.localStorage.getItem(KEY);

            if (saved === "light" || saved === "dark") setState(saved);
        }
        catch
        {
            // Storage can be blocked; the default stands.
        }
    }, []);

    useEffect(() =>
    {
        document.documentElement.dataset.previewMode = mode;
    }, [mode]);

    const setMode = useCallback((next: Mode) =>
    {
        setState(next);

        try
        {
            window.localStorage.setItem(KEY, next);
        }
        catch
        {
            // Not remembered, still applied.
        }
    }, []);

    const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

    return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useMode = (): ModeValue =>
{
    const value = useContext(Context);

    if (!value) throw new Error("useMode needs a ModeProvider above it");

    return value;
};
