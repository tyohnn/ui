/** The analytics screen's fixed data: 30 days of traffic for fernhill.shop (a fictional store), ending 2026-01-14. */

export const PERIODS = [
    { value: "24h", label: "24h" },
    { value: "7d", label: "7d" },
    { value: "30d", label: "30d" },
    { value: "90d", label: "90d" },
];

export const COMPARISONS = [
    { value: "previous", label: "vs. previous period" },
    { value: "year", label: "vs. same period last year" },
    { value: "none", label: "No comparison" },
];

export const KPIS = [
    { label: "Visitors", value: "48,213", change: "+9.2%", trend: "up", note: "Unique people, 30 days" },
    { label: "Page views", value: "162,904", change: "+6.8%", trend: "up", note: "3.4 pages per visit" },
    { label: "Bounce rate", value: "41.3%", change: "-2.1 pts", trend: "down", note: "Lower is better" },
    { label: "Avg. visit", value: "3m 12s", change: "+14s", trend: "up", note: "Median 1m 48s" },
] as const;

export const VISITS = [
    { date: "Dec 16", visitors: 1400, pageViews: 4740 },
    { date: "Dec 17", visitors: 1501, pageViews: 4985 },
    { date: "Dec 18", visitors: 1402, pageViews: 4523 },
    { date: "Dec 19", visitors: 1353, pageViews: 4377 },
    { date: "Dec 20", visitors: 1272, pageViews: 4253 },
    { date: "Dec 21", visitors: 1311, pageViews: 4443 },
    { date: "Dec 22", visitors: 1410, pageViews: 4659 },
    { date: "Dec 23", visitors: 1429, pageViews: 4601 },
    { date: "Dec 24", visitors: 1313, pageViews: 4265 },
    { date: "Dec 25", visitors: 1283, pageViews: 4311 },
    { date: "Dec 26", visitors: 1434, pageViews: 4841 },
    { date: "Dec 27", visitors: 1299, pageViews: 4267 },
    { date: "Dec 28", visitors: 1413, pageViews: 4543 },
    { date: "Dec 29", visitors: 1547, pageViews: 5060 },
    { date: "Dec 30", visitors: 1481, pageViews: 4982 },
    { date: "Dec 31", visitors: 1352, pageViews: 4557 },
    { date: "Jan 1", visitors: 1411, pageViews: 4611 },
    { date: "Jan 2", visitors: 1552, pageViews: 5002 },
    { date: "Jan 3", visitors: 1331, pageViews: 4372 },
    { date: "Jan 4", visitors: 1477, pageViews: 4983 },
    { date: "Jan 5", visitors: 1687, pageViews: 5644 },
    { date: "Jan 6", visitors: 1571, pageViews: 5116 },
    { date: "Jan 7", visitors: 1638, pageViews: 5291 },
    { date: "Jan 8", visitors: 1764, pageViews: 5827 },
    { date: "Jan 9", visitors: 1691, pageViews: 5697 },
    { date: "Jan 10", visitors: 1391, pageViews: 4646 },
    { date: "Jan 11", visitors: 1511, pageViews: 4899 },
    { date: "Jan 12", visitors: 1808, pageViews: 5863 },
    { date: "Jan 13", visitors: 1695, pageViews: 5625 },
    { date: "Jan 14", visitors: 1674, pageViews: 5644 },
];

export const SOURCES = [
    { source: "Search", visitors: 18420, fill: "var(--chart-1)" },
    { source: "Direct", visitors: 11205, fill: "var(--chart-2)" },
    { source: "Social", visitors: 7930, fill: "var(--chart-3)" },
    { source: "Referral", visitors: 5874, fill: "var(--chart-4)" },
    { source: "Email", visitors: 4784, fill: "var(--chart-5)" },
];

export const TOP_PAGES = [
    { path: "/", views: "38,412", bounce: "36.2%", time: "1m 04s" },
    { path: "/collections/winter-linen", views: "21,806", bounce: "28.9%", time: "2m 41s" },
    { path: "/products/oak-serving-board", views: "14,327", bounce: "33.5%", time: "3m 18s" },
    { path: "/journal/hosting-a-slow-dinner", views: "9,915", bounce: "62.4%", time: "4m 52s" },
    { path: "/products/stoneware-mug-set", views: "8,640", bounce: "31.1%", time: "2m 57s" },
    { path: "/cart", views: "7,202", bounce: "18.7%", time: "1m 36s" },
    { path: "/collections/sale", views: "6,118", bounce: "44.0%", time: "1m 49s" },
    { path: "/pages/shipping-and-returns", views: "3,471", bounce: "57.3%", time: "1m 12s" },
];

export const FUNNEL = [
    { step: "Viewed a product", visitors: "18,402", share: 100 },
    { step: "Added to cart", visitors: "6,367", share: 35 },
    { step: "Started checkout", visitors: "3,478", share: 19 },
    { step: "Completed purchase", visitors: "1,362", share: 7 },
];
