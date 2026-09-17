/** The help center's fixed data: Tallyworks, a fictional invoicing and bookkeeping app, and its support content. */

export const POPULAR_SEARCHES = ["Recurring invoices", "VAT returns", "Bank feed not syncing", "Export to CSV", "Two-factor login"] as const;

export const TOPICS = [
    { id: "invoices", icon: "receipt", title: "Invoices & quotes", description: "Create, send and chase invoices, quotes and credit notes.", articles: 42 },
    { id: "payments", icon: "card", title: "Payments", description: "Card and bank payments, payouts, refunds and fees.", articles: 31 },
    { id: "banking", icon: "bank", title: "Bank feeds", description: "Connect accounts, match transactions and fix sync errors.", articles: 27 },
    { id: "taxes", icon: "reports", title: "Taxes & reports", description: "VAT and sales tax returns, profit and loss, balance sheet.", articles: 36 },
    { id: "team", icon: "users", title: "Team & permissions", description: "Invite accountants, set roles and approve expenses.", articles: 18 },
    { id: "security", icon: "shield", title: "Account & security", description: "Sign-in, two-factor, data exports and closing an account.", articles: 22 },
] as const;

export const RECENT_ARTICLES = [
    { id: "a1", title: "Set up automatic reminders for overdue invoices", topic: "Invoices & quotes", updated: "Jan 13, 2026", minutes: 4, tag: "Updated" },
    { id: "a2", title: "Why a bank transaction shows as unmatched", topic: "Bank feeds", updated: "Jan 12, 2026", minutes: 6, tag: null },
    { id: "a3", title: "File a quarterly VAT return from Tallyworks", topic: "Taxes & reports", updated: "Jan 9, 2026", minutes: 8, tag: "New" },
    { id: "a4", title: "Refund a card payment in part or in full", topic: "Payments", updated: "Jan 8, 2026", minutes: 3, tag: null },
    { id: "a5", title: "Give your accountant read-only access", topic: "Team & permissions", updated: "Jan 6, 2026", minutes: 2, tag: null },
    { id: "a6", title: "Turn on two-factor sign-in with an authenticator app", topic: "Account & security", updated: "Jan 5, 2026", minutes: 3, tag: null },
    { id: "a7", title: "Import customers and open balances from a spreadsheet", topic: "Getting started", updated: "Jan 2, 2026", minutes: 5, tag: null },
] as const;

export const TICKETS = [
    { id: "#48213", title: "Payout to Northgate account delayed", status: "Waiting on you", updated: "2h ago" },
    { id: "#48177", title: "Duplicate line on invoice INV-2026-0041", status: "In progress", updated: "Yesterday" },
] as const;

export const SERVICES = [
    { name: "Web app", state: "Operational" },
    { name: "Bank feeds", state: "Operational" },
    { name: "Card payments", state: "Operational" },
    { name: "Email delivery", state: "Degraded" },
] as const;
