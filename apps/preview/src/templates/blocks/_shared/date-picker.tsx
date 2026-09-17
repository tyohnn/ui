// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-{12,15}/components/date-picker.tsx, identical in those blocks.
// Ported with tooling/preset/port-block.mjs (imports, icons); a fixed date instead of new Date() (templates render the same every time). Markup and classes are upstream's.

import * as React from "react"

import { Calendar } from "@tyohnn/components/calendar"

import { BLOCK_TODAY } from "./today"
import {
  SidebarGroup,
  SidebarGroupContent,
} from "@tyohnn/components/sidebar"

export function DatePicker() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(BLOCK_TODAY.getFullYear(), BLOCK_TODAY.getMonth(), 12)
  )
  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          captionLayout="dropdown"
          today={BLOCK_TODAY}
          defaultMonth={BLOCK_TODAY}
          className="bg-transparent [--cell-size:2.1rem]"
        />
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
