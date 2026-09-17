import {
    ArrowUpDown,
    CircleCheck,
    Clock,
    Columns,
    Download,
    FileText,
    Filter,
    MoreHorizontal,
    Package,
    Plus,
    RefreshCw,
    Search,
    Tag,
    TrendingDown,
    TrendingUp,
} from "@tyohnn/icons";

import { Avatar, AvatarFallback } from "@tyohnn/components/avatar";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@tyohnn/components/card";
import { Checkbox } from "@tyohnn/components/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@tyohnn/components/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@tyohnn/components/input-group";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@tyohnn/components/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@tyohnn/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tyohnn/components/table";
import { Tabs, TabsList, TabsTrigger } from "@tyohnn/components/tabs";

import { CHANNEL_FILTERS, METRICS, type Order, type OrderStatus, ORDER_TABS, ORDERS, STATUS_FILTERS } from "./data";

/**
 * The body of the store admin's orders page: four metric cards over the order table with its filters and pages.
 * Fixed data, no time and no randomness. Layout utilities only; the title band, small meta text and numeric cells
 * read tokens in ORDERS_STYLE. The table scrolls inside its card so the page itself never scrolls.
 */

const STATUS_BADGE: Record<OrderStatus, { variant: "default" | "secondary" | "outline" | "destructive"; icon: typeof Clock }> = {
    Paid: { variant: "secondary", icon: CircleCheck },
    Pending: { variant: "outline", icon: Clock },
    Refunded: { variant: "destructive", icon: RefreshCw },
    Fulfilled: { variant: "default", icon: Package },
};

const toItems = (values: string[]) => values.map((value) => ({ value, label: value }));

const FilterSelect = ({ label, values }: { label: string; values: string[] }) => (
    <Select items={toItems(values)} defaultValue={values[0]}>
        <SelectTrigger size="sm" aria-label={label} className="min-w-36">
            <SelectValue />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                {values.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
            </SelectGroup>
        </SelectContent>
    </Select>
);

const PageTitle = () => (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="or-title">Orders</h1>
            <span className="or-meta">Wednesday, January 14 · all locations · prices include tax</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm"><Download data-icon="inline-start" />Export</Button>
            <Button variant="outline" size="sm"><Tag data-icon="inline-start" />Print labels</Button>
            <Button size="sm"><Plus data-icon="inline-start" />Create order</Button>
        </div>
    </div>
);

const Metrics = () => (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {METRICS.map((metric) =>
        {
            const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown;

            return (
                <Card key={metric.label} size="sm">
                    <CardHeader>
                        <CardDescription>{metric.label}</CardDescription>
                        <CardTitle className="or-figure">{metric.value}</CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                <TrendIcon data-icon="inline-start" />
                                {metric.change}
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter>
                        <span className="or-meta">{metric.note}</span>
                    </CardFooter>
                </Card>
            );
        })}
    </div>
);

const StatusBadge = ({ status }: { status: OrderStatus }) =>
{
    const { variant, icon: Icon } = STATUS_BADGE[status];

    return (
        <Badge variant={variant}>
            <Icon data-icon="inline-start" />
            {status}
        </Badge>
    );
};

const RowMenu = ({ order }: { order: Order }) => (
    <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" aria-label={`Actions for ${order.id}`} />}>
            <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuGroup>
                <DropdownMenuItem>View order</DropdownMenuItem>
                <DropdownMenuItem>Fulfil items</DropdownMenuItem>
                <DropdownMenuItem>Print packing slip</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Refund</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);

const OrderRow = ({ order }: { order: Order }) => (
    <TableRow data-state={order.selected ? "selected" : undefined}>
        <TableCell><Checkbox defaultChecked={order.selected} aria-label={`Select ${order.id}`} /></TableCell>
        <TableCell className="or-mono">{order.id}</TableCell>
        <TableCell>
            <div className="flex items-center gap-2">
                <Avatar size="sm"><AvatarFallback>{order.initials}</AvatarFallback></Avatar>
                <div className="flex min-w-0 flex-col">
                    <span>{order.customer}</span>
                    <span className="or-meta">{order.email}</span>
                </div>
            </div>
        </TableCell>
        <TableCell className="or-nowrap">{order.date}</TableCell>
        <TableCell><StatusBadge status={order.status} /></TableCell>
        <TableCell className="or-nowrap">{order.channel}</TableCell>
        <TableCell className="or-number">{order.items}</TableCell>
        <TableCell className="or-number">{order.total}</TableCell>
        <TableCell><RowMenu order={order} /></TableCell>
    </TableRow>
);

const OrdersTable = () => (
    <Card className="min-h-0 flex-1 gap-0 py-0">
        <div className="or-toolbar flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3">
            <Tabs defaultValue="all">
                <TabsList>
                    {ORDER_TABS.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                            {tab.label}
                            <span className="or-meta">{tab.count}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
            <div className="flex flex-wrap items-center gap-2">
                <InputGroup className="w-56">
                    <InputGroupAddon><Search /></InputGroupAddon>
                    <InputGroupInput aria-label="Search orders" placeholder="Order, customer or email" />
                </InputGroup>
                <FilterSelect label="Status" values={STATUS_FILTERS} />
                <FilterSelect label="Channel" values={CHANNEL_FILTERS} />
                <Button variant="outline" size="icon-sm" aria-label="More filters"><Filter /></Button>
                <Button variant="outline" size="icon-sm" aria-label="Columns"><Columns /></Button>
            </div>
        </div>
        <div className="or-selection flex flex-wrap items-center gap-2 px-4 py-2">
            <span className="or-meta">2 selected</span>
            <Button variant="ghost" size="xs"><Package data-icon="inline-start" />Mark as fulfilled</Button>
            <Button variant="ghost" size="xs"><FileText data-icon="inline-start" />Print slips</Button>
        </div>
        <CardContent className="min-h-0 flex-1 overflow-y-auto px-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><Checkbox indeterminate aria-label="Select all orders" /></TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>
                            <Button variant="ghost" size="xs" className="-ml-2">
                                Date
                                <ArrowUpDown data-icon="inline-end" />
                            </Button>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead className="or-number">Items</TableHead>
                        <TableHead className="or-number">Total</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ORDERS.map((order) => <OrderRow key={order.id} order={order} />)}
                </TableBody>
            </Table>
        </CardContent>
        <div className="or-footer flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
            <span className="or-meta">Showing 1–12 of 2,184 orders</span>
            <Pagination className="mx-0 w-auto">
                <PaginationContent>
                    <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                    <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
                    <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
                    <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
                    <PaginationItem><PaginationEllipsis /></PaginationItem>
                    <PaginationItem><PaginationLink href="#">182</PaginationLink></PaginationItem>
                    <PaginationItem><PaginationNext href="#" /></PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    </Card>
);

// [contain:inline-size]: the table's width never widens SidebarInset (upstream markup, no min-w-0).
export const Orders = () => (
    <div className="flex h-[calc(100svh-4rem)] min-h-0 flex-col gap-4 p-4 [contain:inline-size]">
        <PageTitle />
        <Metrics />
        <OrdersTable />
    </div>
);

/** The template's own stylesheet: system tokens only (title, figures, meta text, dividers, numeric cells). */
export const ORDERS_STYLE = `
[data-template="block-orders"] .or-title { margin: 0; font-family: var(--font-heading); font-size: var(--ui-text-lg); line-height: var(--ui-line-height-lg); font-weight: 600; color: var(--foreground); }
[data-template="block-orders"] .or-meta { font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); font-variant-numeric: tabular-nums; white-space: nowrap; }
[data-template="block-orders"] .or-figure { font-variant-numeric: tabular-nums; }
[data-template="block-orders"] .or-mono { font-family: var(--font-mono); white-space: nowrap; }
[data-template="block-orders"] .or-nowrap { white-space: nowrap; }
[data-template="block-orders"] .or-number { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
[data-template="block-orders"] .or-toolbar { border-bottom: 1px solid var(--border); }
[data-template="block-orders"] .or-selection { border-bottom: 1px solid var(--border); background-color: var(--muted); }
[data-template="block-orders"] .or-footer { border-top: 1px solid var(--border); }
`;
