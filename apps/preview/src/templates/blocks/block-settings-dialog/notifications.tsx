import { Moon } from "@tyohnn/icons";

import { Button } from "@tyohnn/components/button";
import { Checkbox } from "@tyohnn/components/checkbox";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
    FieldTitle,
} from "@tyohnn/components/field";
import { RadioGroup, RadioGroupItem } from "@tyohnn/components/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@tyohnn/components/select";
import { Switch } from "@tyohnn/components/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tyohnn/components/table";

import { ACTIVITY_SWITCHES, CHANNEL_ROWS, CHANNELS, EMAIL_FREQUENCY, HOURS } from "./data";

/**
 * The dialog's body: notification settings — activity switches, the email digest frequency, quiet hours and a
 * per-channel matrix, with a footer that stays at the bottom of the scrolling pane. Fixed data, layout utilities
 * only. The dialog renders in a portal outside the template root, so SETTINGS_STYLE scopes its rules under
 * `[data-template-part="block-settings-dialog"]` on this body (tokens only).
 */

const HOUR_ITEMS = HOURS.map((hour) => ({ value: hour, label: hour }));

const HourSelect = ({ id, value, label }: { id: string; value: string; label: string }) => (
    <Select items={HOUR_ITEMS} defaultValue={value}>
        <SelectTrigger id={id} aria-label={label} className="w-full">
            <SelectValue />
        </SelectTrigger>
        <SelectContent>
            {HOURS.map((hour) => <SelectItem key={hour} value={hour}>{hour}</SelectItem>)}
        </SelectContent>
    </Select>
);

export const NotificationSettings = () => (
    <div data-template-part="block-settings-dialog" className="flex flex-col gap-6">
        <FieldSet>
            <FieldLegend>Activity</FieldLegend>
            <FieldDescription>Choose what reaches you in Parley. Muted channels never notify.</FieldDescription>
            <FieldGroup className="gap-3">
                {ACTIVITY_SWITCHES.map((item) => (
                    <Field key={item.id} orientation="horizontal">
                        <FieldLabel htmlFor={item.id}>{item.label}</FieldLabel>
                        <span className="sd-meta sd-hint">{item.description}</span>
                        <Switch id={item.id} defaultChecked={item.on} />
                    </Field>
                ))}
            </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        <FieldSet>
            <FieldLegend>Email</FieldLegend>
            <FieldDescription>Unread notifications are sent to dana.whitfield@northvale.io.</FieldDescription>
            <RadioGroup defaultValue="hourly" aria-label="Email frequency" className="grid grid-cols-2 gap-3">
                {EMAIL_FREQUENCY.map((option) => (
                    <FieldLabel key={option.value} htmlFor={`sd-email-${option.value}`}>
                        <Field orientation="horizontal">
                            <RadioGroupItem id={`sd-email-${option.value}`} value={option.value} />
                            <FieldContent>
                                <FieldTitle>{option.label}</FieldTitle>
                                <FieldDescription>{option.description}</FieldDescription>
                            </FieldContent>
                        </Field>
                    </FieldLabel>
                ))}
            </RadioGroup>
        </FieldSet>

        <FieldSeparator />

        <FieldSet>
            <FieldLegend>Quiet hours</FieldLegend>
            <FieldGroup className="gap-4">
                <Field orientation="horizontal">
                    <FieldContent>
                        <FieldLabel htmlFor="sd-quiet">
                            <Moon className="sd-icon" />
                            Pause notifications overnight
                        </FieldLabel>
                        <FieldDescription>Calls and messages from starred people still come through</FieldDescription>
                    </FieldContent>
                    <Switch id="sd-quiet" defaultChecked />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field>
                        <FieldLabel htmlFor="sd-quiet-from">From</FieldLabel>
                        <HourSelect id="sd-quiet-from" value="22:00" label="Quiet hours start" />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="sd-quiet-to">To</FieldLabel>
                        <HourSelect id="sd-quiet-to" value="07:00" label="Quiet hours end" />
                    </Field>
                </div>
                <FieldDescription>Times are in your workspace time zone, Europe/Lisbon (UTC+00:00).</FieldDescription>
            </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        <FieldSet>
            <FieldLegend>Channels</FieldLegend>
            <FieldDescription>Where each kind of notification is delivered.</FieldDescription>
            <div className="sd-table">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Event</TableHead>
                            {CHANNELS.map((channel) => <TableHead key={channel} className="w-20 text-center">{channel}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {CHANNEL_ROWS.map((row) => (
                            <TableRow key={row.event}>
                                <TableCell>{row.event}</TableCell>
                                {CHANNELS.map((channel, index) => (
                                    <TableCell key={channel} className="text-center">
                                        <Checkbox defaultChecked={row.on[index]} aria-label={`${row.event} · ${channel}`} />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </FieldSet>

        <div className="sd-footer sticky -bottom-4 -mt-2 flex flex-wrap items-center justify-between gap-2 pt-3 pb-4">
            <span className="sd-meta">Last saved Jan 12, 2026</span>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Cancel</Button>
                <Button size="sm">Save changes</Button>
            </div>
        </div>
    </div>
);

/** Scoped to the dialog body (it renders in a portal, outside the template root). Tokens only. */
export const SETTINGS_STYLE = `
[data-template-part="block-settings-dialog"] .sd-icon { width: 14px; height: 14px; flex-shrink: 0; }
[data-template-part="block-settings-dialog"] .sd-meta { font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); }
[data-template-part="block-settings-dialog"] .sd-hint { flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: right; }
[data-template-part="block-settings-dialog"] .sd-table { overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-lg); }
[data-template-part="block-settings-dialog"] .sd-footer { border-top: 1px solid var(--border); background-color: var(--popover); }
`;
