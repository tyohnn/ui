import { CircleCheck, Clock, Columns, Download, FileText, Filter, Package, Plus, RefreshCw, Tag } from "@tyohnn/icons";

import { DataTableCard, type DataTableColumn } from "@tyohnn/blocks/data-table-card";
import { MetricCards } from "@tyohnn/blocks/metric-cards";
import { PageHeading } from "@tyohnn/blocks/page-heading";
import { Person } from "@tyohnn/blocks/person";
import { RowMenu } from "@tyohnn/blocks/row-menu";
import { TableFilter, TableSearch } from "@tyohnn/blocks/table-filters";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@tyohnn/components/pagination";

import { CHANNEL_FILTERS, METRICS, type Order, type OrderStatus, ORDER_TABS, ORDERS, STATUS_FILTERS } from "./data";

/**
 * The body of the store admin's orders page: four metric cards over the order table with its filters and pages.
 * Fixed data, no time and no randomness. The screen is composed from blocks (registry/blocks): the page heading,
 * the metric cards and the table card; what is the store's own — the status badge, the columns, the actions —
 * stays here. The table scrolls inside its card so the page itself never scrolls.
 */

const STATUS_BADGE: Record<OrderStatus, { variant: "default" | "secondary" | "outline" | "destructive"; icon: typeof Clock }> = {
    Paid: { variant: "secondary", icon: CircleCheck },
    Pending: { variant: "outline", icon: Clock },
    Refunded: { variant: "destructive", icon: RefreshCw },
    Fulfilled: { variant: "default", icon: Package },
};

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

const ROW_ACTIONS = [
    [{ label: "View order" }, { label: "Fulfil items" }, { label: "Print packing slip" }],
    [{ label: "Refund", variant: "destructive" }],
] as const;

const COLUMNS: DataTableColumn<Order>[] = [
    { id: "order", header: "Order", kind: "code", cell: (order) => order.id },
    { id: "customer", header: "Customer", cell: (order) => <Person name={order.customer} detail={order.email} initials={order.initials} /> },
    { id: "date", header: "Date", kind: "nowrap", onSort: () => {}, cell: (order) => order.date },
    { id: "status", header: "Status", cell: (order) => <StatusBadge status={order.status} /> },
    { id: "channel", header: "Channel", kind: "nowrap", cell: (order) => order.channel },
    { id: "items", header: "Items", kind: "number", cell: (order) => order.items },
    { id: "total", header: "Total", kind: "number", cell: (order) => order.total },
    { id: "actions", header: "Actions", hidden: true, cell: (order) => <RowMenu label={`Actions for ${order.id}`} groups={ROW_ACTIONS} /> },
];

const Pages = () => (
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
);

// [contain:inline-size]: the table's width never widens SidebarInset (upstream markup, no min-w-0).
export const Orders = () => (
    <div className="flex h-[calc(100svh-4rem)] min-h-0 flex-col gap-4 p-4 [contain:inline-size]">
        <PageHeading
            title="Orders"
            meta="Wednesday, January 14 · all locations · prices include tax"
            actions={(
                <>
                    <Button variant="outline" size="sm"><Download data-icon="inline-start" />Export</Button>
                    <Button variant="outline" size="sm"><Tag data-icon="inline-start" />Print labels</Button>
                    <Button size="sm"><Plus data-icon="inline-start" />Create order</Button>
                </>
            )}
        />
        <MetricCards metrics={METRICS} />
        <DataTableCard
            columns={COLUMNS}
            rows={ORDERS}
            rowId={(order) => order.id}
            tabs={ORDER_TABS}
            controls={(
                <>
                    <TableSearch label="Search orders" placeholder="Order, customer or email" />
                    <TableFilter label="Status" options={STATUS_FILTERS} />
                    <TableFilter label="Channel" options={CHANNEL_FILTERS} />
                    <Button variant="outline" size="icon-sm" aria-label="More filters"><Filter /></Button>
                    <Button variant="outline" size="icon-sm" aria-label="Columns"><Columns /></Button>
                </>
            )}
            selection={{
                defaultSelected: ORDERS.filter((order) => order.selected).map((order) => order.id),
                selectAllLabel: "Select all orders",
                selectRowLabel: (order) => `Select ${order.id}`,
                summary: (count) => `${count} selected`,
                actions: (
                    <>
                        <Button variant="ghost" size="xs"><Package data-icon="inline-start" />Mark as fulfilled</Button>
                        <Button variant="ghost" size="xs"><FileText data-icon="inline-start" />Print slips</Button>
                    </>
                ),
            }}
            summary="Showing 1–12 of 2,184 orders"
            pagination={<Pages />}
        />
    </div>
);
