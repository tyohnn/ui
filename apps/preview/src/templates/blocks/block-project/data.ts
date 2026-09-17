/** The project overview's fixed data: a fictional studio (Larkspur Studio) and team. "Today" is 2026-01-14. */

export const MEMBERS = [
    { initials: "PR", name: "Priya Raman" },
    { initials: "TO", name: "Tomás Oyelaran" },
    { initials: "HL", name: "Hana Lindqvist" },
    { initials: "DM", name: "Dev Mahajan" },
] as const;

export const STATS = [
    { id: "milestone", label: "Milestone", value: "Beta release", detail: "18 of 28 tasks done", progress: 64 },
    { id: "open", label: "Open tasks", value: "23", detail: "8 due this week · 2 blocked" },
    { id: "due", label: "Due date", value: "Feb 27, 2026", detail: "44 days left · 6 weeks of 14" },
    { id: "hours", label: "Hours logged", value: "312 h", detail: "of 480 h budgeted", progress: 65 },
] as const;

export type Priority = "Urgent" | "High" | "Medium" | "Low";

export const TASKS: { id: string; title: string; area: string; assignee: string; priority: Priority; due: string; done?: boolean }[] = [
    { id: "ATL-142", title: "Finalise onboarding copy for the three welcome screens", area: "Content", assignee: "HL", priority: "High", due: "Today", done: true },
    { id: "ATL-151", title: "Fix crash when resuming an upload after airplane mode", area: "iOS", assignee: "DM", priority: "Urgent", due: "Today" },
    { id: "ATL-148", title: "Review push notification permission prompt with legal", area: "Compliance", assignee: "PR", priority: "High", due: "Jan 15" },
    { id: "ATL-137", title: "Export dark-mode icon set at 1x, 2x and 3x", area: "Design", assignee: "TO", priority: "Medium", due: "Jan 15", done: true },
    { id: "ATL-155", title: "Wire the offline banner to the sync status endpoint", area: "Android", assignee: "DM", priority: "High", due: "Jan 16" },
    { id: "ATL-149", title: "Write test plan for the beta cohort of 250 testers", area: "QA", assignee: "HL", priority: "Medium", due: "Jan 16" },
    { id: "ATL-160", title: "Draft App Store screenshots and captions", area: "Marketing", assignee: "TO", priority: "Low", due: "Jan 17" },
    { id: "ATL-158", title: "Agree on crash-free sessions target for launch", area: "Planning", assignee: "PR", priority: "Medium", due: "Jan 17" },
];

export const ACTIVITY = [
    { who: "Dev Mahajan", initials: "DM", action: "moved ATL-151 to In review", when: "12 min ago" },
    { who: "Hana Lindqvist", initials: "HL", action: "completed ATL-142 Onboarding copy", when: "48 min ago" },
    { who: "Tomás Oyelaran", initials: "TO", action: "uploaded icons-dark-v3.zip", when: "2 h ago" },
    { who: "Priya Raman", initials: "PR", action: "changed the beta date to Feb 27", when: "Yesterday, 17:40" },
    { who: "Dev Mahajan", initials: "DM", action: "commented on ATL-155 Offline banner", when: "Yesterday, 15:02" },
    { who: "Hana Lindqvist", initials: "HL", action: "added 12 test cases to the beta plan", when: "Jan 12, 11:20" },
] as const;

export const FILES = [
    { name: "Atlas beta brief.pdf", meta: "PDF · 1.2 MB · Priya", kind: "doc" },
    { name: "icons-dark-v3.zip", meta: "ZIP · 8.4 MB · Tomás", kind: "archive" },
    { name: "Onboarding flow.fig", meta: "Design · 24 MB · Hana", kind: "image" },
    { name: "Beta test plan", meta: "Doc · edited 3 h ago · Hana", kind: "doc" },
] as const;
