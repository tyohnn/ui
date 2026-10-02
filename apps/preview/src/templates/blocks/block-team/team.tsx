import { Clock, Download, Filter, Mail, RefreshCw, ShieldCheck, Sparkles, TriangleAlert, UserPlus, X } from "@tyohnn/icons";

import { ActionItemList } from "@tyohnn/blocks/action-item-list";
import { CompactSelect } from "@tyohnn/blocks/compact-select";
import { DataTable, type DataTableColumn } from "@tyohnn/blocks/data-table";
import { FigureRow } from "@tyohnn/blocks/figure-row";
import { IconMeta } from "@tyohnn/blocks/icon-meta";
import { InfoCard } from "@tyohnn/blocks/info-card";
import { Page } from "@tyohnn/blocks/page";
import { PageHeading } from "@tyohnn/blocks/page-heading";
import { PageAside, PageSplit } from "@tyohnn/blocks/page-split";
import { Person } from "@tyohnn/blocks/person";
import { RowMenu } from "@tyohnn/blocks/row-menu";
import { SwitchField } from "@tyohnn/blocks/switch-field";
import { TabCard } from "@tyohnn/blocks/tab-card";
import { TableSearch } from "@tyohnn/blocks/table-search";
import { UsageMeter } from "@tyohnn/blocks/usage-meter";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";

import { INVITATIONS, type Member, MEMBERS, ROLES, SEATS } from "./data";

/**
 * The body of the team admin: page title and invite action, member tabs with the member table, and a side column
 * with seat usage and pending invitations. Fixed data, no time and no randomness. The screen is composed from
 * blocks (registry/blocks); the columns, the roles and the row actions are the workspace's own and stay here.
 * The table and the side column scroll inside the body.
 */

const ROLE_ITEMS = ROLES.map((role) => ({ value: role.value, label: role.label }));
const FILTER_ITEMS = [{ value: "all", label: "All roles" }, ...ROLE_ITEMS];

const ROW_ACTIONS = [
    [{ label: "View profile" }, { label: "Reset two-factor" }, { label: "Sign out everywhere" }],
    [{ label: "Remove from workspace", variant: "destructive" }],
] as const;

const COLUMNS: DataTableColumn<Member>[] = [
    {
        id: "member",
        header: "Member",
        cell: (member) => (
            <Person
                size="md"
                name={member.name}
                detail={member.email}
                initials={member.initials}
                online={member.online}
                badges={(
                    <>
                        {member.you && <Badge variant="secondary">You</Badge>}
                        {member.disabled && <Badge variant="outline">Suspended</Badge>}
                    </>
                )}
            />
        ),
    },
    { id: "team", header: "Team", kind: "nowrap", cell: (member) => member.team },
    {
        id: "role",
        header: "Role",
        cell: (member) => <CompactSelect label={`Role for ${member.name}`} options={ROLE_ITEMS} defaultValue={member.role} disabled={member.you || member.disabled} className="min-w-28" />,
    },
    { id: "last-active", header: "Last active", kind: "nowrap", cell: (member) => member.lastActive },
    {
        id: "two-factor",
        header: "Two-factor",
        cell: (member) => member.twoFactor
            ? <Badge variant="secondary"><ShieldCheck data-icon="inline-start" />Enabled</Badge>
            : <Badge variant="destructive"><TriangleAlert data-icon="inline-start" />Off</Badge>,
    },
    { id: "actions", header: "Actions", hidden: true, cell: (member) => <RowMenu label={`Actions for ${member.name}`} groups={ROW_ACTIONS} /> },
];

const MembersPanel = () => (
    <TabCard
        defaultTab="members"
        tabs={[
            { value: "members", label: "Members", count: "18", content: <DataTable columns={COLUMNS} rows={MEMBERS} rowId={(member) => member.email} /> },
            { value: "invitations", label: "Invitations", count: "3" },
            { value: "roles", label: "Roles", count: "5" },
        ]}
        controls={(
            <>
                <TableSearch label="Search members" placeholder="Name or email" />
                <CompactSelect label="Filter by role" icon={<Filter />} options={FILTER_ITEMS} defaultValue="all" className="min-w-32" />
            </>
        )}
        summary="Showing 10 of 18 members · 3 without two-factor"
        footerAction={<Button variant="outline" size="sm">Show all members</Button>}
    />
);

const SeatsCard = () => (
    <InfoCard
        title="Seats"
        description={SEATS.renews}
        action={<Badge>{SEATS.plan}</Badge>}
        contentClassName="flex flex-col gap-4"
        footer={(
            <>
                <Button size="sm"><Sparkles data-icon="inline-start" />Upgrade plan</Button>
                <Button variant="ghost" size="sm">Add seats</Button>
            </>
        )}
    >
        <UsageMeter value={(SEATS.used / SEATS.total) * 100} label={<>{SEATS.used} of {SEATS.total} seats used</>} />
        <FigureRow figures={[{ value: "15", label: "Members" }, { value: "3", label: "Invited" }, { value: "7", label: "Available" }]} />
    </InfoCard>
);

const SecurityCard = () => (
    <InfoCard title="Sign-in security" description="Applies to every member of the workspace" contentClassName="flex flex-col gap-4">
        <UsageMeter value={83} label="15 of 18 use two-factor" />
        <SwitchField id="tm-require-2fa" label="Require two-factor" description="Members without it are asked at next sign-in" />
    </InfoCard>
);

const InvitationsCard = () => (
    <InfoCard
        title="Pending invitations"
        description="Links expire after 7 days"
        action={<Button variant="ghost" size="icon-sm" aria-label="Invite people"><UserPlus /></Button>}
    >
        <ActionItemList
            items={INVITATIONS.map((invitation) => ({
                id: invitation.email,
                icon: <Mail />,
                title: invitation.email,
                description: invitation.sent,
                extra: (
                    <>
                        <Badge variant="outline">{invitation.role}</Badge>
                        <IconMeta icon={<Clock />}>{invitation.expires}</IconMeta>
                    </>
                ),
                actions: (
                    <>
                        <Button variant="ghost" size="icon-xs" aria-label={`Resend to ${invitation.email}`}><RefreshCw /></Button>
                        <Button variant="ghost" size="icon-xs" aria-label={`Revoke ${invitation.email}`}><X /></Button>
                    </>
                ),
            }))}
        />
    </InfoCard>
);

// [contain:inline-size]: the table's width never widens SidebarInset (upstream markup, no min-w-0) past the viewport.
// Page takes the height the inset has under the site header, so the sidebar row keeps upstream's height.
export const Team = () => (
    <Page scroll="regions">
        <PageHeading
            title="Team members"
            meta="Manage who can use the Quillstone workspace and what they can change."
            actions={(
                <>
                    <Button variant="outline" size="sm"><Download data-icon="inline-start" />Export CSV</Button>
                    <Button size="sm"><UserPlus data-icon="inline-start" />Invite people</Button>
                </>
            )}
        />
        <PageSplit>
            <MembersPanel />
            <PageAside width="md" scroll>
                <SeatsCard />
                <InvitationsCard />
                <SecurityCard />
            </PageAside>
        </PageSplit>
    </Page>
);
