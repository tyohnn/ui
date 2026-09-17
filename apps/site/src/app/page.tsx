import Link from "next/link";

import { CopyCommand } from "@/components/copy-command";
import { SystemGallery } from "@/components/system-gallery";
import { getSystems } from "@/lib/registry";
import { SITE_SYSTEM } from "@/lib/site";

const LAYERS = [
    { name: "Layer 1 · colours", body: "Semantic colours for light and dark, the radius base and static shadows." },
    { name: "Layer 2 · tokens", body: "Density, shape and depth: control heights, paddings, corners, rings and composed shadows." },
    { name: "Layer 3 · rules", body: "cn-* rules per component that assemble those values. The TSX carries no visual values." },
];

export default function Home()
{
    const systems = getSystems();

    return (
        <div className="flex flex-col gap-10 pt-10">
            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end">
                <div className="flex flex-col gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">shadcn + Base UI + three CSS layers</h1>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        tyohnn is one set of shadcn components on Base UI primitives, drawn by {systems.length} complete design systems.
                        Switching a system changes more than colour: density, shape and depth move with it. Every card below is the same
                        TSX with a different system folder.
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <CopyCommand command={`npx tyohnn init --system ${SITE_SYSTEM}`} label="Copy one system into a Next.js, Vite or monorepo project" />
                    <p className="text-xs text-muted-foreground">
                        <Link href="/docs" className="underline underline-offset-4 hover:text-foreground">CLI docs</Link>
                        {" · "}
                        <Link href="/compare" className="underline underline-offset-4 hover:text-foreground">Compare systems side by side</Link>
                    </p>
                </div>
            </section>

            <dl className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3">
                {LAYERS.map((layer) => (
                    <div key={layer.name} className="flex flex-col gap-1 bg-background p-4">
                        <dt className="text-xs font-medium">{layer.name}</dt>
                        <dd className="text-xs text-muted-foreground">{layer.body}</dd>
                    </div>
                ))}
            </dl>

            <SystemGallery systems={systems} />
        </div>
    );
}
