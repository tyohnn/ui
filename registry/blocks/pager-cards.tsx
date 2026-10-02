import type { ReactNode } from "react";

import { ArrowLeft, ArrowRight } from "@tyohnn/icons";

import { Card, CardDescription, CardHeader, CardTitle } from "@tyohnn/components/card";
import { cn } from "@tyohnn/lib/utils";

export type PagerPage = {
    /** The direction in words ("Previous", "Next") */
    label: string;
    title: ReactNode;
    description?: ReactNode;
};

/** The end of a page in a series: the page before and the page after as two cards side by side, each with its direction, title and one line about it. */
export const PagerCards = ({ previous, next, className }: { previous?: PagerPage; next?: PagerPage; className?: string }) => (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
        {previous !== undefined && (
            <Card size="sm" className="[&_svg]:size-[14px]">
                <CardHeader>
                    <CardDescription className="flex items-center gap-1.5"><ArrowLeft />{previous.label}</CardDescription>
                    <CardTitle>{previous.title}</CardTitle>
                    {previous.description !== undefined && <CardDescription>{previous.description}</CardDescription>}
                </CardHeader>
            </Card>
        )}
        {next !== undefined && (
            <Card size="sm" className="text-end [&_svg]:size-[14px]">
                <CardHeader>
                    <CardDescription className="flex items-center justify-end gap-1.5">{next.label}<ArrowRight /></CardDescription>
                    <CardTitle>{next.title}</CardTitle>
                    {next.description !== undefined && <CardDescription>{next.description}</CardDescription>}
                </CardHeader>
            </Card>
        )}
    </div>
);
