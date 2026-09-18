import type { Metadata } from "next";
import { Suspense } from "react";

import { type CompareFacts, CompareView } from "@/components/compare-view";
import { getSystems } from "@/lib/registry";
import { summarize } from "@/lib/site";
import { readThemes, systemThemes } from "@/lib/themes";

export const metadata: Metadata = {
    title: "Compare",
    description: "Two tyohnn design systems on the same screen, split by a divider you drag.",
};

export default function ComparePage()
{
    const systems = getSystems();
    const facts: CompareFacts[] = systems.map((system) => ({
        name: system.name,
        description: system.description,
        sans: system.fonts.sans.family,
        heading: system.fonts.heading?.family ?? system.fonts.sans.family,
        icons: system.icons.id,
        defaultMode: system.defaultMode,
    }));

    return (
        <>
            <div className="page-head">
                <div>
                    <div className="eyebrow">Side by side</div>
                    <h1>Compare</h1>
                    <p>Two systems, one screen, <b>the same palette on both sides</b> — so what you see is spacing, corners, depth and type. Change the colours and both follow.</p>
                </div>
            </div>
            <Suspense>
                <CompareView systems={systems.map(summarize)} facts={facts} themes={readThemes()} owns={systemThemes()} />
            </Suspense>
        </>
    );
}
