/** The settings dialog's fixed data: a fictional team chat app (Parley) and its workspace. */

export const ACTIVITY_SWITCHES = [
    { id: "sd-direct", label: "Direct messages", description: "Someone writes to you or a group you are in", on: true },
    { id: "sd-mentions", label: "Mentions", description: "@you, @here in channels you follow, and your keywords", on: true },
    { id: "sd-threads", label: "Thread replies", description: "New replies in threads you started or follow", on: true },
    { id: "sd-reactions", label: "Reactions", description: "Someone reacts to one of your messages", on: false },
    { id: "sd-joins", label: "Channel joins", description: "A new member joins a channel you manage", on: false },
] as const;

export const EMAIL_FREQUENCY = [
    { value: "immediately", label: "As it happens", description: "One email per unread notification after 10 minutes" },
    { value: "hourly", label: "Hourly digest", description: "A summary at the top of each hour, if there is anything new" },
    { value: "daily", label: "Daily digest", description: "Every weekday at 09:00" },
    { value: "never", label: "Never", description: "Security and billing emails are always sent" },
] as const;

export const HOURS = ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "06:00", "07:00", "08:00", "09:00"] as const;

export const CHANNELS = ["Desktop", "Mobile", "Email"] as const;

export const CHANNEL_ROWS = [
    { event: "Direct messages", on: [true, true, true] },
    { event: "Mentions", on: [true, true, false] },
    { event: "Thread replies", on: [true, false, false] },
    { event: "Calendar reminders", on: [true, true, false] },
    { event: "Workspace billing", on: [false, false, true] },
] as const;
