// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-13/page.tsx, ported with tooling/preset/port-block.mjs
// (imports). Upstream's page is an empty full-height row holding the dialog's trigger; here the page behind the open
// dialog is a simple team chat screen (ours, not compared: it has no sidebar and no <header>), and the trigger sits in
// its top bar. The dialog itself (./settings-dialog) is upstream's and opens on load.

import { Hash, Paperclip, Search, Send, Smile } from "@tyohnn/icons";

import { Avatar, AvatarFallback } from "@tyohnn/components/avatar";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@tyohnn/components/input-group";
import { Separator } from "@tyohnn/components/separator";

import { NoMotion } from "../../coverage/frame";
import { SETTINGS_STYLE } from "./notifications";
import { SettingsDialog } from "./settings-dialog";

const CHANNELS = [
    { name: "general", unread: 0 },
    { name: "design-crit", unread: 4 },
    { name: "launch-room", unread: 12, active: true },
    { name: "support-escalations", unread: 2 },
    { name: "random", unread: 0 },
] as const;

const MESSAGES = [
    { initials: "DW", name: "Dana Whitfield", time: "09:02", text: "Morning! Release notes for 4.2 are in the doc — can someone from support skim the FAQ section before 11?" },
    { initials: "OB", name: "Omar Benali", time: "09:07", text: "On it. The export limits paragraph still says 10k rows, it is 50k since last week." },
    { initials: "SK", name: "Sofia Kowalczyk", time: "09:15", text: "Staging is green. I will flip the rollout to 10% at 13:00 unless anyone objects." },
    { initials: "DW", name: "Dana Whitfield", time: "09:21", text: "Sounds good. Muting this channel after lunch so I can finish the pricing page." },
] as const;

const Page = () => (
    <div className="flex h-svh flex-col">
        <div className="flex h-14 shrink-0 items-center gap-3 px-4">
            <span className="sd-brand">Parley</span>
            <Separator orientation="vertical" className="data-vertical:h-5 data-vertical:self-auto" />
            <span className="sd-page-meta">Northvale workspace</span>
            <div className="ml-auto flex items-center gap-2">
                <InputGroup className="w-64">
                    <InputGroupAddon><Search /></InputGroupAddon>
                    <InputGroupInput aria-label="Search" placeholder="Search messages" />
                </InputGroup>
                <SettingsDialog />
                <Avatar size="sm">
                    <AvatarFallback>DW</AvatarFallback>
                </Avatar>
            </div>
        </div>
        <Separator />
        <div className="flex min-h-0 flex-1">
            <nav className="sd-channels flex w-60 shrink-0 flex-col gap-1 p-3" aria-label="Channels">
                {CHANNELS.map((channel) => (
                    <Button key={channel.name} variant={"active" in channel ? "secondary" : "ghost"} size="sm" className="justify-start">
                        <Hash data-icon="inline-start" />
                        {channel.name}
                        {channel.unread ? <Badge variant="secondary" className="ml-auto">{channel.unread}</Badge> : null}
                    </Button>
                ))}
            </nav>
            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-6">
                    {MESSAGES.map((message) => (
                        <div key={message.time} className="flex gap-3">
                            <Avatar>
                                <AvatarFallback>{message.initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex min-w-0 flex-col gap-1">
                                <span className="sd-page-meta"><strong>{message.name}</strong> · {message.time}</span>
                                <p className="sd-text">{message.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4">
                    <InputGroup>
                        <InputGroupInput aria-label="Message" placeholder="Message #launch-room" />
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton size="icon-xs" aria-label="Attach"><Paperclip /></InputGroupButton>
                            <InputGroupButton size="icon-xs" aria-label="Emoji"><Smile /></InputGroupButton>
                            <InputGroupButton size="icon-xs" variant="default" aria-label="Send"><Send /></InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </div>
        </div>
    </div>
);

const PAGE_STYLE = `
[data-template="block-settings-dialog"] .sd-brand { font-weight: 600; font-size: var(--ui-text-lg); line-height: var(--ui-line-height-lg); }
[data-template="block-settings-dialog"] .sd-page-meta { font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); }
[data-template="block-settings-dialog"] .sd-page-meta strong { color: var(--foreground); font-weight: 600; }
[data-template="block-settings-dialog"] .sd-text { margin: 0; font-size: var(--ui-text-md); line-height: var(--ui-line-height-md); }
[data-template="block-settings-dialog"] .sd-channels { border-right: 1px solid var(--border); }
`;

export function BlockSettingsDialog() {
    return (
        <div data-template="block-settings-dialog">
            <NoMotion />
            <style>{PAGE_STYLE}</style>
            <style>{SETTINGS_STYLE}</style>
            <Page />
        </div>
    );
}
