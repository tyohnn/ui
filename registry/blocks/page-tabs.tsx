"use client";

import type { ReactNode } from "react";

import { Badge } from "@tyohnn/components/badge";
import { TabsList, TabsTrigger } from "@tyohnn/components/tabs";
import { cn } from "@tyohnn/lib/utils";

export type PageTab = { value: string; label: ReactNode; /** With `data-icon="inline-start"` */ icon?: ReactNode; count?: ReactNode };

/**
 * The tabs of a page as an underlined strip over a divider, each with an icon and a count: the sections of one
 * record (conversation, files, checks). It is the strip only: put it inside a `Tabs` with the panels
 * (`TabsContent`) after it. For tabs in a card's toolbar use TabCard.
 */
export const PageTabs = ({ tabs, className }: { tabs: readonly PageTab[]; className?: string }) => (
    <div className={cn("border-b border-border", className)}>
        <TabsList variant="line" className="gap-4">
            {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex-none">
                    {tab.icon}
                    {tab.label}
                    {tab.count !== undefined && <Badge variant="secondary">{tab.count}</Badge>}
                </TabsTrigger>
            ))}
        </TabsList>
    </div>
);
