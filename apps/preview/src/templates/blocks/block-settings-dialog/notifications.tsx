import { Moon } from "@tyohnn/icons";

import { CheckboxMatrix } from "@tyohnn/blocks/checkbox-matrix";
import { FormFooter } from "@tyohnn/blocks/form-footer";
import { RadioCards } from "@tyohnn/blocks/radio-cards";
import { SelectField } from "@tyohnn/blocks/select-field";
import { SettingsSection } from "@tyohnn/blocks/settings-section";
import { SwitchField } from "@tyohnn/blocks/switch-field";
import { SwitchRow } from "@tyohnn/blocks/switch-row";
import { Button } from "@tyohnn/components/button";
import { FieldDescription, FieldGroup, FieldSeparator } from "@tyohnn/components/field";

import { LOADING } from "../../loading";
import { ACTIVITY_SWITCHES, CHANNEL_ROWS, CHANNELS, EMAIL_FREQUENCY, HOURS } from "./data";

/**
 * The dialog's body: notification settings — activity switches, the email digest frequency, quiet hours and a
 * per-channel matrix, with a footer that stays at the bottom of the scrolling pane. Fixed data. The form is
 * composed from blocks (registry/blocks); which settings exist and their words are the app's own and stay here.
 * The footer sits over the pane's bottom padding (`p-4` in ./settings-dialog), hence `-bottom-4 pb-4`.
 */
export const NotificationSettings = () => (
    <div className="flex flex-col gap-6">
        <SettingsSection title="Activity" description="Choose what reaches you in Parley. Muted channels never notify.">
            <FieldGroup className="gap-3">
                {ACTIVITY_SWITCHES.map((item) => <SwitchRow loading={LOADING} key={item.id} id={item.id} label={item.label} hint={item.description} defaultChecked={item.on} />)}
            </FieldGroup>
        </SettingsSection>

        <FieldSeparator />

        <SettingsSection title="Email" description="Unread notifications are sent to dana.whitfield@northvale.io.">
            <RadioCards loading={LOADING} id="sd-email" label="Email frequency" options={EMAIL_FREQUENCY} defaultValue="hourly" />
        </SettingsSection>

        <FieldSeparator />

        <SettingsSection title="Quiet hours">
            <FieldGroup className="gap-4">
                <SwitchField
                    loading={LOADING}
                    id="sd-quiet"
                    icon={<Moon />}
                    label="Pause notifications overnight"
                    description="Calls and messages from starred people still come through"
                    defaultChecked
                />
                <div className="grid grid-cols-2 gap-3">
                    <SelectField loading={LOADING} id="sd-quiet-from" label="From" name="Quiet hours start" options={HOURS} defaultValue="22:00" />
                    <SelectField loading={LOADING} id="sd-quiet-to" label="To" name="Quiet hours end" options={HOURS} defaultValue="07:00" />
                </div>
                <FieldDescription>Times are in your workspace time zone, Europe/Lisbon (UTC+00:00).</FieldDescription>
            </FieldGroup>
        </SettingsSection>

        <FieldSeparator />

        <SettingsSection title="Channels" description="Where each kind of notification is delivered.">
            <CheckboxMatrix
                loading={LOADING}
                rowHeader="Event"
                columns={CHANNELS}
                rows={CHANNEL_ROWS.map((row) => ({ label: row.event, checked: row.on }))}
                cellLabel={(event, channel) => `${event} · ${channel}`}
            />
        </SettingsSection>

        <FormFooter note="Last saved Jan 12, 2026" className="-bottom-4 -mt-2 pb-4">
            <Button variant="outline" size="sm">Cancel</Button>
            <Button size="sm">Save changes</Button>
        </FormFooter>
    </div>
);
