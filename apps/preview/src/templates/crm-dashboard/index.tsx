import type { ComponentType, CSSProperties } from "react";

import {
    Activity,
    Bell,
    BrandMark,
    Briefcase,
    Building,
    Calendar,
    ChartLine,
    ChevronDown,
    CircleHelp,
    Contact,
    CreditCard,
    Download,
    Headset,
    Kanban,
    Mail,
    MoreHorizontal,
    Plus,
    Search,
    TrendingDown,
    TrendingUp,
    UserPlus,
    Users,
} from "@tyohnn/icons";

import { ActivityBars } from "@tyohnn/blocks/activity-bars";
import { CompactSelect } from "@tyohnn/blocks/compact-select";
import { DataTable, type DataTableColumn } from "@tyohnn/blocks/data-table";
import { FilterBar } from "@tyohnn/blocks/filter-bar";
import { InlineFacts } from "@tyohnn/blocks/inline-facts";
import { Page, PagePane } from "@tyohnn/blocks/page";
import { PageBar } from "@tyohnn/blocks/page-bar";
import { Person } from "@tyohnn/blocks/person";
import { SegmentMeter } from "@tyohnn/blocks/segment-meter";
import { SummaryBar } from "@tyohnn/blocks/summary-bar";
import { ToneDot } from "@tyohnn/blocks/tone-dot";
import { TwoLineLabel } from "@tyohnn/blocks/two-line-label";
import { Avatar, AvatarFallback } from "@tyohnn/components/avatar";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarSeparator,
    SidebarTrigger,
} from "@tyohnn/components/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@tyohnn/components/tabs";

import { NoMotion } from "../coverage/frame";

import { activityLevels, avatarTone, COLUMN_WIDTHS, type CompanyRow, CURRENT_USER, initials, ROWS, TAG_TONE } from "./data";

/**
 * The Sales CRM "Companies" screen, so every design system can render it: `?template=crm-dashboard`. It fills
 * the viewport (the catalog shows it at 1435 × 760). Fixed data, no time and no randomness, so two renders are
 * identical.
 *
 * The window root carries `data-template="crm-dashboard"`; tooling/snapshot/export-dc.mjs exports it. The body is
 * composed from blocks (registry/blocks): the page bar, the filter bar, the table with its meter, trend and
 * interaction cells, and the summary bar. The sidebar, the columns and the filters are the CRM's own and stay here.
 */

type NavItem = { label: string; icon?: ComponentType; dot?: "warning" | "destructive" | "info"; count?: number; active?: boolean };

const NAV_MAIN: NavItem[] = [
    { icon: Building, label: "Companies", count: 241, active: true },
    { icon: Kanban, label: "Deals Board" },
    { icon: TrendingUp, label: "Forecast", count: 9 },
    { icon: Activity, label: "Activities" },
    { icon: Contact, label: "Contacts", count: 38 },
    { icon: Mail, label: "Email Sequences" },
];

const NAV_TEAM: NavItem[] = [
    { icon: Users, label: "Strategic AEs" },
    { icon: Briefcase, label: "Mid Market" },
    { icon: Headset, label: "SDR Team" },
];

const NAV_REPORTING: NavItem[] = [
    { icon: ChartLine, label: "Q1 Forecast" },
    { icon: TrendingDown, label: "Slipping Deals" },
];

const NAV_PIPELINES: NavItem[] = [
    { dot: "warning", label: "North America" },
    { dot: "destructive", label: "EMEA Enterprise" },
    { dot: "info", label: "APAC Expansion" },
];

const NAV_END: NavItem[] = [
    { icon: UserPlus, label: "Invite teammates" },
    { icon: CircleHelp, label: "Help" },
];

const FILTERS = [
    { label: "Sort by", value: "pipeline", options: [{ value: "pipeline", label: "Pipeline Value" }, { value: "win", label: "Win Probability" }] },
    { label: "Filter", value: "all", options: [{ value: "all", label: "All Owners" }, { value: "mine", label: "My Accounts" }] },
    { label: "Stage", value: "any", options: [{ value: "any", label: "Any" }, { value: "open", label: "Open" }] },
    { label: "Last Activity", value: "90", options: [{ value: "90", label: "90 Days" }, { value: "30", label: "30 Days" }] },
];

const Menu = ({ items }: { items: NavItem[] }) => (
    <SidebarMenu>
        {items.map(({ label, icon: Icon, dot, count, active }) => (
            <SidebarMenuItem key={label}>
                <SidebarMenuButton isActive={active}>
                    {Icon ? <Icon /> : dot && <ToneDot tone={dot} className="mx-1" />}
                    <span>{label}</span>
                </SidebarMenuButton>
                {count !== undefined && <SidebarMenuBadge>{count}</SidebarMenuBadge>}
            </SidebarMenuItem>
        ))}
    </SidebarMenu>
);

const CrmSidebar = () => (
    // bg-sidebar on the container: its edge is drawn over the sidebar's own colour, as it was when the sidebar could not close.
    <Sidebar collapsible="offcanvas" className="border-e border-sidebar-border bg-sidebar">
        <SidebarHeader className="flex-row items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-[var(--radius-md)] border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground [&_svg]:size-[18px]"><BrandMark /></span>
            <TwoLineLabel title="Sales CRM" subtitle="Company pipeline" />
        </SidebarHeader>
        <SidebarSeparator className="mx-0" />
        <SidebarContent>
            <SidebarGroup>
                <Menu items={NAV_MAIN} />
            </SidebarGroup>
            <SidebarSeparator className="mx-0" />
            <SidebarGroup>
                <SidebarGroupLabel>Team</SidebarGroupLabel>
                <Menu items={NAV_TEAM} />
            </SidebarGroup>
            <SidebarSeparator className="mx-0" />
            <SidebarGroup>
                <SidebarGroupLabel>Reporting</SidebarGroupLabel>
                <Menu items={NAV_REPORTING} />
            </SidebarGroup>
            <SidebarSeparator className="mx-0" />
            <SidebarGroup>
                <SidebarGroupLabel>Pipelines</SidebarGroupLabel>
                <Menu items={NAV_PIPELINES} />
            </SidebarGroup>
            <SidebarGroup className="mt-auto">
                <Menu items={NAV_END} />
            </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator className="mx-0" />
        <SidebarFooter className="flex-row items-center justify-between">
            <TwoLineLabel title="14 Days" subtitle="Left on trials" />
            <Button variant="secondary" size="sm" data-shape="pill">
                <CreditCard data-icon="inline-start" />
                Add Billings
            </Button>
        </SidebarFooter>
    </Sidebar>
);

const PageHeader = () => (
    <PageBar
        leading={<SidebarTrigger className="-ml-1 md:hidden" />}
        title="Companies"
        status={(
            <Badge variant="outline">
                <ToneDot tone="success" size="sm" />
                Active
            </Badge>
        )}
        actions={(
            <>
                <Button variant="outline" size="icon" data-shape="round" aria-label="Search"><Search /></Button>
                <Button variant="outline" size="icon" data-shape="round" aria-label="Notifications"><Bell /></Button>
                <Button variant="outline" data-shape="pill" className="gap-2">
                    <Avatar size="sm">
                        <AvatarFallback data-tone={avatarTone(CURRENT_USER)}>{initials(CURRENT_USER)}</AvatarFallback>
                    </Avatar>
                    {CURRENT_USER}
                    <ChevronDown data-icon="inline-end" />
                </Button>
            </>
        )}
    />
);

const Toolbar = () => (
    <FilterBar
        filters={FILTERS.map((filter) => (
            <CompactSelect key={filter.label} label={filter.label} showLabel options={filter.options} defaultValue={filter.value} className="gap-2" />
        ))}
        actions={(
            <>
                <Button variant="outline">
                    <Download data-icon="inline-start" />
                    Export
                </Button>
                <Button>
                    <Plus data-icon="inline-start" />
                    New Company
                </Button>
            </>
        )}
    />
);

// The reference table's column widths follow the checkbox column's (COLUMN_WIDTHS[0]); the actions column takes what is left.
const [SELECT_WIDTH, ...WIDTHS] = COLUMN_WIDTHS;

const COLUMNS: DataTableColumn<CompanyRow>[] = [
    { id: "company", header: "Companies", width: WIDTHS[0], cell: (row) => <span style={{ fontWeight: "var(--ui-font-weight)" }}>{row.company}</span> },
    {
        id: "segment",
        header: "Segment & Stage",
        width: WIDTHS[1],
        cell: (row) => (
            <span className="flex items-center gap-1">
                {row.tags.map((tag) => <Badge key={tag} variant="outline" data-tone={TAG_TONE[tag]}>{tag}</Badge>)}
            </span>
        ),
    },
    { id: "owner", header: "Account Owner", width: WIDTHS[2], cell: (row) => <Person name={row.owner} initials={initials(row.owner)} tone={avatarTone(row.owner)} /> },
    { id: "deals", header: "Open Deals", width: WIDTHS[3], cell: (row) => <span className="tabular-nums">{row.deals}</span> },
    {
        id: "value",
        header: "Pipeline Value",
        width: WIDTHS[4],
        cell: (row) => (
            <span className="flex items-center gap-1.5 tabular-nums">
                <span className="text-muted-foreground">$</span>
                <span>{row.value}</span>
            </span>
        ),
    },
    { id: "win", header: "Win Probability", width: WIDTHS[5], cell: (row) => <SegmentMeter value={row.win} /> },
    { id: "trend", header: "Activity Trend", width: WIDTHS[6], cell: (row) => <ActivityBars levels={activityLevels(ROWS.indexOf(row) + 3)} /> },
    { id: "interaction", header: "Last Interaction", width: WIDTHS[7], cell: (row) => <InlineFacts icon={<Calendar />} facts={[row.date, row.touch]} /> },
    { id: "actions", header: "Actions", cell: (row) => <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.company}`}><MoreHorizontal /></Button> },
];

const CompaniesTable = () => (
    <DataTable
        columns={COLUMNS}
        rows={ROWS}
        rowId={(row) => row.company}
        // Head labels may wrap: a system with larger type then narrows a column to its body content instead of pushing the table past the window.
        wrapHeaders
        selection={{
            defaultSelected: ROWS.filter((row) => row.selected).map((row) => row.company),
            selectAllLabel: "Select all",
            selectRowLabel: (row) => `Select ${row.company}`,
            width: SELECT_WIDTH,
        }}
    />
);

const SUMMARY = ["Sum of pipeline", "Avg win probability", "Add Calculation"];

const TableSummary = () => (
    <SummaryBar className="border-t border-b-0" cells={[{ value: "20", label: "Companies in view" }, ...SUMMARY.map((label) => ({ icon: <Plus />, label }))]} />
);

// The screen fills its viewport like the block templates: the sidebar and the page are as tall as the window, and
// the table scrolls between the filter bar and the summary bar.
export const CrmDashboard = () => (
    <div data-template="crm-dashboard" className="flex h-svh w-full overflow-hidden bg-background font-sans text-foreground antialiased">
        <NoMotion />
        <SidebarProvider className="h-full min-h-0" style={{ "--sidebar-width": "246px" } as CSSProperties}>
            <CrmSidebar />
            <SidebarInset className="min-h-0 min-w-0">
                <PageHeader />
                <Page scroll="regions" gutter="none" gap="none">
                <Tabs defaultValue="companies">
                    <TabsList variant="line" className="w-full justify-start gap-4 px-4">
                        <TabsTrigger value="companies" className="flex-none">Companies</TabsTrigger>
                        <TabsTrigger value="deals" className="flex-none">Deals</TabsTrigger>
                        <TabsTrigger value="forecast" className="flex-none">Forecast</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Toolbar />
                <PagePane>
                    <CompaniesTable />
                </PagePane>
                <TableSummary />
                </Page>
            </SidebarInset>
        </SidebarProvider>
    </div>
);
