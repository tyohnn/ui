// Shared by server and client components: no Node imports here.

import { en, type Messages } from "./en";
import { ko } from "./ko";
import type { Locale } from "./locale";

import type { SystemInfo } from "../site";

export { DEFAULT_LOCALE, LOCALES, localeHref, otherLocale, splitPathname, type Locale } from "./locale";
export type { Messages } from "./en";

const MESSAGES: Record<Locale, Messages> = { en, ko };

export const getMessages = (locale: Locale): Messages => MESSAGES[locale];

/** A registry system as the locale words it: the description and tagline replaced where the locale has its own */
export type LocalizedSystem = SystemInfo & { character: string };

export const localizeSystems = (locale: Locale, systems: SystemInfo[]): LocalizedSystem[] =>
    systems.map((system) =>
    {
        const text = MESSAGES[locale].systems[system.name];

        return {
            ...system,
            description: text?.description ?? system.description,
            tagline: text?.tagline ?? system.tagline,
            // English has no hand-written line: the description up to its first colon is the character
            character: text?.character ?? system.description.split(":")[0].trim(),
        };
    });

/** The words a locale puts on the registry's own labels: screen categories, screen names, coverage groups, frame tokens */
export const labelsOf = (locale: Locale) =>
{
    const { labels } = MESSAGES[locale];

    return {
        category: (id: string, fallback: string) => labels.categories[id] ?? fallback,
        screen: (id: string, fallback: string) => labels.screens[id] ?? fallback,
        section: (id: string) => labels.sections[id] ?? id,
        coverageGroup: (id: string, fallback: string) => labels.coverageGroups[id] ?? fallback,
        frameGroup: (id: string, fallback: { title: string; hint: string }) => labels.frameGroups[id] ?? fallback,
    };
};
