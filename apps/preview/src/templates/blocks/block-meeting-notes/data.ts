/**
 * The meeting notes' fixed data: Juniper Labs' weekly product sync on 2026-01-14 (company and people are fictional).
 */

export const ATTENDEES = [
    { name: "Maya Brennan", initials: "MB" },
    { name: "Daniel Osei", initials: "DO" },
    { name: "Clara Weiss", initials: "CW" },
    { name: "Ravi Menon", initials: "RM" },
    { name: "Sofia Lindgren", initials: "SL" },
];

export const AGENDA = [
    { title: "Metrics check-in: activation and week-4 retention", owner: "Daniel Osei", minutes: 10, done: true },
    { title: "Mobile 3.2 release readiness", owner: "Ravi Menon", minutes: 15, done: true },
    { title: "Pricing page experiment results", owner: "Clara Weiss", minutes: 10, done: true },
    { title: "Q1 hiring: design and support roles", owner: "Maya Brennan", minutes: 10, done: false },
];

export const DECISIONS = [
    "Ship Mobile 3.2 on Tuesday, Jan 20, with offline drafts behind a flag for 20% of users.",
    "Keep the annual-plan toggle on by default; the variant lifted paid conversion by 8.4%.",
    "Move the support hire ahead of the second designer; revisit on Feb 4.",
];

export const ACTION_ITEMS = [
    { task: "Write the 3.2 release notes and in-app changelog", owner: "Ravi Menon", initials: "RM", due: "Jan 16", status: "In progress" },
    { task: "Roll out the pricing variant to 100% of traffic", owner: "Clara Weiss", initials: "CW", due: "Jan 19", status: "To do" },
    { task: "Share the retention cohort dashboard with sales", owner: "Daniel Osei", initials: "DO", due: "Jan 15", status: "Done" },
    { task: "Post the support engineer job description", owner: "Maya Brennan", initials: "MB", due: "Jan 21", status: "To do" },
    { task: "Confirm crash-free rate above 99.5% on beta", owner: "Sofia Lindgren", initials: "SL", due: "Jan 19", status: "Blocked" },
] as const;
