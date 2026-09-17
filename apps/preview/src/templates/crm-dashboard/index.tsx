import type { ComponentType, CSSProperties } from "react";

import {
    Activity,
    Bell,
    BrandMark,
    Briefcase,
    Building,
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

import { Avatar, AvatarFallback } from "@tyohnn/components/avatar";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Checkbox } from "@tyohnn/components/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@tyohnn/components/select";
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
} from "@tyohnn/components/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tyohnn/components/table";
import { Tabs, TabsList, TabsTrigger } from "@tyohnn/components/tabs";

import { NO_MOTION } from "../coverage/frame";

import { avatarTone, COLUMN_WIDTHS, COLUMNS, CURRENT_USER, initials, ROWS, TAG_TONE } from "./data";
import { CRM_STYLE, LastInteraction, PipelineDot, Sparkline, StatusDot, WinMeter } from "./parts";

/**
 * The Sales CRM "Companies" screen assembled from registry/ui components, so every design system can
 * render it: `?template=crm-dashboard`. The window is 1435px wide and as tall as its content (control
 * sizes differ per system). Fixed data, no time and no randomness, so two renders are identical.
 *
 * The window root carries `data-template="crm-dashboard"`; tooling/snapshot/export-dc.mjs exports it.
 * Template code uses layout utilities only; colours and type come from CRM_STYLE, which reads tokens.
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
                    {Icon ? <Icon /> : dot && <PipelineDot tone={dot} />}
                    <span>{label}</span>
                </SidebarMenuButton>
                {count !== undefined && <SidebarMenuBadge>{count}</SidebarMenuBadge>}
            </SidebarMenuItem>
        ))}
    </SidebarMenu>
);

const Heading = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="crm-heading">
        <span className="crm-heading-title">{title}</span>
        <span className="crm-heading-subtitle">{subtitle}</span>
    </div>
);

const Person = ({ name }: { name: string }) => (
    <Avatar size="sm">
        <AvatarFallback data-tone={avatarTone(name)}>{initials(name)}</AvatarFallback>
    </Avatar>
);

const CrmSidebar = () => (
    <Sidebar collapsible="none" className="crm-sidebar h-auto">
        <SidebarHeader className="flex-row items-center gap-2.5">
            <span className="crm-brand-mark"><BrandMark /></span>
            <Heading title="Sales CRM" subtitle="Company pipeline" />
        </SidebarHeader>
        <SidebarSeparator className="mx-0" />
        <SidebarContent className="overflow-visible">
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
            <Heading title="14 Days" subtitle="Left on trials" />
            <Button variant="secondary" size="sm" data-shape="pill">
                <CreditCard data-icon="inline-start" />
                Add Billings
            </Button>
        </SidebarFooter>
    </Sidebar>
);

const PageHeader = () => (
    <header className="crm-page-header flex items-center justify-between gap-4 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
            <h1 className="crm-page-title">Companies</h1>
            <Badge variant="outline">
                <StatusDot />
                Active
            </Badge>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" data-shape="round" aria-label="Search"><Search /></Button>
            <Button variant="outline" size="icon" data-shape="round" aria-label="Notifications"><Bell /></Button>
            <Button variant="outline" data-shape="pill" className="gap-2">
                <Person name={CURRENT_USER} />
                {CURRENT_USER}
                <ChevronDown data-icon="inline-end" />
            </Button>
        </div>
    </header>
);

const Toolbar = () => (
    <div className="flex items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-2">
            {FILTERS.map((filter) => (
                <Select key={filter.label} items={filter.options} defaultValue={filter.value}>
                    <SelectTrigger size="sm" className="gap-2">
                        <span className="crm-filter-label">{filter.label}</span>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {filter.options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            ))}
        </div>
        <div className="flex items-center gap-1.5">
            <Button variant="outline">
                <Download data-icon="inline-start" />
                Export
            </Button>
            <Button>
                <Plus data-icon="inline-start" />
                New Company
            </Button>
        </div>
    </div>
);

const CompaniesTable = () => (
    <Table>
        <colgroup>
            {COLUMN_WIDTHS.map((width, index) => <col key={index} style={{ width }} />)}
            <col />
        </colgroup>
        <TableHeader>
            <TableRow>
                <TableHead><Checkbox indeterminate aria-label="Select all" /></TableHead>
                {/* Head labels may wrap: a system with larger type then narrows a column to its body content instead of pushing the table past the window. */}
                {COLUMNS.map((column) => <TableHead key={column} className="whitespace-normal">{column}</TableHead>)}
            </TableRow>
        </TableHeader>
        <TableBody>
            {ROWS.map((row, index) => (
                <TableRow key={row.company} data-state={row.selected ? "selected" : undefined}>
                    <TableCell><Checkbox defaultChecked={row.selected} aria-label={`Select ${row.company}`} /></TableCell>
                    <TableCell><span className="crm-company">{row.company}</span></TableCell>
                    <TableCell>
                        <span className="flex items-center gap-1">
                            {row.tags.map((tag) => <Badge key={tag} variant="outline" data-tone={TAG_TONE[tag]}>{tag}</Badge>)}
                        </span>
                    </TableCell>
                    <TableCell>
                        <span className="flex items-center gap-2">
                            <Person name={row.owner} />
                            <span>{row.owner}</span>
                        </span>
                    </TableCell>
                    <TableCell><span className="crm-number">{row.deals}</span></TableCell>
                    <TableCell>
                        <span className="crm-number flex items-center gap-1.5">
                            <span className="crm-currency">$</span>
                            <span>{row.value}</span>
                        </span>
                    </TableCell>
                    <TableCell><WinMeter value={row.win} /></TableCell>
                    <TableCell><Sparkline seed={index + 3} /></TableCell>
                    <TableCell><LastInteraction date={row.date} label={row.touch} /></TableCell>
                    <TableCell>
                        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.company}`}><MoreHorizontal /></Button>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

const SUMMARY = ["Sum of pipeline", "Avg win probability", "Add Calculation"];

const TableSummary = () => (
    <div className="crm-summary grid grid-cols-4">
        <div className="crm-summary-cell flex items-center gap-2 px-3 py-2">
            <span className="crm-summary-count crm-number">20</span>
            <span>Companies in view</span>
        </div>
        {SUMMARY.map((label) => (
            <div key={label} className="crm-summary-cell flex items-center gap-2.5 px-3 py-2">
                <Plus />
                <span>{label}</span>
            </div>
        ))}
    </div>
);

export const CrmDashboard = () => (
    <div className="p-8">
        <style>{NO_MOTION}</style>
        <div data-template="crm-dashboard" className="flex w-[1435px] overflow-hidden">
            <style>{CRM_STYLE}</style>
            <SidebarProvider className="min-h-0" style={{ "--sidebar-width": "246px" } as CSSProperties}>
                <CrmSidebar />
                <SidebarInset className="min-w-0">
                    <PageHeader />
                    <Tabs defaultValue="companies">
                        <TabsList variant="line" className="w-full justify-start gap-4 px-4">
                            <TabsTrigger value="companies" className="flex-none">Companies</TabsTrigger>
                            <TabsTrigger value="deals" className="flex-none">Deals</TabsTrigger>
                            <TabsTrigger value="forecast" className="flex-none">Forecast</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Toolbar />
                    <CompaniesTable />
                    <TableSummary />
                </SidebarInset>
            </SidebarProvider>
        </div>
    </div>
);
