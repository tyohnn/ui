/** The orders screen's fixed data: Harbor Goods, a fictional homeware store, on 2026-01-14. */

export type Trend = "up" | "down";

export const METRICS = [
    { label: "Today's revenue", value: "$18,420.50", change: "+12.4%", trend: "up", note: "vs. $16,388 on Tuesday" },
    { label: "Orders", value: "214", change: "+8.1%", trend: "up", note: "31 waiting to be fulfilled" },
    { label: "Average order value", value: "$86.08", change: "+3.9%", trend: "up", note: "Bundles lifted the basket" },
    { label: "Refunds", value: "$642.00", change: "-2.3%", trend: "down", note: "7 refunds · 0.3% of revenue" },
] as const satisfies readonly { label: string; value: string; change: string; trend: Trend; note: string }[];

export type OrderStatus = "Paid" | "Pending" | "Refunded" | "Fulfilled";

export type Order = {
    id: string;
    customer: string;
    initials: string;
    email: string;
    date: string;
    status: OrderStatus;
    channel: string;
    items: number;
    total: string;
    selected?: boolean;
};

export const ORDERS: Order[] = [
    { id: "#HG-10482", customer: "Olivia Brennan", initials: "OB", email: "olivia.brennan@mailbox.test", date: "Jan 14, 09:42", status: "Paid", channel: "Online store", items: 3, total: "$248.00", selected: true },
    { id: "#HG-10481", customer: "Mateo Alvarez", initials: "MA", email: "mateo@alvarez.test", date: "Jan 14, 09:15", status: "Pending", channel: "Marketplace", items: 1, total: "$64.50" },
    { id: "#HG-10480", customer: "Priya Raman", initials: "PR", email: "priya.raman@inbox.test", date: "Jan 14, 08:57", status: "Fulfilled", channel: "Online store", items: 5, total: "$412.90", selected: true },
    { id: "#HG-10479", customer: "Jonas Weber", initials: "JW", email: "j.weber@post.test", date: "Jan 14, 08:31", status: "Paid", channel: "Point of sale", items: 2, total: "$96.00" },
    { id: "#HG-10478", customer: "Amara Nwosu", initials: "AN", email: "amara.n@mailbox.test", date: "Jan 13, 22:04", status: "Refunded", channel: "Online store", items: 1, total: "$129.00" },
    { id: "#HG-10477", customer: "Lucas Moreau", initials: "LM", email: "lucas@moreau.test", date: "Jan 13, 20:48", status: "Fulfilled", channel: "Social shop", items: 4, total: "$187.40" },
    { id: "#HG-10476", customer: "Sofia Lindgren", initials: "SL", email: "sofia.lindgren@inbox.test", date: "Jan 13, 19:12", status: "Paid", channel: "Online store", items: 2, total: "$73.80" },
    { id: "#HG-10475", customer: "Kenji Watanabe", initials: "KW", email: "kenji.w@post.test", date: "Jan 13, 17:36", status: "Pending", channel: "Wholesale", items: 24, total: "$1,860.00" },
    { id: "#HG-10474", customer: "Grace Adeyemi", initials: "GA", email: "grace@adeyemi.test", date: "Jan 13, 16:03", status: "Fulfilled", channel: "Point of sale", items: 1, total: "$38.00" },
    { id: "#HG-10473", customer: "Henrik Dahl", initials: "HD", email: "henrik.dahl@mailbox.test", date: "Jan 13, 14:27", status: "Refunded", channel: "Marketplace", items: 2, total: "$154.20" },
    { id: "#HG-10472", customer: "Isabel Costa", initials: "IC", email: "isabel.costa@inbox.test", date: "Jan 13, 12:55", status: "Paid", channel: "Online store", items: 6, total: "$302.75" },
    { id: "#HG-10471", customer: "Tomás Novak", initials: "TN", email: "tomas@novak.test", date: "Jan 13, 11:08", status: "Fulfilled", channel: "Social shop", items: 1, total: "$45.00" },
];

export const STATUS_FILTERS = ["All statuses", "Paid", "Pending", "Fulfilled", "Refunded"];

export const CHANNEL_FILTERS = ["All channels", "Online store", "Point of sale", "Marketplace", "Social shop", "Wholesale"];

export const ORDER_TABS = [
    { value: "all", label: "All", count: "2,184" },
    { value: "unfulfilled", label: "Unfulfilled", count: "31" },
    { value: "unpaid", label: "Unpaid", count: "12" },
    { value: "returns", label: "Returns", count: "7" },
];
