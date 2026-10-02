"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";

import { getMessages, labelsOf, localeHref, type Locale, type Messages } from "@/lib/i18n";

interface LocaleValue
{
    locale: Locale;
    t: Messages;
    labels: ReturnType<typeof labelsOf>;
    /** A site path in this locale: "/compare" → "/ko/compare" */
    href: (path: string) => string;
}

const Context = createContext<LocaleValue | null>(null);

/**
 * The page's locale for client components. Only the locale crosses from the server (the words hold JSX and
 * functions, which cannot), and each locale's words are bundled here.
 */
export const LocaleProvider = ({ locale, children }: { locale: Locale; children: ReactNode }) =>
{
    const value = useMemo<LocaleValue>(() => ({
        locale,
        t: getMessages(locale),
        labels: labelsOf(locale),
        href: (path) => localeHref(locale, path),
    }), [locale]);

    return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useLocale = (): LocaleValue =>
{
    const value = useContext(Context);

    if (!value) throw new Error("useLocale needs a LocaleProvider above it");

    return value;
};
