import type { ReactNode } from "react";

import { ChevronRight } from "@tyohnn/icons";

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@tyohnn/components/card";
import { NOTE } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

export type Topic = {
    id: string;
    icon: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    /** The line in the footer: how much is inside ("42 articles") */
    meta?: ReactNode;
    metaIcon?: ReactNode;
};

/**
 * A grid of small cards that each lead into a topic: an icon tile, the topic's name and what it covers, and in
 * the footer how much is inside, with a chevron. Two columns on a medium screen, three on a wide one. Use it for
 * the categories of a help center, a catalogue or a settings index.
 */
export const TopicCards = ({ topics, className }: { topics: readonly Topic[]; className?: string }) => (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", className)}>
        {topics.map((topic) => (
            <Card key={topic.id} size="sm">
                <CardHeader>
                    <div className="mb-2 flex size-9 items-center justify-center rounded-[var(--radius-lg)] border border-border bg-muted text-foreground [&_svg]:size-[18px]">{topic.icon}</div>
                    <CardTitle>{topic.title}</CardTitle>
                    {topic.description !== undefined && <CardDescription>{topic.description}</CardDescription>}
                </CardHeader>
                <CardFooter className="justify-between gap-2">
                    <span className={cn(NOTE, "flex items-center gap-1.5 [&_svg]:size-[var(--control-icon-size-md)] [&_svg]:shrink-0")}>{topic.metaIcon}{topic.meta}</span>
                    <ChevronRight className="size-[var(--control-icon-size-lg)] shrink-0 text-muted-foreground" />
                </CardFooter>
            </Card>
        ))}
    </div>
);
