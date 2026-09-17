import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { Bell, ChartLine, ChevronRight, LayoutGrid, MoreHorizontal, Plus, Search, Users } from "@tyohnn/icons";

import { Calendar } from "@tyohnn/components/calendar";
import { Card, CardContent } from "@tyohnn/components/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@tyohnn/components/carousel";
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@tyohnn/components/chart";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@tyohnn/components/resizable";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
} from "@tyohnn/components/sidebar";

import { type CoverageSection, Row } from "./frame";

/** Fixed dates: the calendar never reads the clock. */
const TODAY = new Date(2026, 0, 14);
const MONTH = new Date(2026, 0, 1);

const CHART_DATA = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
];

const CHART_CONFIG = {
    desktop: { label: "Desktop", color: "var(--chart-1)" },
    mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;

export const dataSections: CoverageSection[] = [
    {
        name: "calendar",
        components: ["calendar"],
        render: () => (
            <div className="flex flex-wrap items-start gap-6">
                <Calendar mode="single" defaultMonth={MONTH} today={TODAY} selected={new Date(2026, 0, 20)} className="rounded-lg border" />
                <Calendar
                    mode="range"
                    defaultMonth={MONTH}
                    today={TODAY}
                    selected={{ from: new Date(2026, 0, 5), to: new Date(2026, 0, 9) }}
                    disabled={{ before: new Date(2026, 0, 3) }}
                    className="rounded-lg border"
                />
                <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    defaultMonth={MONTH}
                    today={TODAY}
                    startMonth={new Date(2020, 0)}
                    endMonth={new Date(2030, 11)}
                    showWeekNumber
                    className="rounded-lg border"
                />
            </div>
        ),
    },
    {
        name: "chart",
        components: ["chart"],
        render: () => (
            <div className="grid w-[1000px] grid-cols-2 gap-6">
                <ChartContainer config={CHART_CONFIG} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={CHART_DATA}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value: string) => value.slice(0, 3)} />
                        <ChartTooltip defaultIndex={1} active content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} isAnimationActive={false} />
                        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} isAnimationActive={false} />
                    </BarChart>
                </ChartContainer>
                <ChartContainer config={CHART_CONFIG} className="min-h-[200px] w-full">
                    <LineChart accessibilityLayer data={CHART_DATA}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickFormatter={(value: string) => value.slice(0, 3)} />
                        <ChartTooltip defaultIndex={2} active content={<ChartTooltipContent indicator="line" />} />
                        <Line dataKey="desktop" stroke="var(--color-desktop)" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                </ChartContainer>
            </div>
        ),
    },
    {
        name: "carousel",
        components: ["carousel"],
        render: () => (
            <Row label="Horizontal · vertical" className="flex items-start gap-24 px-14 py-14">
                <Carousel className="w-60">
                    <CarouselContent>
                        {[1, 2, 3, 4].map((index) => (
                            <CarouselItem key={index}>
                                <Card><CardContent className="flex aspect-square items-center justify-center text-4xl font-semibold">{index}</CardContent></Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
                <Carousel orientation="vertical" className="w-48" opts={{ align: "start" }}>
                    <CarouselContent className="h-48">
                        {[1, 2, 3].map((index) => (
                            <CarouselItem key={index} className="basis-1/2">
                                <Card><CardContent className="flex items-center justify-center text-2xl font-semibold">{index}</CardContent></Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </Row>
        ),
    },
    {
        name: "resizable",
        components: ["resizable"],
        render: () => (
            // The groups size themselves to 100% of their parent, so the row carries the height.
            <div className="flex h-48 gap-6">
                <ResizablePanelGroup orientation="horizontal" className="h-48 max-w-md rounded-lg border">
                    <ResizablePanel defaultSize="50%">
                        <div className="flex h-full items-center justify-center p-6 text-sm">One</div>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize="50%">
                        <ResizablePanelGroup orientation="vertical">
                            <ResizablePanel defaultSize="25%">
                                <div className="flex h-full items-center justify-center p-6 text-sm">Two</div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize="75%">
                                <div className="flex h-full items-center justify-center p-6 text-sm">Three</div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>
                <ResizablePanelGroup orientation="horizontal" className="h-48 max-w-md rounded-lg border">
                    <ResizablePanel defaultSize="30%">
                        <div className="flex h-full items-center justify-center p-6 text-sm">Sidebar</div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize="70%">
                        <div className="flex h-full items-center justify-center p-6 text-sm">Content</div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        ),
    },
    {
        name: "sidebar",
        components: ["sidebar"],
        render: () => (
            <div className="flex items-start gap-6">
                <SidebarProvider className="min-h-0 w-auto">
                    <Sidebar collapsible="none" className="h-[760px] rounded-lg border">
                        <SidebarHeader>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton size="lg"><LayoutGrid /><span>Acme Inc</span></SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                            <SidebarInput placeholder="Search the docs..." />
                        </SidebarHeader>
                        <SidebarSeparator />
                        <SidebarContent>
                            <SidebarGroup>
                                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                                <SidebarGroupAction aria-label="Add project"><Plus /></SidebarGroupAction>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton isActive><ChartLine /><span>Dashboard</span></SidebarMenuButton>
                                            <SidebarMenuBadge>24</SidebarMenuBadge>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton><Users /><span>Team</span></SidebarMenuButton>
                                            <SidebarMenuAction aria-label="More"><MoreHorizontal /></SidebarMenuAction>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton variant="outline"><Search /><span>Outline</span></SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton size="sm"><Bell /><span>Small</span></SidebarMenuButton>
                                            <SidebarMenuAction showOnHover aria-label="Hover action"><MoreHorizontal /></SidebarMenuAction>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton disabled><Bell /><span>Disabled</span></SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton><LayoutGrid /><span>Documentation</span><ChevronRight className="ml-auto" /></SidebarMenuButton>
                                            <SidebarMenuSub>
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuSubButton href="#coverage">Introduction</SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuSubButton href="#coverage" isActive>Get Started</SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuSubButton href="#coverage" size="sm">Small sub item</SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            </SidebarMenuSub>
                                        </SidebarMenuItem>
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                            <SidebarGroup>
                                <SidebarGroupLabel>Loading</SidebarGroupLabel>
                                <SidebarMenu>
                                    <SidebarMenuItem><SidebarMenuSkeleton showIcon /></SidebarMenuItem>
                                    <SidebarMenuItem><SidebarMenuSkeleton /></SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroup>
                        </SidebarContent>
                        <SidebarFooter>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton size="lg"><Users /><span>shadcn</span></SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarFooter>
                    </Sidebar>
                </SidebarProvider>
                <div className="relative h-[480px] w-[560px] overflow-hidden rounded-lg border [transform:translateZ(0)]">
                    <SidebarProvider defaultOpen={false} className="min-h-full">
                        <Sidebar collapsible="icon" variant="floating">
                            <SidebarContent>
                                <SidebarGroup>
                                    <SidebarMenu>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton tooltip="Dashboard" isActive><ChartLine /><span>Dashboard</span></SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton tooltip="Team"><Users /><span>Team</span></SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </SidebarMenu>
                                </SidebarGroup>
                            </SidebarContent>
                            <SidebarRail />
                        </Sidebar>
                        <SidebarInset>
                            <header className="flex h-12 items-center gap-2 px-4">
                                <SidebarTrigger />
                                <span className="text-sm">Collapsed to icons, floating</span>
                            </header>
                        </SidebarInset>
                    </SidebarProvider>
                </div>
            </div>
        ),
    },
];
