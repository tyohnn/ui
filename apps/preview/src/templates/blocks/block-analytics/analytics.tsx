import { Download, ExternalLink, Users } from "@tyohnn/icons";

import { CategoryBarChart } from "@tyohnn/blocks/category-bar-chart";
import { CompactSelect } from "@tyohnn/blocks/compact-select";
import { DataTable, type DataTableColumn } from "@tyohnn/blocks/data-table";
import { InfoCard } from "@tyohnn/blocks/info-card";
import { PendingText } from "@tyohnn/blocks/lib/pending";
import { META } from "@tyohnn/blocks/lib/text";
import { MetricCards } from "@tyohnn/blocks/metric-cards";
import { PageHeading } from "@tyohnn/blocks/page-heading";
import { SegmentedControl } from "@tyohnn/blocks/segmented-control";
import { ShareMeter } from "@tyohnn/blocks/share-meter";
import { TrendAreaChart } from "@tyohnn/blocks/trend-area-chart";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";

import { LOADING } from "../../loading";
import { COMPARISONS, FUNNEL, KPIS, PERIODS, SOURCES, TOP_PAGES, VISITS, VISITS_SERIES } from "./data";

/**
 * The body of the analytics app: period controls, four KPI cards, a visits area chart beside a traffic-source bar
 * chart, then the top pages table beside the conversion funnel. Fixed data, no time and no randomness; the charts
 * are not animated, so every render is the final frame. The screen is composed from blocks (registry/blocks): the
 * page heading with its controls, the metric cards, the two charts and the funnel's meters in info cards, and the
 * table. Which periods, series, columns and steps there are is the product's own and stays here.
 */

const formatThousands = (value: number) => (value === 0 ? "0" : `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`);

type TopPage = (typeof TOP_PAGES)[number];

const PAGE_COLUMNS: DataTableColumn<TopPage>[] = [
    { id: "page", header: "Page", kind: "code", cellClassName: "text-[length:var(--ui-text-sm)]", cell: (page) => page.path },
    { id: "views", header: "Views", kind: "number", cell: (page) => page.views },
    { id: "bounce", header: "Bounce rate", kind: "number", cell: (page) => page.bounce },
    { id: "time", header: "Avg. time", kind: "number", cell: (page) => page.time },
];

const Controls = () => (
    <PageHeading
        loading={LOADING}
        title="Traffic"
        meta="fernhill.shop · Dec 16, 2025 – Jan 14, 2026 · times in UTC"
        actions={(
            <>
                {/* How many are online is a value: its badge is left out while it waits. */}
                {!LOADING && (
                    <Badge variant="outline">
                        <Users data-icon="inline-start" />
                        38 online now
                    </Badge>
                )}
                <SegmentedControl label="Period" options={PERIODS} defaultValue="30d" />
                <CompactSelect label="Comparison" options={COMPARISONS} defaultValue="previous" className="min-w-44" />
                <Button variant="outline" size="sm"><Download data-icon="inline-start" />Export</Button>
            </>
        )}
    />
);

const VisitsChart = () => (
    <InfoCard loading={LOADING} title="Visits" description="Daily visitors and page views" className="min-w-0">
        <TrendAreaChart loading={LOADING} data={VISITS} xKey="date" series={VISITS_SERIES} formatValue={formatThousands} />
    </InfoCard>
);

const SourcesChart = () => (
    <InfoCard loading={LOADING} title="Traffic sources" description="Visitors by channel" className="min-w-0">
        <CategoryBarChart loading={LOADING} data={SOURCES} categoryKey="source" valueKey="visitors" valueLabel="Visitors" formatValue={formatThousands} />
    </InfoCard>
);

const TopPages = () => (
    <InfoCard
        loading={LOADING}
        title="Top pages"
        description="By views, last 30 days"
        action={<Button variant="ghost" size="sm">View all<ExternalLink data-icon="inline-end" /></Button>}
        className="min-h-0 min-w-0"
        contentClassName="min-h-0 flex-1 overflow-y-auto"
    >
        <DataTable loading={LOADING} loadingRows={TOP_PAGES.length} columns={PAGE_COLUMNS} rows={TOP_PAGES} rowId={(page) => page.path} />
    </InfoCard>
);

const Funnel = () => (
    <InfoCard
        loading={LOADING}
        title="Checkout funnel"
        description="Share of product viewers"
        // The conversion is a value: its badge is left out while it waits.
        action={LOADING ? undefined : <Badge variant="outline">7.4% converted</Badge>}
        className="min-h-0 min-w-0"
        contentClassName="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto"
        footer={<span className={META}>{LOADING ? <PendingText length={32} /> : "Biggest drop: cart to checkout (−45%)"}</span>}
    >
        {FUNNEL.map((step) => <ShareMeter key={step.step} loading={LOADING} label={step.step} count={step.visitors} value={step.share} />)}
    </InfoCard>
);

// [contain:inline-size]: the body never widens SidebarInset (upstream markup, no min-w-0) past the viewport.
export const Analytics = () => (
    <div className="flex h-[calc(100svh-4rem)] min-h-0 flex-col gap-4 overflow-y-auto p-4 [contain:inline-size]">
        <Controls />
        <MetricCards metrics={KPIS} changeVariant="secondary" loading={LOADING} count={KPIS.length} />
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
