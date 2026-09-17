/**
 * The document editor's fixed data: a project brief at Kestrel Works (a fictional company; people and customers
 * are fictional too). Dates are around 2026-01-14.
 */

export const PROPERTIES = {
    status: "In review",
    owner: { name: "Lena Marsh", initials: "LM" },
    reviewers: [
        { name: "Omar Siddiqui", initials: "OS" },
        { name: "Yuki Tanaka", initials: "YT" },
        { name: "Grace Oduya", initials: "GO" },
    ],
    due: "Feb 27, 2026",
    tags: ["Checkout", "Q1 bet", "Web + iOS"],
    updated: "Jan 14, 2026 · 10:42",
};

export const CHECKLIST = [
    { id: "ed-check-1", label: "Audit the five checkout steps and record drop-off per step", done: true },
    { id: "ed-check-2", label: "Run eight moderated sessions with returning customers", done: true },
    { id: "ed-check-3", label: "Prototype the single-page flow with saved payment methods", done: true },
    { id: "ed-check-4", label: "Agree the tax and shipping estimate rules with finance", done: false },
    { id: "ed-check-5", label: "Write the A/B test plan and the guardrail metrics", done: false },
];

export const MILESTONES = [
    { name: "Discovery complete", owner: "Lena Marsh", date: "Jan 9", status: "Done" },
    { name: "Design sign-off", owner: "Yuki Tanaka", date: "Jan 23", status: "In progress" },
    { name: "Build behind a flag", owner: "Omar Siddiqui", date: "Feb 13", status: "Not started" },
    { name: "10% experiment", owner: "Grace Oduya", date: "Feb 20", status: "Not started" },
    { name: "Full rollout", owner: "Lena Marsh", date: "Feb 27", status: "At risk" },
] as const;

export const FLAG_CONFIG = `// flags/checkout.ts
export const checkoutSinglePage = defineFlag({
  key: "checkout-single-page",
  owner: "payments",
  rollout: { web: 0.1, ios: 0 },
  guardrails: ["payment_error_rate", "refund_rate"],
});`;
