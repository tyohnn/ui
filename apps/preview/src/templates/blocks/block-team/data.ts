/** The team page's fixed data: Quillstone (a fictional company) and its workspace members on 2026-01-14. */

export const ROLES = [
    { value: "owner", label: "Owner", description: "Full access, including billing and deletion" },
    { value: "admin", label: "Admin", description: "Manage members, security and integrations" },
    { value: "member", label: "Member", description: "Create and edit projects they belong to" },
    { value: "billing", label: "Billing", description: "Invoices, payment methods and plan" },
    { value: "viewer", label: "Viewer", description: "Read-only access to shared projects" },
] as const;

export type RoleValue = (typeof ROLES)[number]["value"];

export type Member = {
    name: string;
    initials: string;
    email: string;
    role: RoleValue;
    team: string;
    lastActive: string;
    online?: boolean;
    twoFactor: boolean;
    you?: boolean;
    disabled?: boolean;
};

export const MEMBERS: Member[] = [
    { name: "Nadia Brooks", initials: "NB", email: "nadia@quillstone.co", role: "owner", team: "Leadership", lastActive: "Active now", online: true, twoFactor: true, you: true },
    { name: "Samuel Achebe", initials: "SA", email: "samuel@quillstone.co", role: "admin", team: "Platform", lastActive: "Active now", online: true, twoFactor: true },
    { name: "Mei Lin Zhou", initials: "MZ", email: "meilin@quillstone.co", role: "admin", team: "Design team", lastActive: "12 min ago", twoFactor: true },
    { name: "Rafael Ortega", initials: "RO", email: "rafael@quillstone.co", role: "member", team: "Growth", lastActive: "1 hour ago", twoFactor: false },
    { name: "Ingrid Solberg", initials: "IS", email: "ingrid@quillstone.co", role: "member", team: "Design team", lastActive: "3 hours ago", twoFactor: true },
    { name: "Tariq Haddad", initials: "TH", email: "tariq@quillstone.co", role: "billing", team: "Finance", lastActive: "Yesterday", twoFactor: true },
    { name: "Lena Fischer", initials: "LF", email: "lena@quillstone.co", role: "member", team: "Field sales", lastActive: "Yesterday", twoFactor: false },
    { name: "Kwame Mensah", initials: "KM", email: "kwame@quillstone.co", role: "member", team: "Platform", lastActive: "Jan 12", twoFactor: true },
    { name: "Aiko Tanaka", initials: "AT", email: "aiko@quillstone.co", role: "viewer", team: "Legal", lastActive: "Jan 9", twoFactor: true },
    { name: "Diego Ferreira", initials: "DF", email: "diego@quillstone.co", role: "member", team: "Growth", lastActive: "Dec 18", twoFactor: false, disabled: true },
];

export const INVITATIONS = [
    { email: "hannah.wright@quillstone.co", role: "Member", sent: "Sent Jan 13 by Samuel", expires: "Expires in 6 days" },
    { email: "omar.farouk@quillstone.co", role: "Admin", sent: "Sent Jan 11 by Nadia", expires: "Expires in 4 days" },
    { email: "contractor@lanternworks.co", role: "Viewer", sent: "Sent Jan 8 by Mei Lin", expires: "Expires tomorrow" },
];

export const SEATS = { used: 18, total: 25, plan: "Business", renews: "Renews Mar 1 · $24 per seat monthly" };
