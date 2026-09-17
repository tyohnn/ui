import {
    Clock,
    Download,
    Filter,
    Mail,
    MoreHorizontal,
    RefreshCw,
    Search,
    ShieldCheck,
    Sparkles,
    TriangleAlert,
    UserPlus,
    X,
} from "@tyohnn/icons";

import { Avatar, AvatarBadge, AvatarFallback } from "@tyohnn/components/avatar";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@tyohnn/components/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@tyohnn/components/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@tyohnn/components/input-group";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@tyohnn/components/item";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@tyohnn/components/field";
import { Progress, ProgressLabel, ProgressValue } from "@tyohnn/components/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@tyohnn/components/select";
import { Switch } from "@tyohnn/components/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tyohnn/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tyohnn/components/tabs";

import { INVITATIONS, type Member, MEMBERS, ROLES, SEATS } from "./data";

/**
 * The body of the team admin: page title and invite action, member tabs with the member table, and a side column
 * with seat usage and pending invitations. Fixed data, no time and no randomness. Layout utilities only; the title
 * band and small meta text read tokens in TEAM_STYLE. The table and the side column scroll inside the body.
 */

const ROLE_ITEMS = ROLES.map((role) => ({ value: role.value, label: role.label }));
const FILTER_ITEMS = [{ value: "all", label: "All roles" }, ...ROLE_ITEMS];

const RoleSelect = ({ member }: { member: Member }) => (
    <Select items={ROLE_ITEMS} defaultValue={member.role} disabled={member.you || member.disabled}>
        <SelectTrigger size="sm" aria-label={`Role for ${member.name}`} className="min-w-28">
            <SelectValue />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                {ROLES.map((role) => <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>)}
            </SelectGroup>
        </SelectContent>
    </Select>
);

const RowMenu = ({ member }: { member: Member }) => (
    <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" aria-label={`Actions for ${member.name}`} />}>
            <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuGroup>
                <DropdownMenuItem>View profile</DropdownMenuItem>
                <DropdownMenuItem>Reset two-factor</DropdownMenuItem>
                <DropdownMenuItem>Sign out everywhere</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Remove from workspace</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);

const PageTitle = () => (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="tm-title">Team members</h1>
            <span className="tm-meta">Manage who can use the Quillstone workspace and what they can change.</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm"><Download data-icon="inline-start" />Export CSV</Button>
            <Button size="sm"><UserPlus data-icon="inline-start" />Invite people</Button>
        </div>
    </div>
);

const MemberRow = ({ member }: { member: Member }) => (
    <TableRow>
        <TableCell>
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarFallback>{member.initials}</AvatarFallback>
                    {member.online && <AvatarBadge />}
                </Avatar>
                <div className="flex min-w-0 flex-col">
                    <span className="flex items-center gap-2">
                        {member.name}
                        {member.you && <Badge variant="secondary">You</Badge>}
                        {member.disabled && <Badge variant="outline">Suspended</Badge>}
                    </span>
                    <span className="tm-meta">{member.email}</span>
                </div>
            </div>
        </TableCell>
        <TableCell className="tm-nowrap">{member.team}</TableCell>
        <TableCell><RoleSelect member={member} /></TableCell>
        <TableCell className="tm-nowrap">{member.lastActive}</TableCell>
        <TableCell>
            {member.twoFactor
                ? <Badge variant="secondary"><ShieldCheck data-icon="inline-start" />Enabled</Badge>
                : <Badge variant="destructive"><TriangleAlert data-icon="inline-start" />Off</Badge>}
        </TableCell>
        <TableCell><RowMenu member={member} /></TableCell>
    </TableRow>
);

const MembersPanel = () => (
    <Card className="min-h-0 min-w-0 flex-1 gap-0 py-0">
        <Tabs defaultValue="members" className="min-h-0 flex-1 gap-0">
            <div className="tm-toolbar flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3">
                <TabsList>
                    <TabsTrigger value="members">Members<span className="tm-meta">18</span></TabsTrigger>
                    <TabsTrigger value="invitations">Invitations<span className="tm-meta">3</span></TabsTrigger>
                    <TabsTrigger value="roles">Roles<span className="tm-meta">5</span></TabsTrigger>
                </TabsList>
                <div className="flex flex-wrap items-center gap-2">
                    <InputGroup className="w-56">
                        <InputGroupAddon><Search /></InputGroupAddon>
                        <InputGroupInput aria-label="Search members" placeholder="Name or email" />
                    </InputGroup>
                    <Select items={FILTER_ITEMS} defaultValue="all">
                        <SelectTrigger size="sm" aria-label="Filter by role" className="min-w-32">
                            <Filter />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {FILTER_ITEMS.map((role) => <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>)}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <TabsContent value="members" className="min-h-0 overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Last active</TableHead>
                            <TableHead>Two-factor</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MEMBERS.map((member) => <MemberRow key={member.email} member={member} />)}
                    </TableBody>
                </Table>
            </TabsContent>
        </Tabs>
        <div className="tm-footer flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
            <span className="tm-meta">Showing 10 of 18 members · 3 without two-factor</span>
            <Button variant="outline" size="sm">Show all members</Button>
        </div>
    </Card>
);

const SeatsCard = () => (
    <Card size="sm" className="shrink-0">
        <CardHeader>
            <CardTitle>Seats</CardTitle>
            <CardDescription>{SEATS.renews}</CardDescription>
            <CardAction><Badge>{SEATS.plan}</Badge></CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
            <Progress value={(SEATS.used / SEATS.total) * 100}>
                <ProgressLabel>{SEATS.used} of {SEATS.total} seats used</ProgressLabel>
                <ProgressValue className="ml-auto" />
            </Progress>
            <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col"><span className="tm-figure">15</span><span className="tm-meta">Members</span></div>
                <div className="flex flex-col"><span className="tm-figure">3</span><span className="tm-meta">Invited</span></div>
                <div className="flex flex-col"><span className="tm-figure">7</span><span className="tm-meta">Available</span></div>
            </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
            <Button size="sm"><Sparkles data-icon="inline-start" />Upgrade plan</Button>
            <Button variant="ghost" size="sm">Add seats</Button>
        </CardFooter>
    </Card>
);

const SecurityCard = () => (
    <Card size="sm" className="shrink-0">
        <CardHeader>
            <CardTitle>Sign-in security</CardTitle>
            <CardDescription>Applies to every member of the workspace</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
            <Progress value={83}>
                <ProgressLabel>15 of 18 use two-factor</ProgressLabel>
                <ProgressValue className="ml-auto" />
            </Progress>
            <Field orientation="horizontal">
                <FieldContent>
                    <FieldLabel htmlFor="tm-require-2fa">Require two-factor</FieldLabel>
                    <FieldDescription>Members without it are asked at next sign-in</FieldDescription>
                </FieldContent>
                <Switch id="tm-require-2fa" />
            </Field>
        </CardContent>
    </Card>
);

const InvitationsCard = () => (
    <Card size="sm" className="shrink-0">
        <CardHeader>
            <CardTitle>Pending invitations</CardTitle>
            <CardDescription>Links expire after 7 days</CardDescription>
            <CardAction>
                <Button variant="ghost" size="icon-sm" aria-label="Invite people"><UserPlus /></Button>
            </CardAction>
        </CardHeader>
        <CardContent>
            <ItemGroup className="gap-2">
                {INVITATIONS.map((invitation) => (
                    <Item key={invitation.email} size="sm" variant="outline">
                        <ItemMedia variant="icon"><Mail /></ItemMedia>
                        <ItemContent className="min-w-0">
                            <ItemTitle className="w-full min-w-0"><span className="tm-truncate">{invitation.email}</span></ItemTitle>
                            <ItemDescription>{invitation.sent}</ItemDescription>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <Badge variant="outline">{invitation.role}</Badge>
                                <span className="tm-meta flex items-center gap-1"><Clock />{invitation.expires}</span>
                            </div>
                        </ItemContent>
                        <ItemActions className="flex-col">
                            <Button variant="ghost" size="icon-xs" aria-label={`Resend to ${invitation.email}`}><RefreshCw /></Button>
                            <Button variant="ghost" size="icon-xs" aria-label={`Revoke ${invitation.email}`}><X /></Button>
                        </ItemActions>
                    </Item>
                ))}
            </ItemGroup>
        </CardContent>
    </Card>
);

// [contain:inline-size]: the table's width never widens SidebarInset (upstream markup, no min-w-0) past the viewport.
// The height is the viewport below the site header and its 1px bottom border, so the sidebar row keeps upstream's height.
export const Team = () => (
    <div className="flex h-[calc(100svh-var(--header-height)-1px)] min-h-0 flex-col gap-4 p-4 [contain:inline-size]">
        <PageTitle />
        <div className="flex min-h-0 flex-1 flex-wrap gap-4 xl:flex-nowrap">
            <MembersPanel />
            <div className="flex min-h-0 w-full flex-col gap-4 overflow-y-auto xl:w-80 xl:shrink-0">
                <SeatsCard />
                <InvitationsCard />
                <SecurityCard />
            </div>
        </div>
    </div>
);

/** The template's own stylesheet: system tokens only (title, meta text, figures, dividers). */
export const TEAM_STYLE = `
[data-template="block-team"] .tm-title { margin: 0; font-family: var(--font-heading); font-size: var(--ui-text-lg); line-height: var(--ui-line-height-lg); font-weight: 600; color: var(--foreground); }
[data-template="block-team"] .tm-meta { font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); font-variant-numeric: tabular-nums; white-space: nowrap; }
[data-template="block-team"] .tm-meta svg { width: 14px; height: 14px; flex-shrink: 0; }
[data-template="block-team"] .tm-figure { font-family: var(--font-heading); font-size: var(--ui-text-lg); line-height: var(--ui-line-height-lg); font-weight: 600; font-variant-numeric: tabular-nums; color: var(--foreground); }
[data-template="block-team"] .tm-nowrap { white-space: nowrap; }
[data-template="block-team"] .tm-truncate { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
[data-template="block-team"] .tm-toolbar { border-bottom: 1px solid var(--border); }
[data-template="block-team"] .tm-footer { border-top: 1px solid var(--border); }
`;
