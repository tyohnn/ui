import { Suspense } from "react";

import { type CompareFacts, CompareView } from "@/components/compare-view";
import { getMessages, type Locale, localizeSystems } from "@/lib/i18n";
import { getSystems } from "@/lib/registry";
import { summarize } from "@/lib/site";
import { readThemes, systemThemes } from "@/lib/themes";

export function ComparePageView({ locale }: { locale: Locale })
{
    const t = getMessages(locale);
    const systems = localizeSystems(locale, getSystems());
    const facts: CompareFacts[] = systems.map((system) => ({
        name: system.name,
        character: system.character,
        sans: system.fonts.sans.family,
        heading: system.fonts.heading?.family ?? system.fonts.sans.family,
        icons: system.icons.id,
        defaultMode: system.defaultMode,
    }));

    return (
        <>
            <div className="page-head">
                <div>
                    <div className="eyebrow">{t.compare.eyebrow}</div>
                    <h1>{t.compare.title}</h1>
                    <p>{t.compare.body}</p>
                </div>
            </div>
            <Suspense>
                <CompareView systems={systems.map(summarize)} facts={facts} themes={readThemes()} owns={systemThemes()} />
            </Suspense>
        </>
    );
}
