// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-15/page.tsx, ported with tooling/preset/port-block.mjs
// (imports, icons). The page shell — provider, left sidebar, inset with its sticky header (trigger, separator,
// breadcrumb) and the right sidebar — is upstream's markup and classes with the meeting's title; the body is the
// notes (./notes). The root div carries data-template and the template's styles; it adds no box of its own.

import { SidebarLeft } from "./sidebar-left"
import { SidebarRight } from "./sidebar-right"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@tyohnn/components/breadcrumb"
import { Separator } from "@tyohnn/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@tyohnn/components/sidebar"

import { NO_MOTION } from "../../coverage/frame"
import { Notes, NOTES_STYLE } from "./notes"

export function BlockMeetingNotes() {
  return (
    <div data-template="block-meeting-notes">
      <style>{NO_MOTION}</style>
      <style>{NOTES_STYLE}</style>
      <SidebarProvider>
        <SidebarLeft />
        <SidebarInset>
          <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="line-clamp-1">
                      Weekly Product Sync — Notes
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <Notes />
        </SidebarInset>
        <SidebarRight />
      </SidebarProvider>
    </div>
  )
}
