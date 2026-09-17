/** The roadmap's fixed data: Kestrel Pay's Q1 2026 board (a fictional company and team). Dates are relative to 2026-01-14. */

export type Person = { initials: string; name: string };

export const PEOPLE = {
    ao: { initials: "AO", name: "Ada Osei" },
    bl: { initials: "BL", name: "Bruno Lindqvist" },
    cm: { initials: "CM", name: "Chiara Moretti" },
    dk: { initials: "DK", name: "Daniel Kowal" },
    er: { initials: "ER", name: "Elena Ruiz" },
    fn: { initials: "FN", name: "Farah Nadeem" },
    gt: { initials: "GT", name: "Gideon Tan" },
    hv: { initials: "HV", name: "Hana Vogel" },
} satisfies Record<string, Person>;

export type RoadmapCard = {
    id: string;
    title: string;
    areas: string[];
    owners: Person[];
    /** Percent done, or a checklist count */
    progress?: number;
    checklist?: [done: number, total: number];
    due: string;
    priority?: "High" | "Urgent";
    comments?: number;
};

export type RoadmapColumn = {
    id: "backlog" | "planned" | "progress" | "shipped";
    title: string;
    count: number;
    cards: RoadmapCard[];
};

const { ao, bl, cm, dk, er, fn, gt, hv } = PEOPLE;

export const COLUMNS: RoadmapColumn[] = [
    {
        id: "backlog",
        title: "Backlog",
        count: 14,
        cards: [
            { id: "RM-212", title: "Saved card vault for repeat buyers", areas: ["Billing"], owners: [ao], checklist: [0, 6], due: "Apr 2", comments: 3 },
            { id: "RM-208", title: "Multi-currency payouts in settings", areas: ["Platform", "Billing"], owners: [dk, hv], checklist: [1, 5], due: "Mar 28" },
            { id: "RM-201", title: "Offline mode for the receipt scanner", areas: ["Mobile apps"], owners: [gt], checklist: [0, 4], due: "Apr 16", comments: 7 },
            { id: "RM-197", title: "Webhook replay from the dashboard", areas: ["Integrations"], owners: [bl, fn], checklist: [2, 8], due: "Mar 20", priority: "High" },
            { id: "RM-190", title: "Search synonyms for merchant names", areas: ["Search"], owners: [cm], checklist: [0, 3], due: "Apr 9" },
        ],
    },
    {
        id: "planned",
        title: "Planned",
        count: 9,
        cards: [
            { id: "RM-184", title: "Invoice reminders with custom schedules", areas: ["Billing"], owners: [ao, er], progress: 10, due: "Feb 27", comments: 12 },
            { id: "RM-176", title: "Guided setup for new workspaces", areas: ["Onboarding"], owners: [hv, cm, gt], progress: 5, due: "Feb 20", priority: "High" },
            { id: "RM-171", title: "Role templates for finance teams", areas: ["Platform"], owners: [dk], checklist: [3, 7], due: "Mar 6" },
            { id: "RM-163", title: "Ledger export to accounting apps", areas: ["Integrations"], owners: [fn, bl], checklist: [1, 4], due: "Mar 13", comments: 4 },
        ],
    },
    {
        id: "progress",
        title: "In progress",
        count: 6,
        cards: [
            { id: "RM-158", title: "Instant payouts to debit cards", areas: ["Billing", "Platform"], owners: [er, dk, ao, hv], progress: 72, due: "Jan 23", priority: "Urgent", comments: 18 },
            { id: "RM-152", title: "Search filters for disputes", areas: ["Search"], owners: [cm, bl], progress: 45, due: "Jan 30", comments: 6 },
            { id: "RM-149", title: "Tap to pay on phones", areas: ["Mobile apps"], owners: [gt, fn], progress: 38, due: "Feb 6", priority: "High", comments: 9 },
            { id: "RM-141", title: "Checklist for first payout", areas: ["Onboarding"], owners: [hv], checklist: [5, 6], due: "Jan 16" },
        ],
    },
    {
        id: "shipped",
        title: "Shipped",
        count: 21,
        cards: [
            { id: "RM-137", title: "Two-step approval for refunds", areas: ["Platform"], owners: [dk, er], progress: 100, due: "Jan 12", comments: 5 },
            { id: "RM-133", title: "Payment links with QR codes", areas: ["Billing", "Mobile apps"], owners: [ao, gt], progress: 100, due: "Jan 8" },
            { id: "RM-128", title: "Team chat alerts for failed charges", areas: ["Integrations"], owners: [fn], checklist: [4, 4], due: "Jan 5", comments: 2 },
        ],
    },
];

export const QUARTERS = [
    { value: "q4-2025", label: "Q4 2025" },
    { value: "q1-2026", label: "Q1 2026" },
    { value: "q2-2026", label: "Q2 2026" },
];

export const AREAS = ["All areas", "Billing", "Onboarding", "Search", "Mobile apps", "Integrations", "Platform"];

export const TEAM = [PEOPLE.ao, PEOPLE.bl, PEOPLE.cm, PEOPLE.dk, PEOPLE.er];
