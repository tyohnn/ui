import type { Metadata } from "next";
import { Suspense } from "react";

import { CompareView } from "@/components/compare-view";
import { getSystems } from "@/lib/registry";

export const metadata: Metadata = {
    title: "Compare",
    description: "Two or three tyohnn design systems side by side on the same template.",
};

export default function ComparePage()
{
    return (
        <div className="flex flex-col gap-6 pt-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">Compare</h1>
                <p className="max-w-2xl text-sm text-muted-foreground">
                    Similar systems, different decisions. Put two or three side by side on the same template and look at control
                    heights, corners, borders against shadows, and label case — the parts a colour theme does not touch.
                </p>
            </div>
            <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
                <CompareView systems={getSystems()} />
            </Suspense>
        </div>
    );
}
