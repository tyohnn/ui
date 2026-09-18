import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SystemView } from "@/components/system-view";
import { ThemeProvider } from "@/components/theme-provider";
import { getSystem, getSystems } from "@/lib/registry";
import { summarize } from "@/lib/site";
import { readThemes, systemThemes } from "@/lib/themes";

export const dynamicParams = false;

export const generateStaticParams = () => getSystems().map((system) => ({ name: system.name }));

type Props = { params: Promise<{ name: string }> };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> =>
{
    const system = getSystem((await params).name);

    return system ? { title: system.name, description: system.description } : {};
};

export default async function SystemPage({ params }: Props)
{
    const { name } = await params;
    const system = getSystem(name);

    if (!system) notFound();

    // Neighbours in name order, wrapping around.
    const names = getSystems().map((entry) => entry.name).sort();
    const index = names.indexOf(system.name);
    const previous = names[(index - 1 + names.length) % names.length];
    const next = names[(index + 1) % names.length];

    const specs: [string, string][] = [
        ["Sans", system.fonts.sans.family],
        ["Heading", system.fonts.heading?.family ?? system.fonts.sans.family],
        ["Icons", system.icons.id],
        ["Hangul", system.fonts.hangulFallback.family],
        ["Default", system.defaultMode === "dark" ? "Dark" : "Light"],
    ];

    const themes = readThemes();
    const own = systemThemes()[system.name] ?? system.name;

    return (
        <ThemeProvider themes={themes} own={own}>
            <nav className="crumbs" aria-label="Breadcrumb">
                <Link href="/#systems">Systems</Link>
                <span aria-hidden>/</span>
                <span>{system.name}</span>
            </nav>
            <SystemView
                system={summarize(system)}
                previous={previous}
                next={next}
                intro={(
                    <div>
                        <h1 className="sys-name" style={{ fontFamily: system.nameFont }}>{system.name}</h1>
                        <p className="sys-desc">{system.description}</p>
                        <dl className="specs">
                            {specs.map(([label, value]) => [<dt key={`${label}-k`}>{label}</dt>, <dd key={`${label}-v`}>{value}</dd>])}
                        </dl>
                    </div>
                )}
            />
        </ThemeProvider>
    );
}
