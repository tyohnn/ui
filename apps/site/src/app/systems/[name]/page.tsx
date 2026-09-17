import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@tyohnn/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tyohnn/components/card";

import { CopyCommand } from "@/components/copy-command";
import { SystemViewer } from "@/components/system-viewer";
import { getFontIds, getIconLibraries, getSystem, getSystems } from "@/lib/registry";

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

    const systems = getSystems();
    const index = systems.indexOf(system);
    const previous = systems[(index - 1 + systems.length) % systems.length];
    const next = systems[(index + 1) % systems.length];
    const otherIcons = getIconLibraries().find((library) => library.id !== system.icons.id)!;
    const otherFont = getFontIds().find((id) => id !== system.fonts.sans.id && id !== system.fonts.hangulFallback.id && id !== "playfair-display")!;

    const facts: [string, string][] = [
        ["Sans", system.fonts.sans.family],
        ["Heading", system.fonts.heading?.family ?? "Same as sans"],
        ["Mono", system.fonts.mono?.family ?? "Platform monospace"],
        ["Hangul fallback", system.fonts.hangulFallback.family],
        ["Icons", `${system.icons.label} (${system.icons.packages.join(", ")})`],
        ["Default mode", system.defaultMode],
    ];

    return (
        <div className="flex flex-col gap-8 pt-8">
            <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Systems</Link>
                <span aria-hidden> / </span>
                <span className="text-foreground">{system.name}</span>
            </nav>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
                <section className="flex min-w-0 flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight">{system.name}</h1>
                        <p className="max-w-2xl text-sm">{system.description}</p>
                        <p className="text-xs text-muted-foreground" data-origin="">{system.origin}</p>
                        {system.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {system.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                            </div>
                        )}
                    </div>
                    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-1.5 border-t pt-4 text-xs">
                        {facts.map(([label, value]) => (
                            <div key={label} className="contents">
                                <dt className="text-muted-foreground">{label}</dt>
                                <dd className="break-words">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                <Card className="min-w-0">
                    <CardHeader>
                        <CardTitle>Install</CardTitle>
                        <CardDescription>The CLI copies the components and this system folder into your project.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <CopyCommand label="Next.js or Vite app" command={`npx tyohnn init --system ${system.name}`} />
                        <CopyCommand label="Monorepo: packages/ui plus one app" command={`npx tyohnn init --system ${system.name} --app apps/web`} />
                        <CopyCommand label="Monorepo: this system for a second app" command={`npx tyohnn add ${system.name} --app apps/admin`} />
                        <CopyCommand label="Another icon library" command={`npx tyohnn init --system ${system.name} --icons ${otherIcons.id}`} />
                        <CopyCommand label="Another sans font" command={`npx tyohnn init --system ${system.name} --font ${otherFont}`} />
                    </CardContent>
                </Card>
            </div>

            <SystemViewer system={system.name} defaultMode={system.defaultMode} />

            <nav aria-label="Other systems" className="flex items-center justify-between gap-4 border-t pt-4 text-sm">
                <Link href={`/systems/${previous.name}`} className="flex flex-col hover:underline">
                    <span className="text-xs text-muted-foreground">Previous</span>
                    {previous.name}
                </Link>
                <Link href={`/compare?a=${system.name}&b=${next.name}`} className="text-xs text-muted-foreground hover:text-foreground">
                    Compare with {next.name}
                </Link>
                <Link href={`/systems/${next.name}`} className="flex flex-col items-end hover:underline">
                    <span className="text-xs text-muted-foreground">Next</span>
                    {next.name}
                </Link>
            </nav>
        </div>
    );
}
