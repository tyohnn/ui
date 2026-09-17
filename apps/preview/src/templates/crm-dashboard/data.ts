/**
 * Fictional data for the CRM dashboard. The layout and the numbers follow the Sales CRM reference
 * screen; every company and person is invented (the company names are the well-known sample names
 * used in documentation), so the template can ship in a public repository.
 */

export type TagTone = "blue" | "purple" | "green" | "orange" | "red" | "yellow" | "gray";

export const TAG_TONE: Record<string, TagTone> = {
    Enterprise: "blue",
    Upsell: "purple",
    "New Logo": "green",
    Renewal: "green",
    Expansion: "green",
    "Mid-Market": "green",
    "Land & Expand": "green",
    Pilot: "orange",
    "Co-Sell": "orange",
    Strategic: "red",
    SMB: "yellow",
    "+2": "gray",
};

export type CompanyRow = {
    company: string;
    tags: string[];
    owner: string;
    deals: number;
    value: string;
    win: number;
    date: string;
    touch: string;
    selected?: boolean;
};

export const ROWS: CompanyRow[] = [
    { company: "Northwind Traders", tags: ["Enterprise", "Upsell", "+2"], owner: "Mara Ellison", deals: 7, value: "420,000", win: 70, date: "Feb 21", touch: "QBR Call" },
    { company: "Fabrikam", tags: ["Enterprise", "New Logo"], owner: "Theo Brandt", deals: 4, value: "311,242", win: 51, date: "Feb 22", touch: "Demo" },
    { company: "Woodgrove Bank", tags: ["Enterprise"], owner: "Priya Okafor", deals: 5, value: "124,232", win: 22, date: "Mar 12", touch: "Security" },
    { company: "Blue Yonder Air", tags: ["Renewal"], owner: "Lena Voss", deals: 2, value: "221,231", win: 77, date: "Mar 17", touch: "Legal" },
    { company: "Contoso", tags: ["Pilot"], owner: "Rafael Quinn", deals: 6, value: "530,111", win: 82, date: "Mar 12", touch: "Exec" },
    { company: "Adventure Works", tags: ["Strategic", "Expansion"], owner: "Iris Holloway", deals: 8, value: "320,222", win: 86, date: "Mar 15", touch: "Pilot", selected: true },
    { company: "Margie's Travel", tags: ["Upsell", "Expansion", "+2"], owner: "Dev Marlow", deals: 3, value: "122,230", win: 51, date: "Mar 18", touch: "Pricing" },
    { company: "Litware", tags: ["Enterprise", "Mid-Market"], owner: "Nora Kade", deals: 5, value: "230,112", win: 61, date: "Mar 28", touch: "Product" },
    { company: "Proseware", tags: ["Mid-Market", "Upsell", "+2"], owner: "Felix Arden", deals: 2, value: "420,222", win: 38, date: "Jun 14", touch: "Pricing" },
    { company: "Tailspin Toys", tags: ["SMB", "Enterprise", "+2"], owner: "Hana Sorel", deals: 8, value: "112,277", win: 24, date: "Jun 7", touch: "Renewal" },
    { company: "Fourth Coffee", tags: ["Mid-Market"], owner: "Owen Tate", deals: 3, value: "221,221", win: 72, date: "Jun 18", touch: "Pilot" },
    { company: "Wingtip Toys", tags: ["Land & Expand", "+2"], owner: "Clara Wynn", deals: 5, value: "170,991", win: 55, date: "Jul 1", touch: "Expansion" },
    { company: "Alpine Ski House", tags: ["Co-Sell", "Expansion"], owner: "Jonah Pike", deals: 9, value: "139,007", win: 45, date: "Jul 18", touch: "Renewal" },
    { company: "Coho Winery", tags: ["Expansion", "+2"], owner: "Maya Lund", deals: 8, value: "289,921", win: 38, date: "Aug 8", touch: "Partner" },
    { company: "Lamna Health", tags: ["Mid-Market", "Co-Sell"], owner: "Eli Varga", deals: 4, value: "333,221", win: 23, date: "Aug 12", touch: "Discovery" },
    { company: "Trey Research", tags: ["Expansion", "SMB", "+2"], owner: "Sofia Crane", deals: 3, value: "442,231", win: 44, date: "Sept 09", touch: "Demo" },
    { company: "Relecloud", tags: ["Enterprise", "Mid-Market"], owner: "Leo Hart", deals: 6, value: "520,000", win: 24, date: "Sept 11", touch: "Pricing" },
    { company: "VanArsdel", tags: ["Expansion", "Co-Sell", "+2"], owner: "Ada Finch", deals: 2, value: "210,123", win: 52, date: "Sept 18", touch: "QBR Call" },
];

export const CURRENT_USER = "Robin Hale";

export const COLUMNS = ["Companies", "Segment & Stage", "Account Owner", "Open Deals", "Pipeline Value", "Win Probability", "Activity Trend", "Last Interaction", "Actions"];

/** Column widths of the reference table (px). The table lays out automatically, so they are minimums: a system with larger type widens a column instead of letting cells collide. */
export const COLUMN_WIDTHS = [40, 155, 210, 137, 87, 100, 131, 97, 142];

export const AVATAR_TONES = ["slate", "teal", "plum", "olive", "rust", "navy", "moss", "mauve"] as const;

export const initials = (name: string) => name.split(" ").map((word) => word[0]).join("").slice(0, 2);

export const avatarTone = (name: string) => AVATAR_TONES[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % AVATAR_TONES.length];

/**
 * Sixteen activity levels per row (0 = faint dot, 1–2 = short bar, 3–4 = tall bar), from a fixed seed:
 * the same row always draws the same trend, with no Math.random.
 */
export const activityLevels = (seed: number) =>
{
    let state = (seed * 7919 + 104729) % 233280;
    const next = () =>
    {
        state = (state * 9301 + 49297) % 233280;

        return state / 233280;
    };
    const tall = 3 + Math.floor(next() * 3);
    const short = 3 + Math.floor(next() * 3);
    const levels = [
        ...Array.from({ length: tall }, () => (next() < 0.5 ? 3 : 4)),
        ...Array.from({ length: short }, () => (next() < 0.6 ? 1 : 2)),
        ...Array.from({ length: 16 - tall - short }, () => 0),
    ];

    for (let index = levels.length - 1; index > 0; index--)
    {
        const swap = Math.floor(next() * (index + 1));

        [levels[index], levels[swap]] = [levels[swap], levels[index]];
    }

    return levels;
};
