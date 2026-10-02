// Shared by server and client components: no Node imports here.

export const LOCALES = ["en", "ko"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** English lives at the root, as it always has; Korean lives under /ko */
const PREFIX: Record<Locale, string> = { en: "", ko: "/ko" };

/** The address of a site path ("/", "/#systems", "/compare?a=x", "/systems/vega") in a locale */
export const localeHref = (locale: Locale, path: string): string =>
{
    const prefix = PREFIX[locale];

    if (!prefix) return path;

    // "/" and "/#systems" and "/?a=b" keep the prefix bare: /ko, /ko#systems, /ko?a=b
    return path === "/" ? prefix : /^\/[#?]/.test(path) ? `${prefix}${path.slice(1)}` : `${prefix}${path}`;
};

/** The locale a pathname belongs to, and the path without its locale prefix */
export const splitPathname = (pathname: string): { locale: Locale; path: string } =>
{
    if (pathname === "/ko" || pathname.startsWith("/ko/")) return { locale: "ko", path: pathname.slice("/ko".length) || "/" };

    return { locale: "en", path: pathname };
};

export const otherLocale = (locale: Locale): Locale => (locale === "en" ? "ko" : "en");
