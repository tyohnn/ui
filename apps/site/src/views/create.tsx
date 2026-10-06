import { Suspense } from "react";

import { CreateView } from "@/components/create-view";
import { type Locale, localizeSystems } from "@/lib/i18n";
import { getSystems } from "@/lib/registry";
import { summarize } from "@/lib/site";
import { readPresetLists, readTailwindColours, readThemes, systemThemes } from "@/lib/themes";

export function CreatePageView({ locale }: { locale: Locale })
{
    const presets = readPresetLists();
    const all = localizeSystems(locale, getSystems());
    // tyohnn's own systems first, then the shadcn ports: the order the preset lists keep
    const systems = presets.systems.map((name) => all.find((system) => system.name === name)).filter((system) => system !== undefined);

    return (
        <Suspense>
            <CreateView systems={systems.map(summarize)} themes={readThemes()} owns={systemThemes()} presets={presets} families={readTailwindColours()} />
        </Suspense>
    );
}
