import { ComponentsView } from "@/components/components-view";
import { type Locale, localizeSystems } from "@/lib/i18n";
import { getComponentCount, getSystems } from "@/lib/registry";
import { summarize } from "@/lib/site";
import { readThemes, systemThemes } from "@/lib/themes";

export function ComponentsPageView({ locale }: { locale: Locale })
{
    return (
        <ComponentsView
            systems={localizeSystems(locale, getSystems()).map(summarize)}
            components={getComponentCount()}
            themes={readThemes()}
            owns={systemThemes()}
        />
    );
}
