// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-09/page.tsx, ported with tooling/preset/port-block.mjs
// (imports, icons). The page shell — provider with its 350px sidebar width, sidebar, inset, sticky header with
// trigger, separator and breadcrumb — is upstream's markup and classes; the body is the mail reader (./reader).
// The root div carries data-template and the template's styles; it adds no box of its own to the layout.

import { AppSidebar } from "./app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@tyohnn/components/breadcrumb"
import { Separator } from "@tyohnn/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@tyohnn/components/sidebar"

import { NO_MOTION } from "../../coverage/frame"
import { Reader, READER_STYLE } from "./reader"

export function BlockInbox() {
  return (
    <div data-template="block-inbox">
      <style>{NO_MOTION}</style>
      <style>{READER_STYLE}</style>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "350px",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">All Inboxes</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Inbox</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <Reader />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
