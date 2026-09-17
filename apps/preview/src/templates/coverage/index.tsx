import { basicSections } from "./basics";
import { chatSections } from "./chat";
import { dataSections } from "./data";
import { displaySections } from "./display";
import { formSections } from "./forms";
import { type CoverageSection, NoMotion } from "./frame";
import { COVERAGE_GROUPS, COVERAGE_POPUP_SECTIONS } from "./groups";
import { menuSections } from "./menus";
import { overlaySections } from "./overlays";

/**
 * Every registry/ui component, section by section: variants, sizes and the main states (disabled,
 * invalid, checked, selected, open). The page is laid out at a fixed width with fixed dates and no
 * randomness, so two apps render it the same way.
 *
 * - `?template=coverage` renders every section; popups stay closed there.
 * - `?template=coverage&section=<name>` renders one section and opens its popups (`defaultOpen`), which
 *   are then measured through the section's `portals` selectors.
 *
 * Each section element carries `data-coverage-section`, `data-coverage-components` and
 * `data-coverage-portals` (selectors joined with `|`) for tooling/snapshot/compare-shadcn.mjs.
 */
export const COVERAGE_SECTIONS: CoverageSection[] = [
    ...basicSections,
    ...formSections,
    ...displaySections,
    ...dataSections,
    ...overlaySections,
    ...menuSections,
    ...chatSections,
];

/** groups.ts is the data-only copy of COVERAGE_SECTIONS the site reads; a drift fails the coverage render. */
const driftError = () =>
{
    const listed = COVERAGE_GROUPS.flatMap((group) => group.sections).join(" ");
    const rendered = COVERAGE_SECTIONS.map((entry) => entry.name).join(" ");
    const popups = COVERAGE_SECTIONS.filter((entry) => (entry.portals ?? []).length > 0).map((entry) => entry.name).join(" ");

    if (listed !== rendered) return `coverage/groups.ts lists "${listed}" but the page renders "${rendered}"`;
    if (COVERAGE_POPUP_SECTIONS.join(" ") !== popups) return `COVERAGE_POPUP_SECTIONS should be "${popups}"`;

    return null;
};

export const Coverage = ({ section }: { section?: string | null }) =>
{
    const drift = driftError();

    if (drift) throw new Error(drift);

    const selected = section ? COVERAGE_SECTIONS.filter((entry) => entry.name === section) : COVERAGE_SECTIONS;

    return (
        <main data-template="coverage" data-specimen="coverage" className="mx-auto flex w-[1100px] flex-col gap-12 px-6 py-10">
            <NoMotion />
            {selected.length === 0 && <p>Unknown section “{section}”. Known: {COVERAGE_SECTIONS.map((entry) => entry.name).join(", ")}</p>}
            {selected.map((entry) => (
                <section
                    key={entry.name}
                    data-coverage-section={entry.name}
                    data-coverage-components={entry.components.join(" ")}
                    data-coverage-portals={(entry.portals ?? []).join("|")}
                    className="flex flex-col gap-4"
                >
                    <h2 className="text-xs text-muted-foreground uppercase">{entry.name}</h2>
                    <div className="flex flex-col gap-6">{entry.render(Boolean(section))}</div>
                </section>
            ))}
        </main>
    );
};
