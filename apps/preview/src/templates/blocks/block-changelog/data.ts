/** The changelog's fixed data: Orbitly, a fictional team planning app, and its 4.0 release post (Jan 14, 2026). */

export const RELEASE = { version: "v4.0.0", date: "January 14, 2026", tags: ["Major release", "Web", "Mobile", "API"] } as const;

export const AUTHORS = [
    { initials: "NA", name: "Noor Aziz", role: "Product" },
    { initials: "TL", name: "Tomás Lindqvist", role: "Engineering" },
] as const;

export const TIMELINE_ROWS = [
    { name: "Checkout redesign", owner: "Mei", start: 4, span: 44, progress: 72, state: "On track" },
    { name: "Partner API v2", owner: "Kofi", start: 22, span: 52, progress: 38, state: "At risk" },
    { name: "Onboarding emails", owner: "Lena", start: 58, span: 30, progress: 10, state: "Not started" },
] as const;

export const FEATURES_SHORT = [
    { id: "bulk-edit", title: "Bulk edit", badge: null, body: "Select up to 500 tasks with Shift-click and change status, assignee, due date or labels in one step. Every change is one undo." },
    { id: "guests", title: "Guest access", badge: "Business", body: "Invite clients and contractors to a single project. Guests see only what is shared with them and do not use a seat." },
    { id: "recurring", title: "Recurring tasks", badge: null, body: "Repeat a task daily, on weekdays, every n weeks or on the last working day of the month. The next copy is created when the current one is done." },
    { id: "palette", title: "Command palette", badge: null, body: "Press ⌘K anywhere to jump to a project, create a task or run any menu command. Recent items come first." },
    { id: "theme", title: "Theme schedule", badge: null, body: "Switch between light and dark at set times, or follow the operating system. The setting now syncs across devices." },
    { id: "chat", title: "Chat integrations", badge: "Beta", body: "Post task updates to team chat channels and create tasks from a message with the /orbitly command." },
    { id: "csv", title: "CSV import", badge: null, body: "Map columns to fields, preview the first 20 rows and fix errors before anything is created. Imports of up to 50,000 rows run in the background." },
    { id: "audit", title: "Audit log", badge: "Enterprise", body: "See who changed permissions, exported data or deleted projects in the last 400 days, and stream events to your own storage." },
] as const;

export const IMPROVEMENTS = [
    { id: "editor-speed", title: "Editor speed", body: "Opening a task with 200 comments is 3.4× faster, and typing latency in long descriptions dropped from 38 ms to 9 ms." },
    { id: "search", title: "Search ranking", body: "Exact title matches and tasks assigned to you rank first; archived projects are hidden unless you ask for them." },
    { id: "notifications", title: "Notifications", body: "Mentions, assignments and due dates are grouped per task, so a busy thread sends one notification instead of twelve." },
    { id: "mobile", title: "Mobile layout", body: "Boards scroll one column at a time on phones, and the task sheet keeps its toolbar above the keyboard." },
    { id: "a11y", title: "Accessibility", body: "Every board action has a keyboard shortcut, focus stays on the moved card, and status colours meet WCAG AA contrast." },
    { id: "pagination", title: "API pagination", body: "List endpoints return a next_cursor. Offset pagination still works until July 1, 2026." },
] as const;

export const FIXES = [
    { id: "sync", title: "Sync conflicts", body: "Two people editing the same field offline no longer silently keep the older value; the later edit wins and both appear in history." },
    { id: "time-zones", title: "Time zones", body: "Due dates set near midnight no longer move a day for teammates west of UTC." },
    { id: "attachments", title: "Attachments", body: "Images pasted into comments upload once instead of twice on slow connections." },
    { id: "exports", title: "Exports", body: "PDF exports keep custom field values and no longer cut the last row of long tables." },
    { id: "sign-in", title: "Sign-in loops", body: "Single sign-on users with an expired session are sent to their identity provider once, not in a loop." },
] as const;

export const MIGRATION_EXAMPLE = `// Before (v1): fields at the top level, status as a label
app.post("/hooks/orbitly", (req) => {
  const { task_id, status_label } = req.body;
  if (status_label === "Done") ship(task_id);
});

// After (v2): one event envelope, status as a stable key
app.post("/hooks/orbitly", (req) => {
  const { type, data } = req.body;          // type: "task.updated"
  if (data.task.status.key === "done") ship(data.task.id);
});`;

export const EARLIER = [
    { version: "v3.9.2", date: "Dec 16, 2025", title: "Faster board loading and 14 fixes" },
    { version: "v3.9.0", date: "Nov 27, 2025", title: "Workload view and label groups" },
    { version: "v3.8.0", date: "Oct 30, 2025", title: "Project templates and guest comments" },
] as const;
