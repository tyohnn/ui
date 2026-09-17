import type { Metadata } from "next";

import { ComponentsView } from "@/components/components-view";
import { getComponentCount, getSystems } from "@/lib/registry";
import { summarize } from "@/lib/site";

export const metadata: Metadata = {
    title: "Components",
    description: "Every tyohnn component with its variants, sizes and states, rendered live in the design system you pick.",
};

export default function ComponentsPage()
{
    return <ComponentsView systems={getSystems().map(summarize)} components={getComponentCount()} />;
}
