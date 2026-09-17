import * as icons from "@tyohnn/icons";
import { ICON_NAMES, type IconComponent } from "@tyohnn/ui/icons/names";

const library = icons as unknown as Partial<Record<string, IconComponent>>;

/**
 * Every semantic icon of the started system's library (`?template=icons`). A name the library does not
 * export shows as "missing" with data-missing, so a trial build with ICONS=<library> is checked by eye
 * and by `[data-missing]`. Sizes and colours are layout utilities only.
 */
export const IconSheet = () => (
    <main data-template="icons" className="mx-auto flex min-h-dvh max-w-6xl flex-col justify-center gap-6 px-6 py-12">
        <div data-specimen="icons" className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {ICON_NAMES.map((name) =>
            {
                const Icon = library[name];

                return (
                    <div key={name} data-missing={Icon ? undefined : ""} className="flex flex-col items-center gap-2 rounded-md border p-3 text-xs">
                        {Icon ? <Icon className="size-6" /> : <span className="text-destructive">missing</span>}
                        <span className="text-muted-foreground">{name}</span>
                    </div>
                );
            })}
        </div>
    </main>
);
