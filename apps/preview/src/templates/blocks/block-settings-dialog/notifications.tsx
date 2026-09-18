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
/* ⚠ 힌트는 스위치와 **닿기 전에** 줄인다. 폭을 막아 두지 않으면 글꼴이 조금만 넓어져도
   (다른 시스템의 sans, 한글 폴백) 마지막 낱말이 스위치 밑으로 들어간 것처럼 보인다 —
   ellipsis 는 자리가 없을 때만 걸리므로, 자리를 절반 조금 넘게 못 박아 항상 여백이 남게 한다. */
[data-template-part="block-settings-dialog"] .sd-hint { flex: 0 1 auto; min-width: 0; max-width: 56%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: right; }
[data-template-part="block-settings-dialog"] .sd-table { overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-lg); }
/* ⚠ 붙박이 푸터는 면의 색을 **다시 적지 않는다**. --popover 를 리터럴처럼 박아 두면 면이 불투명한
   시스템에서는 맞아떨어지지만, 떠 있는 면이 유리인 시스템(cirrus)에서는 유리 패널 위에 불투명한
   흰 띠가 얹힌다(2026-09-18 실측: 다이얼로그 oklab(1 0 0 / 0.76) vs 푸터 oklch(1 0 0)).
   그래서 면과 같은 채움을 폴백으로 읽고, 유리일 때만 자기 흐림을 갖는다 —
   패널의 흐림은 "패널 뒤"를, 푸터의 흐림은 "푸터 뒤로 흐르는 본문"을 가린다(서로 다른 바닥이다).
   --glass-fill 이 없는 시스템에서는 var() 가 --popover 로 떨어지고 필터도 none 이라 화면이 같다. */
[data-template-part="block-settings-dialog"] .sd-footer { border-top: 1px solid var(--border); background-color: var(--glass-fill, var(--popover)); }

@supports (backdrop-filter: blur(1px)) {
    [data-template-part="block-settings-dialog"] .sd-footer { backdrop-filter: var(--glass-filter, none); }
}
`;
