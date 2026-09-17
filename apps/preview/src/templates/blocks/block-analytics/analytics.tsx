import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Download, ExternalLink, TrendingDown, TrendingUp, Users } from "@tyohnn/icons";

import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@tyohnn/components/card";
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@tyohnn/components/chart";
import { Progress, ProgressLabel, ProgressValue } from "@tyohnn/components/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@tyohnn/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tyohnn/components/table";
import { ToggleGroup, ToggleGroupItem } from "@tyohnn/components/toggle-group";

import { COMPARISONS, FUNNEL, KPIS, PERIODS, SOURCES, TOP_PAGES, VISITS } from "./data";

/**
 * The body of the analytics app: period controls, four KPI cards, a visits area chart beside a traffic-source bar
 * chart, then the top pages table beside the conversion funnel. Fixed data, no time and no randomness; charts have
 * animation off so every render is the final frame. Layout utilities only; series colours are the chart tokens (named
 * directly, not through ChartStyle's runtime --color-<key>, so scan-tokens resolves them) and the small text bands read
 * tokens in ANALYTICS_STYLE.
 */

const VISITS_CONFIG = {
    visitors: { label: "Visitors", color: "var(--chart-1)" },
    pageViews: { label: "Page views", color: "var(--chart-2)" },
} satisfies ChartConfig;

const SOURCES_CONFIG = {
    visitors: { label: "Visitors" },
    search: { label: "Search", color: "var(--chart-1)" },
    direct: { label: "Direct", color: "var(--chart-2)" },
    social: { label: "Social", color: "var(--chart-3)" },
    referral: { label: "Referral", color: "var(--chart-4)" },
    email: { label: "Email", color: "var(--chart-5)" },
} satisfies ChartConfig;

const formatThousands = (value: number) => (value === 0 ? "0" : `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`);

const Controls = () => (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="an-title">Traffic</h1>
            <span className="an-meta">fernhill.shop · Dec 16, 2025 – Jan 14, 2026 · times in UTC</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
                <Users data-icon="inline-start" />
                38 online now
            </Badge>
            <ToggleGroup variant="outline" size="sm" spacing={0} defaultValue={["30d"]} aria-label="Period">
                {PERIODS.map((period) => <ToggleGroupItem key={period.value} value={period.value}>{period.label}</ToggleGroupItem>)}
            </ToggleGroup>
            <Select items={COMPARISONS} defaultValue="previous">
                <SelectTrigger size="sm" aria-label="Comparison" className="min-w-44">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {COMPARISONS.map((comparison) => <SelectItem key={comparison.value} value={comparison.value}>{comparison.label}</SelectItem>)}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Button variant="outline" size="sm"><Download data-icon="inline-start" />Export</Button>
        </div>
    </div>
);

const Kpis = () => (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {KPIS.map((kpi) =>
        {
            const TrendIcon = kpi.trend === "up" ? TrendingUp : TrendingDown;

            return (
                <Card key={kpi.label} size="sm">
                    <CardHeader>
                        <CardDescription>{kpi.label}</CardDescription>
                        <CardTitle className="an-figure">{kpi.value}</CardTitle>
                        <CardAction>
                            <Badge variant="secondary">
                                <TrendIcon data-icon="inline-start" />
                                {kpi.change}
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter>
                        <span className="an-meta">{kpi.note}</span>
                    </CardFooter>
                </Card>
            );
        })}
    </div>
);

const VisitsChart = () => (
    <Card size="sm" className="min-w-0">
        <CardHeader>
            <CardTitle>Visits</CardTitle>
            <CardDescription>Daily visitors and page views</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={VISITS_CONFIG} className="aspect-auto h-52 w-full">
                <AreaChart accessibilityLayer data={VISITS} margin={{ left: 0, right: 8, top: 4 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
                    <YAxis tickLine={false} axisLine={false} width={36} tickFormatter={formatThousands} />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area dataKey="pageViews" type="monotone" fill="var(--chart-2)" fillOpacity={0.15} stroke="var(--chart-2)" strokeWidth={2} isAnimationActive={false} />
                    <Area dataKey="visitors" type="monotone" fill="var(--chart-1)" fillOpacity={0.3} stroke="var(--chart-1)" strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
            </ChartContainer>
        </CardContent>
    </Card>
);

const SourcesChart = () => (
    <Card size="sm" className="min-w-0">
        <CardHeader>
            <CardTitle>Traffic sources</CardTitle>
            <CardDescription>Visitors by channel</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={SOURCES_CONFIG} className="aspect-auto h-52 w-full">
                <BarChart accessibilityLayer data={SOURCES} layout="vertical" margin={{ left: 0, right: 8 }}>
                    <CartesianGrid horizontal={false} />
                    <YAxis dataKey="source" type="category" tickLine={false} axisLine={false} width={64} />
                    <XAxis dataKey="visitors" type="number" tickLine={false} axisLine={false} tickFormatter={formatThousands} />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="visitors" radius={4} isAnimationActive={false} />
                </BarChart>
            </ChartContainer>
        </CardContent>
    </Card>
);

const TopPages = () => (
    <Card size="sm" className="min-h-0 min-w-0">
        <CardHeader>
            <CardTitle>Top pages</CardTitle>
            <CardDescription>By views, last 30 days</CardDescription>
            <CardAction>
                <Button variant="ghost" size="sm">View all<ExternalLink data-icon="inline-end" /></Button>
            </CardAction>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead className="an-number">Views</TableHead>
                        <TableHead className="an-number">Bounce rate</TableHead>
                        <TableHead className="an-number">Avg. time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {TOP_PAGES.map((page) => (
                        <TableRow key={page.path}>
                            <TableCell className="an-path">{page.path}</TableCell>
                            <TableCell className="an-number">{page.views}</TableCell>
                            <TableCell className="an-number">{page.bounce}</TableCell>
                            <TableCell className="an-number">{page.time}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const Funnel = () => (
    <Card size="sm" className="min-h-0 min-w-0">
        <CardHeader>
            <CardTitle>Checkout funnel</CardTitle>
            <CardDescription>Share of product viewers</CardDescription>
            <CardAction>
                <Badge variant="outline">7.4% converted</Badge>
            </CardAction>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
            {FUNNEL.map((step) => (
                <Progress key={step.step} value={step.share} className="items-center">
                    <ProgressLabel>{step.step}</ProgressLabel>
                    <span className="an-meta ml-auto">{step.visitors}</span>
                    <ProgressValue className="an-meta" />
                </Progress>
            ))}
        </CardContent>
        <CardFooter>
            <span className="an-meta">Biggest drop: cart to checkout (−45%)</span>
        </CardFooter>
    </Card>
);

// [contain:inline-size]: the body never widens SidebarInset (upstream markup, no min-w-0) past the viewport.
export const Analytics = () => (
    <div className="flex h-[calc(100svh-4rem)] min-h-0 flex-col gap-4 overflow-y-auto p-4 [contain:inline-size]">
        <Controls />
        <Kpis />
        <div className="grid shrink-0 grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
            <VisitsChart />
            <SourcesChart />
        </div>
        <div className="grid min-h-72 flex-1 grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
            <TopPages />
            <Funnel />
        </div>
    </div>
);

/** The template's own stylesheet: system tokens only (title, meta text, figures, numeric and path cells). */
export const ANALYTICS_STYLE = `
[data-template="block-analytics"] .an-title { margin: 0; font-family: var(--font-heading); font-size: var(--ui-text-lg); line-height: var(--ui-line-height-lg); font-weight: 600; color: var(--foreground); }
[data-template="block-analytics"] .an-meta { font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); font-variant-numeric: tabular-nums; white-space: nowrap; }
[data-template="block-analytics"] .an-figure { font-variant-numeric: tabular-nums; }
[data-template="block-analytics"] .an-number { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
[data-template="block-analytics"] .an-path { font-family: var(--font-mono); font-size: var(--ui-text-sm); white-space: nowrap; }
`;
